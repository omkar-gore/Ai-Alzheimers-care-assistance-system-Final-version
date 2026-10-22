import express from 'express';
import {
  authenticateToken,
  optionalAuthenticate,
} from '../middleware/auth.js';
import {
  submitScreening,
  getScreeningHistory,
  getScreeningById,
  registerScreeningUser,
  linkScreeningToUser,
} from '../controllers/screeningController.js';

const router = express.Router();

// ==========================================
// PUBLIC & OPTIONAL AUTH ROUTES
// ==========================================

// Submit screening (anonymous or authenticated)
router.post('/', optionalAuthenticate, submitScreening);

// Register a screening user account (to save history)
router.post('/register', registerScreeningUser);

// Get single screening detail (with optional auth check)
router.get('/:id', optionalAuthenticate, getScreeningById);

// ==========================================
// PROTECTED ROUTES (AUTHENTICATED SCREENING USERS)
// ==========================================

// Get user's past screening history
router.get('/user/history', authenticateToken, getScreeningHistory);
router.get('/history', authenticateToken, getScreeningHistory);

// Link an anonymous screening to current logged-in account
router.post('/link/:screeningId', authenticateToken, linkScreeningToUser);

export default router;
