// server.js
// Main entry point for the AdmitWise Node/Express Backend
require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDB = require('./config/db');

// Import Route Handlers
const authRoutes = require('./routes/authRoutes');
const collegeRoutes = require('./routes/collegeRoutes');
const favouriteRoutes = require('./routes/favouriteRoutes');
const historyRoutes = require('./routes/historyRoutes');

// Initialize Express App
const app = express();

// Connect to MongoDB
connectDB();

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Frontend Files from "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/favourites', favouriteRoutes);
app.use('/api/history', historyRoutes);

// Simple Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AdmitWise Backend is running smoothly.' });
});

// Fallback: Send index.html for any unhandled routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(` AdmitWise Server is running on port ${PORT}`);
  console.log(` Local URL: http://localhost:${PORT}`);
  console.log(`===============================================`);
});
