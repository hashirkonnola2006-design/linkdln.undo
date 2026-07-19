import mongoose from 'mongoose';

const AttendeeSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  company: { type: String, required: true },
  email: { type: String, required: true },
  interests: [{ type: String }],
  goals: { type: String, required: true },
  avatar: { type: String, default: '' },
  isOnline: { type: Boolean, default: true },
  socketId: { type: String, default: null },
  joinedAt: { type: Date, default: Date.now }
});

const Attendee = mongoose.model('Attendee', AttendeeSchema);
export default Attendee;
