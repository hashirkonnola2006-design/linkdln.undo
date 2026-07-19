import express from 'express';
import { google } from 'googleapis';
import Event from '../models/Event.js';
import User from '../models/User.js';
import { encryptToken } from '../utils/encryption.js';

const router = express.Router();

// ─── Cookie settings ──────────────────────────────────────────────────────────
const COOKIE_NAME = 'session_id';
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  // secure: true  // enable in production (HTTPS only)
};

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

    res.cookie(COOKIE_NAME, sessionId, COOKIE_OPTIONS);
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
  res.clearCookie(COOKIE_NAME, { httpOnly: true, sameSite: 'lax' });
  res.json({ message: 'Logged out.' });
});

// ─── Google Drive OAuth (per-room admin only — untouched) ─────────────────────



// Build OAuth2 client
const getOAuth2Client = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.SERVER_BASE_URL}/api/auth/google/callback`
  );
};

// Client app base URL
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

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
  const { roomCode, title, hostName, hostAvatar, resourcesDriveUrl, driveFolderId } = req.query;

  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const baseUrl = process.env.CLIENT_URL || `${protocol}://${host}`;

  if (!roomCode) {
    return res.redirect(`${baseUrl}/rooms`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.warn('⚠️ GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET missing on server.');
    return res.redirect(`${baseUrl}/rooms/${roomCode}/media?oauth=error&msg=${encodeURIComponent('Google OAuth API keys not set on server')}`);
  }

  try {
    const serverBaseUrl = process.env.SERVER_BASE_URL || `${protocol}://${host}`;
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      `${serverBaseUrl}/api/auth/google/callback`
    );

    const scopes = [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ];

    // Encode room metadata in state so we can upsert it on callback
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
  } catch (err) {
    console.error('Google OAuth init error:', err);
    res.redirect(`${baseUrl}/rooms/${roomCode}/media?oauth=error&msg=${encodeURIComponent(err.message)}`);
  }
});

/**
 * GET /api/auth/google/callback
 * Google redirects here after user approves. Exchange code for tokens.
 */
router.get('/google/callback', async (req, res) => {
  const { code, state: stateB64, error } = req.query;

  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const baseUrl = process.env.CLIENT_URL || `${protocol}://${host}`;

  // Decode state
  let roomCode = '';
  let roomMeta = {};
  try {
    const decoded = JSON.parse(Buffer.from(stateB64 || '', 'base64').toString('utf8'));
    roomCode = decoded.roomCode || '';
    roomMeta = decoded;
  } catch (_) {
    roomCode = stateB64 || '';
  }

  // If user denied access
  if (error) {
    return res.redirect(`${baseUrl}/rooms/${roomCode}/media?oauth=denied`);
  }

  if (!code || !roomCode) {
    return res.redirect(`${baseUrl}/rooms`);
  }

  try {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    const { access_token, refresh_token } = tokens;

    console.log('🔑 Google OAuth Tokens Received:', {
      hasAccessToken: Boolean(access_token),
      hasRefreshToken: Boolean(refresh_token)
    });

    // Find or upsert event in DB
    let event = await Event.findOne({ code: roomCode });

    if (!event) {
      // Room not in DB — create it from state metadata
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
        console.log('✅ Created DB event for room:', roomCode);
      } catch (createErr) {
        console.error('Failed to create room in DB:', createErr.message);
        return res.redirect(`${CLIENT_URL}/rooms/${roomCode}/media?oauth=room_create_failed`);
      }
    }

    // Get connected Google account email
    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    let connectedEmail = '';
    try {
      const userInfo = await oauth2.userinfo.get();
      connectedEmail = userInfo.data.email || '';
    } catch (_) {}

    // Resolve folder ID from resourcesDriveUrl if not set
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

    // Store encrypted refresh_token if provided, otherwise preserve existing or fallback to access_token
    if (refresh_token) {
      event.encryptedRefreshToken = encryptToken(refresh_token);
    } else if (!event.encryptedRefreshToken && access_token) {
      // Fallback: store access_token if no refresh_token was issued by Google
      event.encryptedRefreshToken = encryptToken(access_token);
    }

    event.driveConnected = true;
    if (connectedEmail) event.driveOwnerEmail = connectedEmail;
    await event.save();

    console.log(`✅ Google Drive connected for room ${roomCode} (${connectedEmail})`);

    res.redirect(`${CLIENT_URL}/rooms/${roomCode}/media?oauth=success&email=${encodeURIComponent(connectedEmail)}`);
  } catch (err) {
    console.error('OAuth callback error:', err);
    res.redirect(`${CLIENT_URL}/rooms/${roomCode}/media?oauth=error&msg=${encodeURIComponent(err.message)}`);
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
