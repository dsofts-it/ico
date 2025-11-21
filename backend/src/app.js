const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars (if not loaded in server.js, but good to have here or there)
// dotenv.config() is usually called in server.js

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes Placeholder
app.get('/', (req, res) => {
  res.json({ 
    message: 'ICO Authentication API is running',
    version: '1.0.0',
    status: 'healthy'
  });
});

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Define Routes
app.use('/api/auth', require('./routes/authRoutes'));

module.exports = app;
