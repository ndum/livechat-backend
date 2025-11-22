import { User } from '@prisma/client';
import prisma from '../infrastructure/database.js';
import { RegisterDTO, UpdateUserDTO } from '../validators/index.js';

export class UserRepository {
  async findAll(): Promise<User[]> {
    return prisma.user.findMany({
      select: {
        id: true,
        username: true,
        createdAt: true,
        updatedAt: true,
        // Security: Never expose password hashes to API responses
        password: false,
      },
    }) as Promise<User[]>;
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        createdAt: true,
        updatedAt: true,
        password: false,
      },
    }) as Promise<User | null>;
  }

  // Used internally for authentication - includes password hash
  async findByIdWithPassword(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  // Used for authentication - returns user with password for verification
  async findByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { username },
    });
  }

  async create(data: RegisterDTO): Promise<User> {
    return prisma.user.create({
      data: {
        username: data.username,
        // Password is already hashed by service layer before reaching repository
        password: data.password,
      },
      select: {
        id: true,
        username: true,
        createdAt: true,
        updatedAt: true,
        password: false,
      },
    }) as Promise<User>;
  }

  async update(id: string, data: Partial<UpdateUserDTO>): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        ...(data.username && { username: data.username }),
        ...(data.password && { password: data.password }),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        username: true,
        createdAt: true,
        updatedAt: true,
        password: false,
      },
    }) as Promise<User>;
  }

  async delete(id: string): Promise<User> {
    return prisma.user.delete({
      where: { id },
      select: {
        id: true,
        username: true,
        createdAt: true,
        updatedAt: true,
        password: false,
      },
    }) as Promise<User>;
  }

  async updateLastActivity(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { updatedAt: new Date() },
    });
  }
}

export default new UserRepository();
