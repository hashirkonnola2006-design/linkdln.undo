import mongoose from 'mongoose';

const JarSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  label: { type: String, required: true },
  reason: { type: String, required: true },
  memberIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Attendee' }],
  createdAt: { type: Date, default: Date.now }
});

const Jar = mongoose.model('Jar', JarSchema);
export default Jar;
