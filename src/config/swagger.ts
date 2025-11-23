import swaggerJsDoc from 'swagger-jsdoc';
import { getEnv } from './env.js';

const env = getEnv();

const apiPath = process.env.NODE_ENV === 'production'
    ? './dist/routes/v1/*.js'
    : './src/routes/v1/*.ts';

const swaggerOptions: swaggerJsDoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Live Chat API',
            version: '2.0.0',
            description: 'A modern live chat backend with TypeScript, Prisma, and clean architecture',
            contact: {
                name: 'Nicolas Dumermuth',
            },
        },
        servers: [
            {
                url: env.BEHIND_PROXY === 'true' && env.URL
                    ? `${env.URL}/api/v1`
                    : env.URL
                        ? `${env.URL}:${env.PORT}/api/v1`
                        : `http://localhost:${env.PORT}/api/v1`,
                description: 'API Server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter JWT token',
                },
            },
        },
        tags: [
            {
                name: 'Authentication',
                description: 'User authentication endpoints',
            },
            {
                name: 'Chat',
                description: 'Chat message endpoints',
            },
            {
                name: 'Users',
                description: 'User management endpoints',
            },
        ],
    },
    apis: [apiPath],
};

export const swaggerSpec = swaggerJsDoc(swaggerOptions);