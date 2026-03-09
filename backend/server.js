require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectPostgres } = require('./config/postgres');
const connectMongo = require('./config/mongo');
require('./models/Grade');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/grades', require('./routes/gradeRoutes'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: '🎓 Smart Student Tracker API is running!' });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectPostgres();
  await connectMongo();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer();