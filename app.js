const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const globalErrorHandler = require('./middlewares/error');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const audioRoutes = require('./routes/audioRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api/audio', audioRoutes);
app.use('/api/admin', adminRoutes);

// Global error handler
app.use(globalErrorHandler);

module.exports = app;