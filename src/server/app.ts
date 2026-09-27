import express from 'express';
import cors from 'cors';
import path from 'path';
import { apiRouter } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  // Cross-Origin Resource Sharing
  app.use(cors());

  // Body Parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Static file serving for uploaded images (Requirement 4)
  const uploadsDir = path.resolve(process.cwd(), 'data/uploads');
  app.use('/media', express.static(uploadsDir));

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ success: true, message: 'Server is running', timestamp: new Date().toISOString() });
  });

  // REST API Routes
  app.use('/api', apiRouter);

  // 404 Handler
  app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Endpoint not found' });
  });

  // Global Error Handler (Standardized JSON API format)
  app.use(errorHandler);

  return app;
}
