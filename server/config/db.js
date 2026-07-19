import mongoose from 'mongoose';
import Event from '../models/Event.js';
import Attendee from '../models/Attendee.js';
import Jar from '../models/Jar.js';
import Note from '../models/Note.js';
import { setupMemoryDB } from '../models/memoryDBSetup.js';

const connectDB = async () => {
  try {
    // Attempt Mongoose connection with a short timeout to prevent long hangs on startup
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 2500
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    global.useMemoryDB = false;
  } catch (error) {
    console.warn(`\n⚠️  MongoDB connection failed: ${error.message}`);
    console.warn(`⚠️  FALLING BACK TO IN-MEMORY DATABASE. Platform data will reset on server restart.\n`);
    
    global.useMemoryDB = true;
    
    // Initialize standard mock arrays
    global.memoryDB = {
      events: [],
      attendees: [],
      jars: [],
      notes: []
    };

    // Bind memory interceptors to models
    setupMemoryDB(Event, 'events');
    setupMemoryDB(Attendee, 'attendees');
    setupMemoryDB(Jar, 'jars');
    setupMemoryDB(Note, 'notes');
  }
};

export default connectDB;
