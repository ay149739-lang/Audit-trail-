import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import shipmentRoutes from './routes/shipmentRoutes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app: Express = express();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Audit Trail CQRS Event Store API',
    timestamp: new Date().toISOString(),
  });
});

// CQRS API Routes
app.use('/api', shipmentRoutes);

// Error Handling Middleware
app.use(errorHandler);

export default app;
