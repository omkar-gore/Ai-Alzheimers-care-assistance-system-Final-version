import express from 'express';

import {
  authenticateToken,
  authorizeRoles,
} from '../middleware/auth.js';

import {
  getMessages,
  sendMessage,
  markMessagesAsRead,
  getChatDoctors,
} from '../controllers/messageController.js';

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRoles('caregiver', 'doctor'));

// Caregiver can see available doctors
router.get('/doctors', getChatDoctors);

// Get conversation with another user
router.get('/:userId', getMessages);

// Send a message
router.post('/', sendMessage);

// Mark messages from another user as read
router.put('/:userId/read', markMessagesAsRead);

export default router;