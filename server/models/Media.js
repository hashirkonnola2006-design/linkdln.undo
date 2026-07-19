import mongoose from 'mongoose';

const MediaSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  code: { type: String, required: true },
  type: { type: String, enum: ['image', 'video'], default: 'image' },
  url: { type: String, required: true }, // Base64 data URL or Drive View link
  driveFileId: { type: String, default: '' },
  driveWebViewLink: { type: String, default: '' },
  authorName: { type: String, default: 'Attendee' },
  authorEmail: { type: String, default: '' },
  authorAvatar: { type: String, default: '' },
  caption: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const Media = mongoose.model('Media', MediaSchema);
export default Media;
