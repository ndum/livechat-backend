import bcrypt from 'bcryptjs';
import { User } from '@prisma/client';
import userRepository from '../repositories/user.repository.js';
import { UpdateUserDTO } from '../validators/index.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import { getWebSocketManager } from '../infrastructure/websocket.js';

export class UserService {
  /**
   * Retrieves all users without password field
   * @returns Array of all users (passwords excluded)
   */
  async getAllUsers(): Promise<User[]> {
    return userRepository.findAll();
  }

  /**
   * Retrieves a single user by ID without password field
   * @param id - User ID
   * @returns The requested user (password excluded)
   * @throws {NotFoundError} If user does not exist
   */
  async getUserById(id: string): Promise<User> {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new NotFoundError('User');
    }

    return user;
  }

  /**
   * Updates user profile with ownership validation
   * @param id - User ID to update
   * @param requestingUserId - ID of the user making the request (for ownership check)
   * @param data - Updated user data (username and/or password)
   * @returns The updated user (password excluded)
   * @throws {NotFoundError} If user does not exist
   * @throws {ForbiddenError} If requesting user is not the owner
   */
  async updateUser(id: string, requestingUserId: string, data: UpdateUserDTO): Promise<User> {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new NotFoundError('User');
    }

    if (user.id !== requestingUserId) {
      throw new ForbiddenError('You can only update your own profile');
    }

    const updateData: Partial<UpdateUserDTO> = { ...data };
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const updatedUser = await userRepository.update(id, updateData);

    const wsManager = getWebSocketManager();
    if (wsManager) {
      wsManager.broadcast({
        type: 'changed_user',
        data: updatedUser,
      });
    }

    return updatedUser;
  }

  /**
   * Deletes user account with ownership validation
   * @param id - User ID to delete
   * @param requestingUserId - ID of the user making the request (for ownership check)
   * @returns Success confirmation
   * @throws {NotFoundError} If user does not exist
   * @throws {ForbiddenError} If requesting user is not the owner
   */
  async deleteUser(id: string, requestingUserId: string): Promise<{ success: boolean }> {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new NotFoundError('User');
    }

    if (user.id !== requestingUserId) {
      throw new ForbiddenError('You can only delete your own account');
    }

    const deletedUser = await userRepository.delete(id);

    const wsManager = getWebSocketManager();
    if (wsManager) {
      wsManager.broadcast({
        type: 'deleted_user',
        data: deletedUser,
      });
    }

    return { success: true };
  }
}

export default new UserService();
