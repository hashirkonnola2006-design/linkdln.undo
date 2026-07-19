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

// Configure CORS for standalone backend (Render) and Vercel frontend
const CLIENT_URL = process.env.CLIENT_URL || 'https://linkdln-undo.vercel.app';
const allowedOrigins = [
  CLIENT_URL,
  'https://linkdln-undo.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173'
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Set up Socket.io for real-time WebSockets on Render
const io = new Server(server, {
  cors: corsOptions
});
socketHandler(io);

// Make Socket.io instance accessible in Express route handlers
app.set('socketio', io);

// Health check route for Render
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'linkdln.undo API server is healthy.' });
});

app.get('/api', (req, res) => {
  res.json({ status: 'ok', message: 'linkdln.undo API is running.' });
});

// Mount API routes
app.use('/api/events', eventRoutes);
app.use('/api/attendees', attendeeRoutes);
app.use('/api/auth', authRoutes);

// Start standalone HTTP & WebSocket server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;
