import mongoose from 'mongoose';

const NoteSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  color: { type: String, default: 'yellow' }, // yellow, blue, pink, green, sky
  authorName: { type: String, required: true },
  authorAvatar: { type: String, default: '' },
  attachment: { type: String, default: '' }, // e.g. "Brand_Kit_2024.zip"
  likes: { type: Number, default: 0 },
  likedBy: [{ type: String }], // Array of attendee IDs or emails to prevent multiple likes
  createdAt: { type: Date, default: Date.now }
});

const Note = mongoose.model('Note', NoteSchema);
export default Note;
