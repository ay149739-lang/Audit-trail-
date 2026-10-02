import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import shipmentRoutes from './routes/shipmentRoutes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app: Express = express();

// Security Hardening: Helmet HTTP Headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Don't break inline styles / dev assets
    crossOriginEmbedderPolicy: false,
  })
);

// Restricted CORS Configuration
const rawOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',').map((o) => o.trim().replace(/\/$/, ''))
  : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, postman, server-to-server) or matching allowed origins
      const normalizedOrigin = origin ? origin.replace(/\/$/, '') : '';
      if (!origin || rawOrigins.includes(normalizedOrigin) || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy: origin ${origin} is not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate Limiter for API Endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 600, // 600 requests per window (generous for local dev/testing)
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this client, please try again later.',
  },
});
app.use('/api', apiLimiter);

// Body Parsing Middlewares
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Root & Health Check
app.get('/', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Audit Trail CQRS Event Store API',
    endpoints: {
      health: '/health',
      shipments: '/api/shipments',
    },
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (_req, res) => {
  const dbState = mongoose.connection.readyState;
  const isDbConnected = dbState === 1;

  const dbStateMap: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  // In production, database connectivity is required for a healthy status
  const isProduction = process.env.NODE_ENV === 'production';
  const isHealthy = isProduction ? isDbConnected : true;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'OK' : 'DEGRADED',
    service: 'Audit Trail CQRS Event Store API',
    database: {
      status: dbStateMap[dbState] || 'unknown',
      connected: isDbConnected,
      mode: isDbConnected ? 'mongodb' : 'in-memory-fallback',
    },
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// CQRS API Routes
app.use('/api', shipmentRoutes);

// Error Handling Middleware
app.use(errorHandler);

export default app;
