const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /users:
 *   get:
 *     tags:
 *       - User
 *     description: Returns all users
 *     responses:
 *       200:
 *         description: Successfully retrieved users
 */
router.get('/users', userController.getAllUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags:
 *       - User
 *     description: Returns a single user
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the user to retrieve
 *         type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved user
 */
router.get('/users/:id', userController.getUser);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     tags:
 *       - User
 *     description: Update a user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the user to update
 *         type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully updated user
 */
router.put('/users/:id', authMiddleware, userController.updateUser);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     tags:
 *       - User
 *     description: Delete a user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the user to delete
 *         type: string
 *     responses:
 *       200:
 *         description: Successfully deleted user
 */
router.delete('/users/:id', authMiddleware, userController.deleteUser);

module.exports = router;