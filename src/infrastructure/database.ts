import { PrismaClient } from '@prisma/client';
import { getEnv } from '../config/env.js';
import logger from '../config/logger.js';

const env = getEnv();

/**
 * Singleton pattern ensures only one Prisma Client instance exists
 * This prevents connection pool exhaustion and improves performance
 */
class DatabaseClient {
  private static instance: PrismaClient;

  private constructor() {}

  public static getInstance(): PrismaClient {
    if (!DatabaseClient.instance) {
      DatabaseClient.instance = new PrismaClient({
        // Enable query logging in development for debugging
        log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });

      DatabaseClient.instance.$connect().then(() => {
        logger.info('Database connected successfully');
      }).catch((error) => {
        logger.error({ err: error }, 'Database connection failed');
        // Allow server to start even if DB is unavailable for better debugging
        logger.warn('Server will continue running, but database operations will fail');
      });
    }

    return DatabaseClient.instance;
  }

  public static async disconnect(): Promise<void> {
    if (DatabaseClient.instance) {
      await DatabaseClient.instance.$disconnect();
      logger.info('Database disconnected');
    }
  }
}

export const prisma = DatabaseClient.getInstance();
export default prisma;
