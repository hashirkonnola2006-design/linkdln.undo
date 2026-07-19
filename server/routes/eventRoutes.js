import express from 'express';
import { google } from 'googleapis';
import { Readable } from 'stream';
import Event from '../models/Event.js';
import Attendee from '../models/Attendee.js';
import Jar from '../models/Jar.js';
import Note from '../models/Note.js';
import Media from '../models/Media.js';
import { encryptToken, decryptToken } from '../utils/encryption.js';
import { groupAttendeesIntoJars } from '../services/geminiService.js';

const router = express.Router();

// Generate a random 6-character room code or slug
const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Create a new event room
router.post('/', async (req, res) => {
  try {
    const { title, description, template, visibility, joinMode, dateTime, resourcesDriveUrl, hostName, hostAvatar } = req.body;

    if (!title || !description || !hostName) {
      return res.status(400).json({ message: 'Title, description, and host name are required.' });
    }

    let code = generateRoomCode();
    // Ensure uniqueness of room code
    let codeExists = await Event.findOne({ code });
    while (codeExists) {
      code = generateRoomCode();
      codeExists = await Event.findOne({ code });
    }

    const event = new Event({
      code,
      title,
      description,
      template: template || 'Networking',
      visibility: visibility || 'Public',
      joinMode: joinMode || 'Open',
      dateTime: dateTime || new Date(),
      resourcesDriveUrl: resourcesDriveUrl || '',
      hostName,
      hostAvatar: hostAvatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(hostName)}`
    });

    const savedEvent = await event.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Server error creating event.', error: error.message });
  }
});

// Browse public event rooms (with filters)
router.get('/', async (req, res) => {
  try {
    const { search, template, status, date } = req.query;
    let query = { visibility: 'Public' };

    // Search query (title/description)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by room template
    if (template && template !== 'All') {
      query.template = template;
    }

    // Filter by status (Live Now vs Upcoming)
    if (status && status !== 'All') {
      const now = new Date();
      if (status === 'Live Now') {
        // Assume rooms created in the last 24 hours or with date matching today are live
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        query.dateTime = { $gte: oneDayAgo, $lte: now };
      } else if (status === 'Upcoming') {
        query.dateTime = { $gt: now };
      }
    }

    // Filter by specific date
    if (date) {
      const searchDate = new Date(date);
      const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));
      query.dateTime = { $gte: startOfDay, $lte: endOfDay };
    }

    const events = await Event.find(query).sort({ dateTime: -1 });
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Server error fetching events.', error: error.message });
  }
});

// Get detailed room statistics (for dashboard)
router.get('/:code/stats', async (req, res) => {
  try {
    const event = await Event.findOne({ code: req.params.code });
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    const totalJoins = await Attendee.countDocuments({ eventId: event._id });
    const activeJars = await Jar.countDocuments({ eventId: event._id });
    
    // Calculate peak traffic time (simulated or based on join timestamps)
    // We will return a static value or simple aggregate for the mockup dashboard
    const peakTraffic = '11:00 AM';

    // Get jar member distribution
    const jars = await Jar.find({ eventId: event._id }).populate('memberIds');
    const jarPopularity = jars.map(jar => ({
      label: jar.label,
      count: jar.memberIds.length,
      percentage: totalJoins > 0 ? Math.round((jar.memberIds.length / totalJoins) * 100) : 0
    })).sort((a, b) => b.count - a.count);

    const topPerformer = jarPopularity.length > 0 ? jarPopularity[0].label : 'None';

    res.json({
      totalJoins,
      peakTraffic,
      activeJars,
      topPerformer,
      jarPopularity
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Server error fetching stats.', error: error.message });
  }
});

// Get room details by code
router.get('/:code', async (req, res) => {
  try {
    const event = await Event.findOne({ code: req.params.code });
    if (!event) {
      return res.status(404).json({ message: 'Room not found.' });
    }
    res.json(event);
  } catch (error) {
    console.error('Error fetching room details:', error);
    res.status(500).json({ message: 'Server error fetching room details.', error: error.message });
  }
});

// Get grouped jars for an event
router.get('/:code/jars', async (req, res) => {
  try {
    const event = await Event.findOne({ code: req.params.code });
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    const jars = await Jar.find({ eventId: event._id }).populate('memberIds');
    res.json(jars);
  } catch (error) {
    console.error('Error fetching jars:', error);
    res.status(500).json({ message: 'Server error fetching jars.', error: error.message });
  }
});

// Trigger AI grouping ("Jars") logic
router.post('/:code/group', async (req, res) => {
  try {
    const event = await Event.findOne({ code: req.params.code });
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    const attendees = await Attendee.find({ eventId: event._id });
    if (attendees.length === 0) {
      return res.status(400).json({ message: 'Cannot group attendees. No one has joined this room yet.' });
    }

    // Call Gemini Flash grouping service
    const groupedJars = await groupAttendeesIntoJars(event.title, event.description, attendees);

    // Clear existing Jars for this event
    await Jar.deleteMany({ eventId: event._id });

    // Save newly generated Jars
    const savedJars = [];
    for (const jarData of groupedJars) {
      const jar = new Jar({
        eventId: event._id,
        label: jarData.label,
        reason: jarData.reason,
        memberIds: jarData.memberIds
      });
      const savedJar = await jar.save();
      savedJars.push(savedJar);
    }

    // Populate members for response
    const populatedJars = await Jar.find({ eventId: event._id }).populate('memberIds');

    // Notify all connected clients in the room via socket
    const io = req.app.get('socketio');
    if (io) {
      io.to(`room:${event._id.toString()}`).emit('jars_updated', populatedJars);
    }

    res.json({ message: 'AI grouping completed successfully.', jars: populatedJars });
  } catch (error) {
    console.error('Error running AI grouping:', error);
    res.status(500).json({ message: 'Failed to run AI grouping.', error: error.message });
  }
});

// Get Room Wall notes
router.get('/:code/notes', async (req, res) => {
  try {
    const event = await Event.findOne({ code: req.params.code });
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    const notes = await Note.find({ eventId: event._id }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ message: 'Server error fetching notes.', error: error.message });
  }
});

// Add a note to Room Wall
router.post('/:code/notes', async (req, res) => {
  try {
    const event = await Event.findOne({ code: req.params.code });
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    const { title, content, color, authorName, authorAvatar, attachment } = req.body;

    if (!title || !content || !authorName) {
      return res.status(400).json({ message: 'Title, content, and author name are required.' });
    }

    const note = new Note({
      eventId: event._id,
      title,
      content,
      color: color || 'yellow',
      authorName,
      authorAvatar: authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(authorName)}`,
      attachment: attachment || '',
      likes: 0,
      likedBy: []
    });

    const savedNote = await note.save();

    // Broadcast new note to the room
    const io = req.app.get('socketio');
    if (io) {
      io.to(`room:${event._id.toString()}`).emit('note_added', savedNote);
    }

    res.status(201).json(savedNote);
  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({ message: 'Server error adding note.', error: error.message });
  }
});

// Like/Unlike a Note
router.post('/:code/notes/:noteId/like', async (req, res) => {
  try {
    const { attendeeId } = req.body;
    if (!attendeeId) {
      return res.status(400).json({ message: 'Attendee ID is required to like notes.' });
    }

    const note = await Note.findById(req.params.noteId);
    if (!note) {
      return res.status(404).json({ message: 'Note not found.' });
    }

    const hasLiked = note.likedBy.includes(attendeeId);
    if (hasLiked) {
      // Unlike
      note.likedBy = note.likedBy.filter(id => id !== attendeeId);
      note.likes = Math.max(0, note.likes - 1);
    } else {
      // Like
      note.likedBy.push(attendeeId);
      note.likes += 1;
    }

    const updatedNote = await note.save();

    // Broadcast note updates to the room
    const event = await Event.findOne({ code: req.params.code });
    const io = req.app.get('socketio');
    if (io && event) {
      io.to(`room:${event._id.toString()}`).emit('note_updated', updatedNote);
    }

    res.json(updatedNote);
  } catch (error) {
    console.error('Error liking note:', error);
    res.status(500).json({ message: 'Server error liking note.', error: error.message });
  }
});

router.delete('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const event = await Event.findOne({ code });
    if (!event) {
      return res.status(404).json({ message: 'Event room not found.' });
    }

    // Delete related DB documents
    await Attendee.deleteMany({ eventId: event._id });
    await Jar.deleteMany({ eventId: event._id });
    await Note.deleteMany({ eventId: event._id });
    await Event.deleteOne({ _id: event._id });

    // Broadcast room deletion to active sockets
    const io = req.app.get('socketio');
    if (io) {
      io.to(`room:${event._id.toString()}`).emit('room_deleted', { code });
    }

    res.json({ message: 'Event room and all associated data deleted successfully.' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Server error deleting event.', error: error.message });
  }
});

// Connect Drive Folder & encrypted refresh token
router.post('/:code/drive-connect', async (req, res) => {
  try {
    const { code } = req.params;
    const { driveFolderId, refreshToken } = req.body;

    const event = await Event.findOne({ code });
    if (!event) {
      return res.status(404).json({ message: 'Event room not found.' });
    }

    if (driveFolderId) event.driveFolderId = driveFolderId;
    if (refreshToken) {
      event.encryptedRefreshToken = encryptToken(refreshToken);
    }
    event.driveConnected = true;

    await event.save();
    res.json({ message: 'Google Drive connected successfully.', driveConnected: true, driveFolderId: event.driveFolderId });
  } catch (error) {
    console.error('Error connecting Drive:', error);
    res.status(500).json({ message: 'Server error connecting Drive.', error: error.message });
  }
});

// Fetch Media Items for Room
router.get('/:code/media', async (req, res) => {
  try {
    const { code } = req.params;
    const event = await Event.findOne({ code });
    if (!event) {
      return res.status(404).json({ message: 'Event room not found.' });
    }

    const mediaList = await Media.find({ eventId: event._id }).sort({ createdAt: -1 });
    res.json(mediaList);
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({ message: 'Server error fetching media.', error: error.message });
  }
});

// Helper: extract Google Drive folder ID from a URL or plain ID string
const extractDriveFolderId = (urlOrId) => {
  if (!urlOrId) return null;
  // Try matching /folders/FOLDER_ID pattern
  const match = urlOrId.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  // Try matching ?id=FOLDER_ID pattern
  const idMatch = urlOrId.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch) return idMatch[1];
  // If it looks like a plain ID (no slashes, no spaces), return as-is
  if (/^[a-zA-Z0-9_-]{10,}$/.test(urlOrId.trim())) return urlOrId.trim();
  return null;
};

// List files from the room's connected Google Drive folder
router.get('/:code/drive-files', async (req, res) => {
  try {
    const { code } = req.params;
    // Accept a folderUrl query param as fallback for rooms not yet in DB
    const { folderUrl } = req.query;

    let folderId = null;

    // Try to load from DB first
    const event = await Event.findOne({ code });
    if (event) {
      folderId = event.driveFolderId || extractDriveFolderId(event.resourcesDriveUrl);
    }

    // Fall back to client-provided folderUrl (for local/non-DB rooms)
    if (!folderId && folderUrl) {
      folderId = extractDriveFolderId(folderUrl);
    }

    if (!folderId) {
      return res.json({ files: [], message: 'No Drive folder linked to this room.' });
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ message: 'GOOGLE_API_KEY not configured on server.', folderId });
    }

    // Query Drive API v3 for images and videos in the folder
    const driveUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(`'${folderId}' in parents and (mimeType contains 'image/' or mimeType contains 'video/') and trashed=false`)}&fields=files(id,name,mimeType,thumbnailLink,webContentLink,webViewLink,createdTime,size)&key=${apiKey}&orderBy=createdTime desc&pageSize=100`;

    const driveRes = await fetch(driveUrl);
    const driveData = await driveRes.json();

    if (!driveRes.ok) {
      console.error('Drive API error:', driveData);
      return res.status(driveRes.status).json({ message: driveData?.error?.message || 'Drive API error.', folderId });
    }

    // Query DB Media docs to map driveFileId -> author details
    const dbMediaList = await Media.find({ code });
    const mediaMapByDriveId = new Map();
    dbMediaList.forEach(m => {
      if (m.driveFileId) mediaMapByDriveId.set(m.driveFileId, m);
    });

    const files = (driveData.files || []).map(f => {
      const dbDoc = mediaMapByDriveId.get(f.id);
      let nameAuthor = '';
      if (f.name && f.name.includes('_')) {
        nameAuthor = f.name.split('_')[0];
      }

      return {
        _id: f.id,
        type: f.mimeType.startsWith('video/') ? 'video' : 'image',
        url: `https://lh3.googleusercontent.com/d/${f.id}`,
        thumbnailUrl: f.thumbnailLink || `https://drive.google.com/thumbnail?id=${f.id}&sz=w400`,
        webViewLink: f.webViewLink,
        name: f.name,
        mimeType: f.mimeType,
        createdAt: f.createdTime,
        source: 'drive',
        authorName: dbDoc?.authorName || nameAuthor || 'Drive',
        authorEmail: dbDoc?.authorEmail || '',
        caption: dbDoc?.caption || f.name
      };
    });

    res.json({ files, folderId });
  } catch (error) {
    console.error('Error listing Drive files:', error);
    res.status(500).json({ message: 'Server error listing Drive files.', error: error.message });
  }
});

// Helper: upload a base64 blob to Drive using OAuth2 refresh token
const uploadToDriveWithOAuth = async (base64DataUrl, folderId, fileName, refreshToken) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.SERVER_BASE_URL}/api/auth/google/callback`
  );
  oauth2Client.setCredentials({
    refresh_token: refreshToken
  });

  // Obtain a fresh access token from Google using the refresh token
  const { token: accessToken } = await oauth2Client.getAccessToken();
  if (!accessToken) {
    throw new Error('Failed to obtain access token from Google OAuth refresh token.');
  }

  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  // Parse base64
  const matches = base64DataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches) throw new Error('Invalid base64 data URL');
  const mimeType = matches[1];
  const binaryData = Buffer.from(matches[2], 'base64');

  // Convert Buffer to Readable stream for Drive API
  const readableStream = new Readable();
  readableStream.push(binaryData);
  readableStream.push(null);

  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
      mimeType
    },
    media: {
      mimeType,
      body: readableStream
    },
    fields: 'id,name,webViewLink,webContentLink'
  });

  // Make the file publicly readable if possible (catch errors gracefully)
  try {
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: { role: 'reader', type: 'anyone' }
    });
  } catch (permErr) {
    console.warn('Note: Could not set public permission on uploaded file:', permErr.message);
  }

  return response.data;
};

// Upload Media (Photo/Video capture or upload)
router.post('/:code/media/upload', async (req, res) => {
  try {
    const { code } = req.params;
    const { type, url, authorName, authorAvatar, caption, fileName } = req.body;

    if (!url) {
      return res.status(400).json({ message: 'Media content (URL or Base64) is required.' });
    }

    const event = await Event.findOne({ code });
    if (!event) {
      return res.status(404).json({ message: 'Event room not found.' });
    }

    let finalUrl = url;
    let driveFileId = null;
    let driveWebViewLink = null;

    // Try OAuth Drive upload if room has a connected Google account
    const folderId = event.driveFolderId || extractDriveFolderId(event.resourcesDriveUrl);
    const hasOAuth = event.driveConnected && event.encryptedRefreshToken;

    if (folderId && hasOAuth && url.startsWith('data:')) {
      try {
        const refreshToken = decryptToken(event.encryptedRefreshToken);
        const ext = url.startsWith('data:video') ? 'webm' : 'jpg';
        const uploadName = fileName || `${authorName || 'capture'}_${Date.now()}.${ext}`;

        const driveFile = await uploadToDriveWithOAuth(url, folderId, uploadName, refreshToken);
        driveFileId = driveFile.id;
        driveWebViewLink = driveFile.webViewLink;
        // Use Google's direct CDN view URL so images load in <img> tags without redirects
        finalUrl = `https://lh3.googleusercontent.com/d/${driveFile.id}`;
        console.log(`✅ Uploaded to Drive via OAuth: ${uploadName} -> ${driveFile.id}`);
      } catch (driveErr) {
        console.warn('⚠️ Drive OAuth upload failed (saving locally):', driveErr);
      }
    } else {
      console.log('ℹ️ Drive upload status:', { folderId: Boolean(folderId), hasOAuth: Boolean(hasOAuth), isDataUrl: url.startsWith('data:') });
    }

    const newMedia = new Media({
      eventId: event._id,
      code,
      type: type || 'image',
      url: finalUrl,
      driveFileId: driveFileId || '',
      driveWebViewLink: driveWebViewLink || '',
      authorName: authorName || 'Attendee',
      authorEmail: req.body.authorEmail || '',
      authorAvatar: authorAvatar || `https://api.dicebear.com/7.x/open-peeps/svg?seed=${encodeURIComponent(authorName || 'Attendee')}`,
      caption: caption || ''
    });

    const savedMedia = await newMedia.save();

    // Broadcast new media item to room members via Socket.IO
    const io = req.app.get('socketio');
    if (io) {
      io.to(`room:${event._id.toString()}`).emit('media_added', savedMedia);
    }

    res.status(201).json(savedMedia);
  } catch (error) {
    console.error('Error uploading media:', error);
    res.status(500).json({ message: 'Server error uploading media.', error: error.message });
  }
});

// Delete Media (from DB and Google Drive)
router.delete('/:code/media/:id', async (req, res) => {
  try {
    const { code, id } = req.params;
    let { fileId } = req.query;

    const event = await Event.findOne({ code });
    if (!event) return res.status(404).json({ message: 'Room not found.' });

    // If id looks like a Drive File ID
    if (!fileId && /^[a-zA-Z0-9_-]{15,}$/.test(id)) {
      fileId = id;
    }

    let targetFileId = fileId || '';

    // Delete from DB by Mongo ID or driveFileId
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
    const mediaDoc = await Media.findOneAndDelete({
      $or: [
        ...(isMongoId ? [{ _id: id }] : []),
        { code, driveFileId: id },
        ...(fileId ? [{ code, driveFileId: fileId }] : [])
      ]
    });

    if (mediaDoc && mediaDoc.driveFileId) {
      targetFileId = mediaDoc.driveFileId;
    }

    // Also attempt deletion from Drive if OAuth is connected
    if (targetFileId && event.driveConnected && event.encryptedRefreshToken) {
      try {
        const refreshToken = decryptToken(event.encryptedRefreshToken);
        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
          `${process.env.SERVER_BASE_URL}/api/auth/google/callback`
        );
        oauth2Client.setCredentials({ refresh_token: refreshToken });
        await oauth2Client.getAccessToken();
        const drive = google.drive({ version: 'v3', auth: oauth2Client });
        await drive.files.delete({ fileId: targetFileId });
        console.log(`🗑️ Successfully deleted file from Drive: ${targetFileId}`);
      } catch (driveErr) {
        console.warn('Note: Drive file deletion notice:', driveErr.message);
      }
    }

    // Broadcast deletion socket event
    const io = req.app.get('socketio');
    if (io) {
      io.to(`room:${event._id.toString()}`).emit('media_deleted', { id, fileId: targetFileId });
    }

    res.json({ message: 'Media deleted successfully.', id, fileId: targetFileId });
  } catch (error) {
    console.error('Error deleting media:', error);
    res.status(500).json({ message: 'Server error deleting media.', error: error.message });
  }
});

export default router;
