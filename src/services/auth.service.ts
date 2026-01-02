import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userRepository from '../repositories/user.repository.js';
import { RegisterDTO, LoginDTO } from '../validators/index.js';
import { ConflictError, UnauthorizedError } from '../utils/errors.js';
import { getEnv } from '../config/env.js';
import { getWebSocketManager } from '../infrastructure/websocket.js';

const env = getEnv();

export class AuthService {
  /**
   * Registers a new user with hashed password
   * @param data - User registration data (username, password)
   * @returns Success confirmation
   * @throws {ConflictError} If username already exists
   */
  async register(data: RegisterDTO): Promise<{ success: boolean }> {
    const existingUser = await userRepository.findByUsername(data.username);
    if (existingUser) {
      throw new ConflictError('Username is already taken');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    await userRepository.create({
      username: data.username,
      password: hashedPassword,
    });

    return { success: true };
  }

  /**
   * Authenticates user and generates JWT token
   * @param data - Login credentials (username, password)
   * @returns User ID and JWT token valid for 1 hour
   * @throws {UnauthorizedError} If credentials are invalid
   */
  async login(data: LoginDTO): Promise<{ userId: string; token: string }> {
    const user = await userRepository.findByUsername(data.username);

    if (!user) {
      throw new UnauthorizedError('Wrong username or password');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Wrong username or password');
    }

    await userRepository.updateLastActivity(user.id);

    const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, {
      expiresIn: '1h',
    });

    const wsManager = getWebSocketManager();
    if (wsManager) {
      wsManager.broadcast({
        type: 'new_login',
        data: { username: data.username },
      });
    }

    return {
      userId: user.id,
      token,
    };
  }

  /**
   * Handles the logout and sends websocket event
   * @param username Username of the user logging out
   * @param userId ID of the user logging out
   * @throws {UnauthorizedError} If credentials are invalid
   */
  async logout(username: string, userId: string){
    await userRepository.updateLastActivity(userId);

    const wsManager = getWebSocketManager();
    if (wsManager) {
      wsManager.broadcast({
        type: 'new_logout',
        data: { username },
      });
    }
  }
}

export default new AuthService();
