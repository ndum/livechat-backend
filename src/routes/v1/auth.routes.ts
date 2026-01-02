import { Router } from 'express';
import authController from '../../controllers/auth.controller.js';
import { validate } from '../../middleware/validate.js';
import { registerSchema, loginSchema } from '../../validators/index.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: max
 *                 minLength: 3
 *               password:
 *                 type: string
 *                 example: password
 *                 minLength: 8
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: max
 *               password:
 *                 type: string
 *                 example: password
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Logout user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout', authenticate, authController.logout);

export default router;
