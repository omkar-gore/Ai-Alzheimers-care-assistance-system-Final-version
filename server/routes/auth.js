import express from 'express';
import { register, login, changePassword } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route POST /api/auth/register
 * Register user for all roles
 */
router.post('/register', register);

/**
 * @route POST /api/auth/login
 * Login user for all roles
 */
router.post('/login', login);

/**
 * @route PUT /api/auth/change-password
 * Change password for authenticated users of any role
 */
router.put('/change-password', authenticateToken, changePassword);

export default router;
