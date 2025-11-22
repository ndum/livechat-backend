import { Router } from 'express';
import chatController from '../../controllers/chat.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import {
  createMessageSchema,
  updateMessageSchema,
  getMessageSchema,
  deleteMessageSchema,
} from '../../validators/index.js';

const router = Router();

/**
 * @swagger
 * /messages:
 *   get:
 *     tags:
 *       - Chat
 *     summary: Get all messages
 *     responses:
 *       200:
 *         description: List of messages
 */
router.get('/', chatController.getAllMessages);

/**
 * @swagger
 * /messages/{id}:
 *   get:
 *     tags:
 *       - Chat
 *     summary: Get a single message
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message found
 */
router.get('/:id', validate(getMessageSchema), chatController.getMessageById);

/**
 * @swagger
 * /messages:
 *   post:
 *     tags:
 *       - Chat
 *     summary: Create a new message
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message created
 */
router.post('/', authenticate, validate(createMessageSchema), chatController.createMessage);

/**
 * @swagger
 * /messages/{id}:
 *   put:
 *     tags:
 *       - Chat
 *     summary: Update a message
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message updated
 */
router.put('/:id', authenticate, validate(updateMessageSchema), chatController.updateMessage);

/**
 * @swagger
 * /messages/{id}:
 *   delete:
 *     tags:
 *       - Chat
 *     summary: Delete a message
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message deleted
 */
router.delete('/:id', authenticate, validate(deleteMessageSchema), chatController.deleteMessage);

export default router;
