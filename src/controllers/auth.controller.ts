import { Request, Response } from 'express';
import authService from '../services/auth.service.js';
import { RegisterDTO, LoginDTO } from '../validators/index.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import logger from '../config/logger.js';
import { AuthRequest } from '../middleware/auth.js';
import { UnauthorizedError } from '../utils/errors.js';

export class AuthController {
  register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data: RegisterDTO = req.body;

    const result = await authService.register(data);

    logger.info(`User registered: ${data.username}`);

    res.status(201).json(result);
  });

  login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data: LoginDTO = req.body;

    const result = await authService.login(data);

    logger.info(`User logged in: ${data.username}`);

    res.status(200).json(result);
  });

  logout = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const username = req.user?.username;
    const userId = req.user?.id;

    if (!username || !userId) {
      throw new UnauthorizedError('User authentication required');
    }

    await authService.logout(username, userId);

    logger.info(`User logged out: ${req.user?.username}`);

    res.status(200).json({ success: true });
  });
}

export default new AuthController();
