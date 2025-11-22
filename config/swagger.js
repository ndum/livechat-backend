// dotenv is already configured in server.js
const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Live Chat API',
            version: '1.0.0',
            description: 'A simple live chat backend using Node.js, Express, and MongoDB with JWT authentication.'
        },
        servers: [
            {
                url: `${process.env.URL ? `${process.env.URL}:${process.env.PORT}` : 'http://localhost:3000'}/api`
            }
        ],
        components: {
            securitySchemes: {
              bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
              }
            }
          }
    },
    apis: ['./routes/*.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = swaggerDocs;
