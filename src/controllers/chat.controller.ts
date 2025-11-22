import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import chatService from '../services/chat.service.js';
import { CreateMessageDTO, UpdateMessageDTO } from '../validators/index.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import logger from '../config/logger.js';

export class ChatController {
  getAllMessages = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const messages = await chatService.getAllMessages();

    res.status(200).json(messages);
  });

  getMessageById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!id) {
      throw new Error('Message ID is required');
    }

    const message = await chatService.getMessageById(id);

    res.status(200).json(message);
  });

  createMessage = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const data: CreateMessageDTO = req.body;
    const username = req.user?.username || 'Unknown';

    const message = await chatService.createMessage(username, data);

    logger.info(`Message created by: ${username}`);

    res.status(201).json(message);
  });

  updateMessage = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const data: UpdateMessageDTO = req.body;
    const username = req.user?.username;

    if (!id || !username) {
      throw new Error('Message ID and user authentication required');
    }

    const message = await chatService.updateMessage(id, username, data);

    logger.info(`Message updated: ${id} by ${username}`);

    res.status(200).json(message);
  });

  deleteMessage = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const username = req.user?.username;

    if (!id || !username) {
      throw new Error('Message ID and user authentication required');
    }

    const result = await chatService.deleteMessage(id, username);

    logger.info(`Message deleted: ${id} by ${username}`);

    res.status(200).json(result);
  });
}

export default new ChatController();
