import 'dotenv/config';
import 'reflect-metadata';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import http from 'http';
import { validateEnv } from './config/env.js';
import logger from './config/logger.js';
import { swaggerSpec } from './config/swagger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initializeWebSocket } from './infrastructure/websocket.js';
import v1Routes from './routes/v1/index.js';

// Validate environment variables
const env = validateEnv();

// Create Express app
const app: Application = express();
const server = http.createServer(app);

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: '*', // In production, specify allowed origins
  credentials: true,
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 1000, // Limit each IP to 1000 requests per window
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize WebSocket
initializeWebSocket(server);

// API Routes with versioning
app.use('/api/v1', v1Routes);

// Swagger Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Live Chat API Documentation',
}));

// Health Check
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// Root redirect to docs
app.get('/', (_req, res) => {
  res.redirect('/api/docs');
});

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
  });
});

// Error Handler Middleware (must be last)
app.use(errorHandler);

// Graceful Shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  server.close(async () => {
    logger.info('HTTP server closed');

    try {
      const { default: DatabaseClient } = await import('./infrastructure/database.js');
      await DatabaseClient.$disconnect();
      logger.info('Database disconnected');

      logger.info('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error({ err: error }, 'Error during shutdown');
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forceful shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on('SIGTERM', () => {
  void gracefulShutdown('SIGTERM');
});
process.on('SIGINT', () => {
  void gracefulShutdown('SIGINT');
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error({ err: error }, 'Uncaught Exception');
  void gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown) => {
  logger.error({ err: reason }, 'Unhandled Rejection');
  void gracefulShutdown('unhandledRejection');
});

// Start server only if this is the main module
if (import.meta.url === `file:///${process.argv[1]?.replace(/\\/g, '/')}`) {
  server.listen(env.PORT, () => {
    logger.info(`
=========================================
   Live Chat API Server Started
=========================================
   Environment: ${env.NODE_ENV.padEnd(22)}
   Port: ${String(env.PORT).padEnd(30)}
   API Docs: /api/docs
   API v1: /api/v1
=========================================
    `);
  });
}

export { app, server };
