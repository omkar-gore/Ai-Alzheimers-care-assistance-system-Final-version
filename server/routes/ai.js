import express from 'express';
import { aiChat } from '../controllers/aiController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/chat', authenticateToken, aiChat);

export default router;
