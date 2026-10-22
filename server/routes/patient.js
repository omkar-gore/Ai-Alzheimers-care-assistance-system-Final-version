import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

import {
  getMedicines,
  addMedicine,
  updateMedicine,
  deleteMedicine,
  toggleMedicineStatus,
} from '../controllers/medicineController.js';

import {
  getSchedule,
  addSchedule,
  updateSchedule,
  deleteSchedule,
} from '../controllers/scheduleController.js';

import {
  getTasks,
  addTask,
  updateTask,
  deleteTask,
  completeTask,
} from '../controllers/taskController.js';

import {
  getAppointments,
} from '../controllers/appointmentController.js';

import {
  getMedicalReports,
} from '../controllers/medicalReportController.js';

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRoles('patient', 'caregiver'));

// Medicines
router.get('/medicines', getMedicines);
router.post('/medicines', addMedicine);
router.put('/medicines/:id', updateMedicine);
router.post('/medicines/:id/toggle', toggleMedicineStatus);
router.patch('/medicines/:id/toggle', toggleMedicineStatus);
router.delete('/medicines/:id', deleteMedicine);

// Schedule
router.get('/schedules', getSchedule);
router.post('/schedules', addSchedule);
router.put('/schedules/:id', updateSchedule);
router.delete('/schedules/:id', deleteSchedule);

// Tasks
router.get('/tasks', getTasks);
router.post('/tasks', addTask);
router.put('/tasks/:id', updateTask);
router.delete('/tasks/:id', deleteTask);
router.post('/tasks/:id/complete', completeTask);

// Appointments
router.get('/appointments', getAppointments);

// Medical Reports
router.get('/medical-reports', getMedicalReports);

export default router;
