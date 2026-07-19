import express from 'express';
import { google } from 'googleapis';
import Event from '../models/Event.js';
import User from '../models/User.js';
import { encryptToken } from '../utils/encryption.js';

const router = express.Router();

// ─── Cookie settings ──────────────────────────────────────────────────────────
const isProd = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
const COOKIE_NAME = 'session_id';
const getCookieOptions = () => ({
  httpOnly: true,
  sameSite: isProd ? 'none' : 'lax',
  secure: isProd,
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});

// ─── Username-only Auth ───────────────────────────────────────────────────────

/**
 * POST /api/auth/login
 * Body: { name: string }
 * Creates a new User with a random sessionId and sets it as an httpOnly cookie.
 */
router.post('/login', async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Display name is required.' });
  }
  try {
    const sessionId = crypto.randomUUID();
    const user = new User({ name: name.trim(), sessionId });
    await user.save();

    res.cookie(COOKIE_NAME, sessionId, getCookieOptions());
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email || '',
      bio: user.bio,
      role: user.role,
      company: user.company,
      location: user.location,
      avatar: user.avatar,
      createdAt: user.createdAt
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Could not create session.' });
  }
});

/**
 * GET /api/auth/me
 * Returns the current user from the session cookie, or 401.
 */
router.get('/me', async (req, res) => {
  const sessionId = req.cookies?.[COOKIE_NAME];
  if (!sessionId) return res.status(401).json({ message: 'Not authenticated.' });
  try {
    const user = await User.findOne({ sessionId });
    if (!user) return res.status(401).json({ message: 'Session invalid.' });
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email || '',
      bio: user.bio,
      role: user.role,
      company: user.company,
      location: user.location,
      avatar: user.avatar,
      createdAt: user.createdAt
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

/**
 * PATCH /api/auth/me
 * Updates the current user's profile fields.
 * Body: { name?, email?, bio?, role?, company?, location?, avatar? }
 */
router.patch('/me', async (req, res) => {
  const sessionId = req.cookies?.[COOKIE_NAME];
  if (!sessionId) return res.status(401).json({ message: 'Not authenticated.' });
  try {
    const user = await User.findOne({ sessionId });
    if (!user) return res.status(401).json({ message: 'Session invalid.' });

    const { name, email, bio, role, company, location, avatar } = req.body;
    if (name !== undefined) user.name = name.trim() || user.name;
    if (email !== undefined) user.email = email;
    if (bio !== undefined) user.bio = bio;
    if (role !== undefined) user.role = role;
    if (company !== undefined) user.company = company;
    if (location !== undefined) user.location = location;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email || '',
      bio: user.bio,
      role: user.role,
      company: user.company,
      location: user.location,
      avatar: user.avatar,
      createdAt: user.createdAt
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

/**
 * POST /api/auth/logout
 * Clears the session cookie.
 */
router.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME, getCookieOptions());
  res.json({ message: 'Logged out.' });
});

// ─── Google Drive OAuth ───────────────────────────────────────────────────────

// Helper: Verify all required OAuth environment variables exist
const checkRequiredOAuthEnvVars = (res) => {
  const missing = [];
  if (!process.env.GOOGLE_CLIENT_ID) missing.push('GOOGLE_CLIENT_ID');
  if (!process.env.GOOGLE_CLIENT_SECRET) missing.push('GOOGLE_CLIENT_SECRET');
  if (!process.env.GOOGLE_API_KEY) missing.push('GOOGLE_API_KEY');
  if (!process.env.MONGODB_URI) missing.push('MONGODB_URI');

  if (missing.length > 0) {
    const errorMsg = `[OAuth Error] Missing required environment variable(s): ${missing.join(', ')}`;
    console.error(errorMsg);
    res.status(500).json({
      error: 'ENVIRONMENT_VARIABLE_MISSING',
      message: errorMsg,
      missing
    });
    return false;
  }
  return true;
};

// Helper: Build dynamic OAuth2 client using SERVER_BASE_URL or request headers
const getOAuth2Client = (req) => {
  const protocol = req ? (req.headers['x-forwarded-proto'] || req.protocol || 'https') : 'https';
  const host = req ? (req.headers['x-forwarded-host'] || req.headers.host) : '';
  const serverBaseUrl = process.env.SERVER_BASE_URL || (host ? `${protocol}://${host}` : '');

  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${serverBaseUrl}/api/auth/google/callback`
  );
};

// Helper: extract Google Drive folder ID from URL or plain ID
const extractDriveFolderId = (urlOrId) => {
  if (!urlOrId) return null;
  const match = urlOrId.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  const idMatch = urlOrId.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch) return idMatch[1];
  if (/^[a-zA-Z0-9_-]{10,}$/.test(urlOrId.trim())) return urlOrId.trim();
  return null;
};

/**
 * GET /api/auth/google?roomCode=ROOM_CODE
 * Initiates Google OAuth2 flow. Redirects to Google consent page.
 */
router.get('/google', (req, res) => {
  try {
    if (!checkRequiredOAuthEnvVars(res)) return;

    const { roomCode, title, hostName, hostAvatar, resourcesDriveUrl, driveFolderId } = req.query;

    if (!roomCode) {
      const msg = '[OAuth Error] Missing roomCode query parameter.';
      console.error(msg);
      return res.status(400).json({ error: 'MISSING_ROOM_CODE', message: msg });
    }

    const oauth2Client = getOAuth2Client(req);
    const scopes = [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ];

    const stateData = JSON.stringify({
      roomCode,
      title: title || 'Room ' + roomCode,
      hostName: hostName || 'Organizer',
      hostAvatar: hostAvatar || '',
      resourcesDriveUrl: resourcesDriveUrl || '',
      driveFolderId: driveFolderId || ''
    });

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: scopes,
      state: Buffer.from(stateData).toString('base64')
    });

    res.redirect(authUrl);
  } catch (error) {
    console.error('[Google OAuth Initiation Error]:', error);
    res.status(500).json({
      error: 'OAUTH_INIT_FAILED',
      message: `Failed to initiate Google OAuth: ${error.message}`
    });
  }
});

/**
 * GET /api/auth/google/callback
 * Google redirects here after user approves. Exchange code for tokens.
 */
router.get('/google/callback', async (req, res) => {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const clientBaseUrl = process.env.CLIENT_URL || process.env.SERVER_BASE_URL || `${protocol}://${host}`;

  try {
    if (!checkRequiredOAuthEnvVars(res)) return;

    const { code, state: stateB64, error } = req.query;

    let roomCode = '';
    let roomMeta = {};
    try {
      const decoded = JSON.parse(Buffer.from(stateB64 || '', 'base64').toString('utf8'));
      roomCode = decoded.roomCode || '';
      roomMeta = decoded;
    } catch (_) {
      roomCode = stateB64 || '';
    }

    if (error) {
      console.error('[Google OAuth Callback User Denied]:', error);
      return res.redirect(`${clientBaseUrl}/rooms/${roomCode}/media?oauth=denied`);
    }

    if (!code || !roomCode) {
      const msg = '[Google OAuth Callback Error] Missing authorization code or roomCode.';
      console.error(msg);
      return res.status(400).json({ error: 'MISSING_CODE_OR_ROOM', message: msg });
    }

    const oauth2Client = getOAuth2Client(req);
    const { tokens } = await oauth2Client.getToken(code);
    const { access_token, refresh_token } = tokens;

    console.log('[Google OAuth Tokens Received Successfully] Room:', roomCode, {
      hasAccessToken: Boolean(access_token),
      hasRefreshToken: Boolean(refresh_token)
    });

    let event = await Event.findOne({ code: roomCode });
    if (!event) {
      try {
        event = new Event({
          code: roomCode,
          title: roomMeta.title || 'Room ' + roomCode,
          description: roomMeta.description || 'Interactive event room for ' + roomCode,
          hostName: roomMeta.hostName || 'Organizer',
          hostAvatar: roomMeta.hostAvatar || '',
          resourcesDriveUrl: roomMeta.resourcesDriveUrl || '',
          driveFolderId: roomMeta.driveFolderId || '',
          template: roomMeta.template || 'Networking',
          visibility: 'Public',
          joinMode: 'Open',
          dateTime: new Date()
        });
        await event.save();
        console.log('[Google OAuth] Created new DB event for room:', roomCode);
      } catch (createErr) {
        console.error('[Google OAuth DB Creation Error]:', createErr);
        return res.status(500).json({ error: 'DB_CREATE_EVENT_FAILED', message: createErr.message });
      }
    }

    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    let connectedEmail = '';
    try {
      const userInfo = await oauth2.userinfo.get();
      connectedEmail = userInfo.data.email || '';
    } catch (userErr) {
      console.warn('[Google OAuth UserInfo Warning]:', userErr.message);
    }

    if (!event.driveFolderId && event.resourcesDriveUrl) {
      const parsed = extractDriveFolderId(event.resourcesDriveUrl);
      if (parsed) event.driveFolderId = parsed;
    }
    if (!event.driveFolderId && roomMeta.driveFolderId) {
      event.driveFolderId = roomMeta.driveFolderId;
    }
    if (!event.resourcesDriveUrl && roomMeta.resourcesDriveUrl) {
      event.resourcesDriveUrl = roomMeta.resourcesDriveUrl;
    }

    if (refresh_token) {
      event.encryptedRefreshToken = encryptToken(refresh_token);
    } else if (!event.encryptedRefreshToken && access_token) {
      event.encryptedRefreshToken = encryptToken(access_token);
    }

    event.driveConnected = true;
    if (connectedEmail) event.driveOwnerEmail = connectedEmail;
    await event.save();

    console.log(`[Google OAuth Connection Complete] Room ${roomCode} linked to ${connectedEmail}`);

    res.redirect(`${clientBaseUrl}/rooms/${roomCode}/media?oauth=success&email=${encodeURIComponent(connectedEmail)}`);
  } catch (error) {
    console.error('[Google OAuth Callback Failure Error]:', error);
    res.status(500).json({
      error: 'OAUTH_CALLBACK_FAILED',
      message: error.message || 'Failed to exchange authorization code with Google.'
    });
  }
});

router.get('/google/status/:code', async (req, res) => {
  try {
    const event = await Event.findOne({ code: req.params.code });
    if (!event) return res.json({ connected: false });
    res.json({
      connected: event.driveConnected && Boolean(event.encryptedRefreshToken),
      email: event.driveOwnerEmail || '',
      folderId: event.driveFolderId || ''
    });
  } catch (err) {
    res.json({ connected: false });
  }
});

router.post('/google/disconnect/:code', async (req, res) => {
  try {
    const event = await Event.findOne({ code: req.params.code });
    if (!event) return res.status(404).json({ message: 'Room not found.' });
    event.encryptedRefreshToken = '';
    event.driveConnected = false;
    event.driveOwnerEmail = '';
    await event.save();
    res.json({ message: 'Google Drive disconnected.' });
  } catch (err) {
    res.status(500).json({ message: 'Error disconnecting Drive.' });
  }
});

export default router;
