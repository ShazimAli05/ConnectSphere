require('dotenv').config();
const http = require('http');
const path = require('path');
const express = require('express');
const { Server } = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const initSocketServer = require('./sockets/socketManager');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const conversationRoutes = require('./routes/conversationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

const clientOrigin = process.env.CLIENT_URL || 'http://localhost:5173';

// Setup Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: [clientOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
  pingTimeout: 60000,
});

// Initialize socket manager events
const socketManager = initSocketServer(io);

// Expose io & socketManager to req object for use in controllers if needed
app.set('io', io);
app.set('socketManager', socketManager);

// Security & Parsing Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow serving uploaded media across ports
  })
);

app.use(
  cors({
    origin: [clientOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Serve uploads directory as static files with cache control
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    platform: 'ConnectSphere Server',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date(),
  });
});

// Apply rate limiting to all REST APIs
app.use('/api', apiLimiter);

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/admin', adminRoutes);

// Catch-all 404 for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route ${req.originalUrl} not found on ConnectSphere server.`,
  });
});

// Centralized error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`[ConnectSphere Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`[ConnectSphere Server] WebSocket gateway initialized & ready.`);
});

// Unhandled promise rejection safety
process.on('unhandledRejection', (err) => {
  console.error('[Unhandled Rejection]', err.message);
});

module.exports = { app, server, io };
