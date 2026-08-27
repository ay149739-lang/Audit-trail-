const express = require('express');
const cors = require('cors');
const commandRoutes = require('./routes/commandRoutes');
const queryRoutes = require('./routes/queryRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Route Mounting
app.use('/api/shipment', commandRoutes);
app.use('/api', queryRoutes);

// Catch-all 404 handler
app.use((req, res) => {
  res.status(404).json({ error: true, message: `Route ${req.originalUrl} not found.` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err);
  res.status(500).json({ error: true, message: err.message || 'Internal Server Error' });
});

module.exports = app;
