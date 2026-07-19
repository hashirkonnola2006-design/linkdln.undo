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
  origin: [CLIENT_URL, 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Set up Socket.io
const io = new Server(server, {
  cors: corsOptions
});

// Make Socket.io instance accessible in Express route handlers
app.set('socketio', io);

// Mount API routes
app.use('/api/events', eventRoutes);
app.use('/api/attendees', attendeeRoutes);
app.use('/api/auth', authRoutes);

// Base Route
app.get('/', (req, res) => {
  res.send('linkdln.undo API is running...');
});

// Initialize Socket.io connection handlers
socketHandler(io);

// Define PORT and start listening
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
