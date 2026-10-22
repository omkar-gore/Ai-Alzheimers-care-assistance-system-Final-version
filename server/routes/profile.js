import express from 'express';

import {
  authenticateToken,
  authorizeRoles,
} from '../middleware/auth.js';

import {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
} from '../controllers/profileController.js';

const router = express.Router();

// All profile routes require a valid login.
router.use(authenticateToken);

// These routes are specifically for caregivers.
router.use(authorizeRoles('caregiver'));

// Get current caregiver profile
router.get('/', getProfile);

// Update current caregiver profile
router.put('/', updateProfile);

// Change account password
router.put('/password', changePassword);

// Permanently delete account
router.delete('/', deleteAccount);

export default router;
