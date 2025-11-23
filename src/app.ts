import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { WebSocketServer } from 'ws';
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

// Initialize WebSocket server (will be attached to HTTP server in server.ts)
export const wss = new WebSocketServer({ noServer: true });

// WebSocket connection handling
wss.on('connection', (ws) => {
    logger.info('New WebSocket connection established');

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message.toString());
            logger.debug({ data }, 'WebSocket message received');

            // Broadcast to all connected clients
            wss.clients.forEach((client) => {
                if (client.readyState === 1) { // OPEN
                    client.send(JSON.stringify(data));
                }
            });
        } catch (error) {
            logger.error({ err: error }, 'WebSocket message error');
        }
    });

    ws.on('close', () => {
        logger.info('WebSocket connection closed');
    });

    ws.on('error', (error) => {
        logger.error({ err: error }, 'WebSocket error');
    });
});

// Connect to database
DatabaseClient.$connect()
    .then(() => {
        logger.info('Database connected successfully');
    })
    .catch((error) => {
        logger.error({ err: error }, 'Database connection failed');
        process.exit(1);
    });

logger.info('WebSocket server initialized');

export { DatabaseClient };