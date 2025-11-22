import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import logger from '../config/logger.js';

export interface WebSocketMessage {
  type: 'new_message' | 'changed_message' | 'deleted_message' | 'new_login' | 'changed_user' | 'deleted_user';
  data: unknown;
}

export class WebSocketManager {
  private wss: WebSocketServer;

  constructor(server: HttpServer) {
    this.wss = new WebSocketServer({ server });

    this.wss.on('error', (error) => {
      logger.error({ err: error }, 'WebSocket Server Error');
    });

    this.wss.on('connection', (ws: WebSocket) => {
      logger.info('WebSocket client connected');

      ws.on('message', (message: Buffer) => {
        try {
          const data = JSON.parse(message.toString());
          logger.debug('WebSocket message received:', data);
          // Handle incoming WebSocket messages if needed
        } catch (error) {
          logger.error({ err: error }, 'WebSocket message parse error');
        }
      });

      ws.on('close', () => {
        logger.info('WebSocket client disconnected');
      });

      ws.on('error', (error) => {
        logger.error({ err: error }, 'WebSocket client error');
      });
    });

    logger.info('WebSocket server initialized');
  }

  broadcast(message: WebSocketMessage): void {
    const data = JSON.stringify(message);

    this.wss.clients.forEach((client) => {
      // Only send to clients with open connections to prevent errors
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });

    logger.debug(`WebSocket broadcast: ${message.type}`);
  }

  getServer(): WebSocketServer {
    return this.wss;
  }
}

// Singleton instance to ensure all parts of the app use the same WebSocket server
let wsManager: WebSocketManager | null = null;

export function initializeWebSocket(server: HttpServer): WebSocketManager {
  if (!wsManager) {
    wsManager = new WebSocketManager(server);
  }
  return wsManager;
}

export function getWebSocketManager(): WebSocketManager | null {
  return wsManager;
}
