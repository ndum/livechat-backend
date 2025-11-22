import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '../infrastructure/database.js';
import { getEnv } from '../config/env.js';

const env = getEnv();

export interface TestUser {
  id: string;
  username: string;
  password: string;
  token: string;
}

/**
 * Create a test user in the database
 */
export async function createTestUser(
  username: string = 'testuser',
  password: string = 'testpassword123'
): Promise<TestUser> {
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
    },
  });

  const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, {
    expiresIn: '24h',
  });

  return {
    id: user.id,
    username: user.username,
    password, // Return plain password for testing
    token,
  };
}

/**
 * Create a test message in the database
 */
export async function createTestMessage(userId: string, message: string = 'Test message') {
  // Fetch the user to get their username
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error(`User with id ${userId} not found`);
  }

  return await prisma.chatMessage.create({
    data: {
      username: user.username,
      message,
    },
  });
}

/**
 * Generate a valid JWT token for testing
 */
export function generateTestToken(userId: string): string {
  return jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: '24h' });
}

/**
 * Generate an invalid/expired JWT token for testing
 */
export function generateInvalidToken(): string {
  return 'invalid.token.here';
}
