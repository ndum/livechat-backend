import { beforeAll, afterAll, beforeEach } from 'vitest';
import { prisma } from '../infrastructure/database.js';

// Setup before all tests
beforeAll(async () => {
  // Database is already connected via the singleton
  console.log('Test suite starting...');
});

// Cleanup after all tests
afterAll(async () => {
  await prisma.$disconnect();
  console.log('Test suite completed');
});

// Clean up database before each test
beforeEach(async () => {
  // Clean database tables in correct order (respecting foreign keys)
  // With replica set enabled, we can use deleteMany directly
  await prisma.chatMessage.deleteMany({});
  await prisma.user.deleteMany({});
});
