import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import {
  getAssignedPatients,
  getPatientDetails,
  assignPatient,
  unassignPatient,
  getDoctorProfile,
  updateDoctorProfile,
  getPatientClinicalSummary,
  getPatientAppointments,
  schedulePatientAppointment,
  updatePatientAppointment,
  getPatientPrescriptions,
  prescribeMedication,
  updatePrescriptionStatus,
  getPatientCaregiverReports,
  submitCaregiverReport,
  getPatientDailyReports,
  getPatientScreeningHistory,
  getPatientClinicalTimeline,
  getPatientDoctorNotes,
  addPatientDoctorNote,
  getPatientCarePlans,
  createPatientCarePlan,
  updatePatientCarePlan,
} from '../controllers/doctorController.js';
import {
  getAppointments,
  addAppointment,
  updateAppointment,
  deleteAppointment,
  startVideoCall,
  endVideoCall,
  getCallStatus,
} from '../controllers/appointmentController.js';
import {
  getMedicalReports,
} from '../controllers/medicalReportController.js';
import {
  getMedicines,
  addMedicine,
  updateMedicine,
  deleteMedicine,
} from '../controllers/medicineController.js';
import {
  getSchedule,
  addSchedule,
  updateSchedule,
  deleteSchedule,
} from '../controllers/scheduleController.js';

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRoles('doctor'));

// Doctor Profile & Settings
router.get('/profile', getDoctorProfile);
router.put('/profile', updateDoctorProfile);

// Patients List & Assignment
router.get('/patients', getAssignedPatients);
router.post('/patients/assign', assignPatient);
router.post('/assign-patient', assignPatient);
router.delete('/patients/:patientId/unassign', unassignPatient);

// Patient Clinical Management & Monitoring
router.get('/patients/:patientId/clinical-summary', getPatientClinicalSummary);
router.get('/patients/:patientId/appointments', getPatientAppointments);
router.post('/patients/:patientId/appointments', schedulePatientAppointment);
router.put('/appointments/:appointmentId', updatePatientAppointment);
router.get('/patients/:patientId/prescriptions', getPatientPrescriptions);
router.post('/patients/:patientId/prescriptions', prescribeMedication);
router.put('/prescriptions/:prescriptionId', updatePrescriptionStatus);
router.get('/patients/:patientId/caregiver-reports', getPatientCaregiverReports);
router.post('/patients/:patientId/caregiver-reports', submitCaregiverReport);
router.get('/patients/:patientId/daily-reports', getPatientDailyReports);
router.get('/patients/:patientId/screenings', getPatientScreeningHistory);
router.get('/patients/:patientId/timeline', getPatientClinicalTimeline);
router.get('/patients/:patientId/notes', getPatientDoctorNotes);
router.post('/patients/:patientId/notes', addPatientDoctorNote);
router.get('/patients/:patientId/care-plans', getPatientCarePlans);
router.post('/patients/:patientId/care-plans', createPatientCarePlan);
router.put('/care-plans/:planId', updatePatientCarePlan);
router.get('/patients/:patientId', getPatientDetails);

// Medicines
router.get('/medicines', getMedicines);
router.post('/medicines', addMedicine);
router.put('/medicines/:id', updateMedicine);
router.delete('/medicines/:id', deleteMedicine);

// Schedule
router.get('/schedules', getSchedule);
router.post('/schedules', addSchedule);
router.put('/schedules/:id', updateSchedule);
router.delete('/schedules/:id', deleteSchedule);

// Appointments
router.get('/appointments', getAppointments);
router.post('/appointments', addAppointment);
router.put('/appointments/:id', updateAppointment);
router.delete('/appointments/:id', deleteAppointment);

// Medical Reports
router.get('/medical-reports', getMedicalReports);

// Online Video Consultation
router.post('/appointments/:appointmentId/start-call', startVideoCall);
router.post('/appointments/:appointmentId/end-call', endVideoCall);
router.get('/appointments/:appointmentId/call-status', getCallStatus);

export default router;
