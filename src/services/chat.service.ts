import { ChatMessage } from '@prisma/client';
import chatMessageRepository from '../repositories/chatMessage.repository.js';
import { CreateMessageDTO, UpdateMessageDTO } from '../validators/index.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import { getWebSocketManager } from '../infrastructure/websocket.js';

export class ChatService {
  /**
   * Retrieves all chat messages
   * @returns Array of all chat messages
   */
  async getAllMessages(): Promise<ChatMessage[]> {
    return chatMessageRepository.findAll();
  }

  /**
   * Retrieves a single chat message by ID
   * @param id - Message ID
   * @returns The requested message
   * @throws {NotFoundError} If message does not exist
   */
  async getMessageById(id: string): Promise<ChatMessage> {
    const message = await chatMessageRepository.findById(id);

    if (!message) {
      throw new NotFoundError('Message');
    }

    return message;
  }

  /**
   * Creates a new chat message and broadcasts it to connected clients
   * @param username - Username of the message author
   * @param data - Message content
   * @returns The created message
   */
  async createMessage(username: string, data: CreateMessageDTO): Promise<ChatMessage> {
    const message = await chatMessageRepository.create(username, data);

    const wsManager = getWebSocketManager();
    if (wsManager) {
      wsManager.broadcast({
        type: 'new_message',
        data: message,
      });
    }

    return message;
  }

  /**
   * Updates an existing chat message with ownership validation
   * @param id - Message ID
   * @param username - Username of requesting user (for ownership check)
   * @param data - Updated message content
   * @returns The updated message
   * @throws {NotFoundError} If message does not exist
   * @throws {ForbiddenError} If user does not own the message
   */
  async updateMessage(id: string, username: string, data: UpdateMessageDTO): Promise<ChatMessage> {
    const message = await chatMessageRepository.findById(id);

    if (!message) {
      throw new NotFoundError('Message');
    }

    if (message.username !== username) {
      throw new ForbiddenError('You can only update your own messages');
    }

    const updatedMessage = await chatMessageRepository.update(id, username, data);

    if (!updatedMessage) {
      throw new NotFoundError('Message');
    }

    const wsManager = getWebSocketManager();
    if (wsManager) {
      wsManager.broadcast({
        type: 'changed_message',
        data: updatedMessage,
      });
    }

    return updatedMessage;
  }

  /**
   * Deletes a chat message with ownership validation
   * @param id - Message ID
   * @param username - Username of requesting user (for ownership check)
   * @returns Success confirmation
   * @throws {NotFoundError} If message does not exist
   * @throws {ForbiddenError} If user does not own the message
   */
  async deleteMessage(id: string, username: string): Promise<{ success: boolean }> {
    const message = await chatMessageRepository.findById(id);

    if (!message) {
      throw new NotFoundError('Message');
    }

    if (message.username !== username) {
      throw new ForbiddenError('You can only delete your own messages');
    }

    const deletedMessage = await chatMessageRepository.delete(id);

    const wsManager = getWebSocketManager();
    if (wsManager) {
      wsManager.broadcast({
        type: 'deleted_message',
        data: deletedMessage,
      });
    }

    return { success: true };
  }
}

export default new ChatService();
