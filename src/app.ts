import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { getEnv } from './config/env.js';
import { logger } from './config/logger.js';
import { swaggerSpec } from './config/swagger.js';
import routes from './routes/v1/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import DatabaseClient from './infrastructure/database.js';

const env = getEnv();

// Initialize Express app
export const app = express();

if (env.BEHIND_PROXY === 'true') {
    app.set('trust proxy', 1);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1', routes);

// Swagger Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Live Chat API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
}));

// Error handling middleware (should be last)
app.use(errorHandler);

// Connect to database
DatabaseClient.$connect()
    .then(() => {
        logger.info('Database connected successfully');
    })
    .catch((error) => {
        logger.error({ err: error }, 'Database connection failed');
        process.exit(1);
    });

export { DatabaseClient };