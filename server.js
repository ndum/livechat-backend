const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./config/swagger');
const setupWebSocket = require('./config/websocket');

const chatRoutes = require('./routes/chatRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const ioMiddleware = require('./middleware/ioMiddleware');

dotenv.config({ quiet: true });

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: '*' }));
app.use(express.json());

const wsServer = setupWebSocket(server);

app.use(ioMiddleware(wsServer));

app.use('/api', chatRoutes, userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.get('/', (req, res) => {
    res.redirect('/api/docs');
});

const PORT = process.env.PORT || 3000;

// Only start the server if this file is run directly (not during tests)
if (require.main === module) {
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = { app, server, PORT };