import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import {
  getPaymentConfig,
  createPayment,
  getDoctorPayments,
  getCaregiverPayments,
  getPaymentById,
  createPaymentOrder,
  verifyPayment,
  paymentWebhook,
  cancelPayment,
} from '../controllers/paymentController.js';

const router = express.Router();

// Public webhook route (gateway calls directly, verified via HMAC signature)
router.post('/webhook', paymentWebhook);

// Configuration for frontend (requires authentication)
router.get('/config', authenticateToken, getPaymentConfig);

// Doctor routes
router.post('/', authenticateToken, authorizeRoles('doctor'), createPayment);
router.get('/doctor', authenticateToken, authorizeRoles('doctor'), getDoctorPayments);
router.post('/:paymentId/cancel', authenticateToken, authorizeRoles('doctor'), cancelPayment);

// Caregiver routes
router.get('/caregiver', authenticateToken, authorizeRoles('caregiver'), getCaregiverPayments);
router.post('/:paymentId/create-order', authenticateToken, authorizeRoles('caregiver'), createPaymentOrder);
router.post('/:paymentId/verify', authenticateToken, authorizeRoles('caregiver'), verifyPayment);

// Shared / Detail view route (Doctor or Caregiver)
router.get('/:paymentId', authenticateToken, authorizeRoles('doctor', 'caregiver'), getPaymentById);

export default router;
