import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { createTestUser } from './helpers.js';

describe('Authentication API', () => {
  describe('POST /api/v1/auth/register', () => {
    it('should register a new user with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'newuser',
          password: 'password123',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
    });

    it('should reject registration with duplicate username', async () => {
      await createTestUser('existinguser', 'password123');

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'existinguser',
          password: 'password123',
        });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject registration with short username', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'ab',
          password: 'password123',
        });

      expect(response.status).toBe(400);
    });

    it('should reject registration with short password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'validuser',
          password: 'short',
        });

      expect(response.status).toBe(400);
    });

    it('should reject registration with missing username', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          password: 'password123',
        });

      expect(response.status).toBe(400);
    });

    it('should reject registration with missing password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'validuser',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login with valid credentials', async () => {
      const testUser = await createTestUser('loginuser', 'password123');

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: 'loginuser',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('userId');
      expect(response.body.userId).toBe(testUser.id);
    });

    it('should reject login with invalid username', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: 'nonexistent',
          password: 'password123',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject login with invalid password', async () => {
      await createTestUser('loginuser2', 'correctpassword');

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: 'loginuser2',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject login with missing username', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          password: 'password123',
        });

      expect(response.status).toBe(400);
    });

    it('should reject login with missing password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: 'loginuser',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout a user with authentication', async () => {
      const user = await createTestUser();

      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${user.token}`)
        .send();

      expect(response.status).toBe(200);
    });

    it('should reject logout without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .send();

      expect(response.status).toBe(401);
    });
  });
});
