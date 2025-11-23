import { createServer } from 'http';
import { app, DatabaseClient } from './app.js';
import { initializeWebSocket } from './infrastructure/websocket.js';
import { getEnv } from './config/env.js';
import { logger } from './config/logger.js';

const env = getEnv();

// Create HTTP server
const server = createServer(app);

// Initialize WebSocket server
initializeWebSocket(server);

// Start server
server.listen(env.PORT, () => {
    logger.info(`
=========================================
   Live Chat API Server Started
=========================================
   Environment: ${env.NODE_ENV.padEnd(22)}
   Port: ${String(env.PORT).padEnd(30)}
   Proxy: ${String(env.BEHIND_PROXY).padEnd(30)}
   API Docs: http://localhost:${env.PORT}/api/docs
   API v1: http://localhost:${env.PORT}/api/v1
   Health: http://localhost:${env.PORT}/health
=========================================
    `);
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
    logger.info(`${signal} received. Starting graceful shutdown...`);

    server.close(async () => {
        logger.info('HTTP server closed');

        try {
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

process.on('SIGTERM', () => {
    void gracefulShutdown('SIGTERM');
});

process.on('SIGINT', () => {
    void gracefulShutdown('SIGINT');
});

process.on('uncaughtException', (error) => {
    logger.error({ err: error }, 'Uncaught Exception');
    void gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason) => {
    logger.error({ err: reason }, 'Unhandled Rejection');
    void gracefulShutdown('unhandledRejection');
});

export { app, server };