const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars (if not loaded in server.js, but good to have here or there)
// dotenv.config() is usually called in server.js

const app = express();

// CORS Configuration - Allow all origins for global accessibility
const corsOptions = {
  origin: '*', // Allow all origins
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'], // Allowed headers
  exposedHeaders: ['Content-Range', 'X-Content-Range'], // Headers exposed to the browser
  maxAge: 86400 // Cache preflight request for 24 hours
};

// Middleware
app.use(express.json());
app.use(cors(corsOptions));

// Additional CORS headers for extra compatibility
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

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
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/ico', require('./routes/icoRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));

module.exports = app;
