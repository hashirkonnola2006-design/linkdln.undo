import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  sessionId: { type: String, required: true, unique: true, index: true },
  email: { type: String, default: '' },
  bio: { type: String, default: '' },
  role: { type: String, default: '' },
  company: { type: String, default: '' },
  location: { type: String, default: '' },
  avatar: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
export default User;
