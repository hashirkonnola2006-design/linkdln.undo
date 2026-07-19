import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  template: { 
    type: String, 
    enum: ['Networking', 'Workshop', 'Meetup', 'Conference', 'Other'], 
    default: 'Networking' 
  },
  visibility: { type: String, enum: ['Public', 'Private'], default: 'Public' },
  joinMode: { type: String, enum: ['Open', 'Approval'], default: 'Open' },
  dateTime: { type: Date, required: true },
  resourcesDriveUrl: { type: String, default: '' },
  driveFolderId: { type: String, default: '' },
  encryptedRefreshToken: { type: String, default: '' },
  driveConnected: { type: Boolean, default: false },
  driveOwnerEmail: { type: String, default: '' },
  hostName: { type: String, required: true },
  hostAvatar: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const Event = mongoose.model('Event', EventSchema);
export default Event;
