require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { connectPostgres } = require('./config/postgres');
const connectMongo = require('./config/mongo');
require('./models/Grade');
require('./models/Section');
require('./models/StudentSection');

const app = express();
const server = http.createServer(app);

// CORS origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.FRONTEND_URL,
].filter(Boolean);

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Store io instance for use in controllers
app.set('io', io);

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined room user_${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/grades', require('./routes/gradeRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/sections', require('./routes/sectionRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Smart Student Tracker API is running!' });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectPostgres();
  await connectMongo();

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();