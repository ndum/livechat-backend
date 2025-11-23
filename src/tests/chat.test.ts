import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { createTestUser, createTestMessage } from './helpers.js';

describe('Chat API', () => {
  describe('GET /api/v1/messages', () => {
    it('should get all messages', async () => {
      const user = await createTestUser();
      await createTestMessage(user.id, 'Message 1');
      await createTestMessage(user.id, 'Message 2');

      const response = await request(app).get('/api/v1/messages');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });

    it('should return empty array when no messages exist', async () => {
      const response = await request(app).get('/api/v1/messages');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('GET /api/v1/messages/:id', () => {
    it('should get a message by id', async () => {
      const user = await createTestUser();
      const message = await createTestMessage(user.id, 'Test message');

      const response = await request(app).get(`/api/v1/messages/${message.id}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(message.id);
      expect(response.body.message).toBe('Test message');
    });

    it('should return 404 for non-existent message', async () => {
      // Use a valid MongoDB ObjectId that doesn't exist
      const response = await request(app).get('/api/v1/messages/507f1f77bcf86cd799439011');

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/v1/messages', () => {
    it('should create a new message with authentication', async () => {
      const user = await createTestUser();

      const response = await request(app)
        .post('/api/v1/messages')
        .set('Authorization', `Bearer ${user.token}`)
        .send({
          message: 'New test message',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.message).toBe('New test message');
      expect(response.body.username).toBe(user.username);
    });

    it('should reject message creation without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/messages')
        .send({
          message: 'Test message',
        });

      expect(response.status).toBe(401);
    });

    it('should reject message creation with invalid token', async () => {
      const response = await request(app)
        .post('/api/v1/messages')
        .set('Authorization', 'Bearer invalid.token.here')
        .send({
          message: 'Test message',
        });

      expect(response.status).toBe(401);
    });

    it('should reject empty message', async () => {
      const user = await createTestUser();

      const response = await request(app)
        .post('/api/v1/messages')
        .set('Authorization', `Bearer ${user.token}`)
        .send({
          message: '',
        });

      expect(response.status).toBe(400);
    });

    it('should reject message without message field', async () => {
      const user = await createTestUser();

      const response = await request(app)
        .post('/api/v1/messages')
        .set('Authorization', `Bearer ${user.token}`)
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/v1/messages/:id', () => {
    it('should update own message with authentication', async () => {
      const user = await createTestUser();
      const message = await createTestMessage(user.id, 'Original message');

      const response = await request(app)
        .put(`/api/v1/messages/${message.id}`)
        .set('Authorization', `Bearer ${user.token}`)
        .send({
          message: 'Updated message',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Updated message');
      expect(response.body.id).toBe(message.id);
    });

    it('should reject update without authentication', async () => {
      const user = await createTestUser();
      const message = await createTestMessage(user.id, 'Original message');

      const response = await request(app)
        .put(`/api/v1/messages/${message.id}`)
        .send({
          message: 'Updated message',
        });

      expect(response.status).toBe(401);
    });

    it('should reject updating another users message', async () => {
      const user1 = await createTestUser('user1');
      const user2 = await createTestUser('user2');
      const message = await createTestMessage(user1.id, 'User1 message');

      const response = await request(app)
        .put(`/api/v1/messages/${message.id}`)
        .set('Authorization', `Bearer ${user2.token}`)
        .send({
          message: 'Trying to update',
        });

      expect(response.status).toBe(403);
    });

    it('should reject update with empty message', async () => {
      const user = await createTestUser();
      const message = await createTestMessage(user.id, 'Original message');

      const response = await request(app)
        .put(`/api/v1/messages/${message.id}`)
        .set('Authorization', `Bearer ${user.token}`)
        .send({
          message: '',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/v1/messages/:id', () => {
    it('should delete own message with authentication', async () => {
      const user = await createTestUser();
      const message = await createTestMessage(user.id, 'Message to delete');

      const response = await request(app)
        .delete(`/api/v1/messages/${message.id}`)
        .set('Authorization', `Bearer ${user.token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
    });

    it('should reject delete without authentication', async () => {
      const user = await createTestUser();
      const message = await createTestMessage(user.id, 'Message to delete');

      const response = await request(app).delete(`/api/v1/messages/${message.id}`);

      expect(response.status).toBe(401);
    });

    it('should reject deleting another users message', async () => {
      const user1 = await createTestUser('user1');
      const user2 = await createTestUser('user2');
      const message = await createTestMessage(user1.id, 'User1 message');

      const response = await request(app)
        .delete(`/api/v1/messages/${message.id}`)
        .set('Authorization', `Bearer ${user2.token}`);

      expect(response.status).toBe(403);
    });

    it('should return 404 when deleting non-existent message', async () => {
      const user = await createTestUser();

      // Use a valid MongoDB ObjectId that doesn't exist
      const response = await request(app)
        .delete('/api/v1/messages/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${user.token}`);

      expect(response.status).toBe(404);
    });
  });
});
