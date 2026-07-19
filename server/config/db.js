import mongoose from 'mongoose';
import Event from '../models/Event.js';
import Attendee from '../models/Attendee.js';
import Jar from '../models/Jar.js';
import Note from '../models/Note.js';
import { setupMemoryDB } from '../models/memoryDBSetup.js';

const setupMemoryDBFallback = () => {
  global.useMemoryDB = true;
  global.memoryDB = {
    events: [],
    attendees: [],
    jars: [],
    notes: []
  };
  setupMemoryDB(Event, 'events');
  setupMemoryDB(Attendee, 'attendees');
  setupMemoryDB(Jar, 'jars');
  setupMemoryDB(Note, 'notes');
};

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.warn(`⚠️  MONGODB_URI not set. Using in-memory DB fallback.`);
    setupMemoryDBFallback();
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 2500
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    global.useMemoryDB = false;
  } catch (error) {
    console.warn(`\n⚠️  MongoDB connection failed: ${error.message}`);
    console.warn(`⚠️  FALLING BACK TO IN-MEMORY DATABASE.\n`);
    setupMemoryDBFallback();
  }
};

export default connectDB;
