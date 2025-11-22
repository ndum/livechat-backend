import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../server.js';
import { createTestUser } from './helpers.js';

describe('User API', () => {
  describe('GET /api/v1/users', () => {
    it('should get all users with authentication', async () => {
      const user1 = await createTestUser('user1');
      await createTestUser('user2');

      const response = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${user1.token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });

    it('should reject getting users without authentication', async () => {
      const response = await request(app).get('/api/v1/users');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/users/:id', () => {
    it('should get a user by id with authentication', async () => {
      const user1 = await createTestUser('user1');
      const user2 = await createTestUser('user2');

      const response = await request(app)
        .get(`/api/v1/users/${user2.id}`)
        .set('Authorization', `Bearer ${user1.token}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(user2.id);
      expect(response.body.username).toBe('user2');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should reject getting user without authentication', async () => {
      const user = await createTestUser();

      const response = await request(app).get(`/api/v1/users/${user.id}`);

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent user', async () => {
      const user = await createTestUser();

      // Use a valid MongoDB ObjectId that doesn't exist
      const response = await request(app)
        .get('/api/v1/users/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${user.token}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/v1/users/:id', () => {
    it('should update own user profile', async () => {
      const user = await createTestUser('oldusername');

      const response = await request(app)
        .put(`/api/v1/users/${user.id}`)
        .set('Authorization', `Bearer ${user.token}`)
        .send({
          username: 'newusername',
        });

      expect(response.status).toBe(200);
      expect(response.body.username).toBe('newusername');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should update own password', async () => {
      const user = await createTestUser();

      const response = await request(app)
        .put(`/api/v1/users/${user.id}`)
        .set('Authorization', `Bearer ${user.token}`)
        .send({
          password: 'newpassword123',
        });

      expect(response.status).toBe(200);

      // Verify can login with new password
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: user.username,
          password: 'newpassword123',
        });

      expect(loginResponse.status).toBe(200);
    });

    it('should reject updating another users profile', async () => {
      const user1 = await createTestUser('user1');
      const user2 = await createTestUser('user2');

      const response = await request(app)
        .put(`/api/v1/users/${user2.id}`)
        .set('Authorization', `Bearer ${user1.token}`)
        .send({
          username: 'hackedname',
        });

      expect(response.status).toBe(403);
    });

    it('should reject update without authentication', async () => {
      const user = await createTestUser();

      const response = await request(app)
        .put(`/api/v1/users/${user.id}`)
        .send({
          username: 'newname',
        });

      expect(response.status).toBe(401);
    });

    it('should reject update with short username', async () => {
      const user = await createTestUser();

      const response = await request(app)
        .put(`/api/v1/users/${user.id}`)
        .set('Authorization', `Bearer ${user.token}`)
        .send({
          username: 'ab',
        });

      expect(response.status).toBe(400);
    });

    it('should reject update with short password', async () => {
      const user = await createTestUser();

      const response = await request(app)
        .put(`/api/v1/users/${user.id}`)
        .set('Authorization', `Bearer ${user.token}`)
        .send({
          password: 'short',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/v1/users/:id', () => {
    it('should delete own user account', async () => {
      const user = await createTestUser();

      const response = await request(app)
        .delete(`/api/v1/users/${user.id}`)
        .set('Authorization', `Bearer ${user.token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
    });

    it('should reject deleting another users account', async () => {
      const user1 = await createTestUser('user1');
      const user2 = await createTestUser('user2');

      const response = await request(app)
        .delete(`/api/v1/users/${user2.id}`)
        .set('Authorization', `Bearer ${user1.token}`);

      expect(response.status).toBe(403);
    });

    it('should reject delete without authentication', async () => {
      const user = await createTestUser();

      const response = await request(app).delete(`/api/v1/users/${user.id}`);

      expect(response.status).toBe(401);
    });

    it('should return 404 when deleting non-existent user', async () => {
      const user = await createTestUser();

      // Use a valid MongoDB ObjectId that doesn't exist
      const response = await request(app)
        .delete('/api/v1/users/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${user.token}`);

      expect(response.status).toBe(404);
    });
  });
});
