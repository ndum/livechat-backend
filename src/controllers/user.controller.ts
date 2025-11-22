import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import userService from '../services/user.service.js';
import { UpdateUserDTO } from '../validators/index.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import logger from '../config/logger.js';

export class UserController {
  getAllUsers = asyncHandler(async (_req: AuthRequest, res: Response): Promise<void> => {
    const users = await userService.getAllUsers();

    res.status(200).json(users);
  });

  getUserById = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!id) {
      throw new Error('User ID is required');
    }

    const user = await userService.getUserById(id);

    res.status(200).json(user);
  });

  updateUser = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const data: UpdateUserDTO = req.body;
    const requestingUserId = req.userId;

    if (!id || !requestingUserId) {
      throw new Error('User ID and authentication required');
    }

    const user = await userService.updateUser(id, requestingUserId, data);

    logger.info(`User updated: ${id} by ${requestingUserId}`);

    res.status(200).json(user);
  });

  deleteUser = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const requestingUserId = req.userId;

    if (!id || !requestingUserId) {
      throw new Error('User ID and authentication required');
    }

    const result = await userService.deleteUser(id, requestingUserId);

    logger.info(`User deleted: ${id} by ${requestingUserId}`);

    res.status(200).json(result);
  });
}

export default new UserController();
