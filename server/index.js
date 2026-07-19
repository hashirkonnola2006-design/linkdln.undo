import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import eventRoutes from './routes/eventRoutes.js';
import attendeeRoutes from './routes/attendeeRoutes.js';
import authRoutes from './routes/authRoutes.js';
import socketHandler from './sockets/socketHandler.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Configure CORS — must specify exact origin (not '*') so cookies are sent
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const corsOptions = {
  origin: (origin, callback) => callback(null, true),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Set up Socket.io safely
let io = null;
try {
  io = new Server(server, { cors: corsOptions });
  socketHandler(io);
} catch (err) {
  console.warn('Socket.io setup skipped in serverless mode');
}

// Make Socket.io instance accessible in Express route handlers
app.set('socketio', io);

// Mount API routes
app.use('/api/events', eventRoutes);
app.use('/api/attendees', attendeeRoutes);
app.use('/api/auth', authRoutes);

// Base Route
app.get('/api', (req, res) => {
  res.send('linkdln.undo API is running...');
});

// Define PORT and start listening
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
