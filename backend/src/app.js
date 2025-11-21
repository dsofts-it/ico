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
  res.send('API is running...');
});

// Define Routes
app.use('/api/auth', require('./routes/authRoutes'));

module.exports = app;
