const express = require('express');
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');


const router = express.Router();

/**
 * @swagger
 * /messages:
 *   get:
 *     tags:
 *       - Chat
 *     description: Returns all messages
 *     responses:
 *       200:
 *         description: Successfully retrieved messages
 */
router.get('/messages', chatController.getAllMessages);

/**
 * @swagger
 * /messages/{id}:
 *   get:
 *     tags:
 *       - Chat
 *     description: Returns a single message
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the message to retrieve
 *         type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved message
 */
router.get('/messages/:id', chatController.getMessage);

/**
 * @swagger
 * /messages:
 *   post:
 *     tags:
 *       - Chat
 *     description: Create a new message
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Successfully created message
 */
router.post('/messages', authMiddleware, chatController.createMessage);

/**
 * @swagger
 * /messages/{id}:
 *   put:
 *     tags:
 *       - Chat
 *     description: Update a message
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the message to update
 *         type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully updated message
 */
router.put('/messages/:id', authMiddleware, chatController.updateMessage);

/**
 * @swagger
 * /messages/{id}:
 *   delete:
 *     tags:
 *       - Chat
 *     description: Delete a message
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the message to delete
 *         type: string
 *     responses:
 *       200:
 *         description: Successfully deleted message
 */
router.delete('/messages/:id', authMiddleware, chatController.deleteMessage);

module.exports = router;