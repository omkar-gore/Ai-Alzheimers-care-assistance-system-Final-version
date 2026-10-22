import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  startVideoCall,
  endVideoCall,
  respondToCall,
  getCallStatus,
  getActiveCallInvitations,
  consultationStream,
} from '../controllers/appointmentController.js';

const router = express.Router();

router.use(authenticateToken);

// Real-time SSE stream & active invitations
router.get('/consultation-stream', consultationStream);
router.get('/active-call-invitations', getActiveCallInvitations);

// Call lifecycle endpoints
router.post('/:appointmentId/start-call', startVideoCall);
router.post('/:appointmentId/end-call', endVideoCall);
router.post('/:appointmentId/call-response', respondToCall);
router.get('/:appointmentId/call-status', getCallStatus);

export default router;
