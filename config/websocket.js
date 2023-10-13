const WebSocket = require('ws');

const setupWebSocket = (server) => {
    const WS_OPTIONS = {
        server: server
    };

    const wsServer = new WebSocket.Server(WS_OPTIONS).on('error', err => {
        console.error('Error with WebSocket Server:', err.message);
    });

    wsServer.on('connection', (ws) => {
        console.log('WebSocket user connected');

        ws.on('message', (message) => {
            // Handle chat messages from websocket clients
        });

        ws.on('close', () => {
            console.log('WebSocket user disconnected');
        });
    });

    return wsServer;
};

module.exports = setupWebSocket;