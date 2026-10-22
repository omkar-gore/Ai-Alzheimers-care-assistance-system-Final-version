import Schedule from '../models/Schedule.js';
import { resolveTargetPatient, isAuthorizedForPatient } from '../utils/authCheck.js';

// ===============================
// GET SCHEDULE
// ===============================
export const getSchedule = async (req, res) => {
  try {
    const targetPatientId = await resolveTargetPatient(req.user, req.query.patientId);

    const schedule = await Schedule.find({
      patient: targetPatientId,
    }).sort({ time: 1 });

    return res.status(200).json(schedule);
  } catch (error) {
    console.error('Get schedule error:', error);
    return res.status(error.status || 500).json({
      message: error.message || 'Failed to get schedule',
    });
  }
};

// ===============================
// ADD SCHEDULE
// ===============================
export const addSchedule = async (req, res) => {
  try {
    if (req.user.role !== 'caregiver' && req.user.role !== 'doctor') {
      return res.status(403).json({
        message: 'Permission denied: Only caregivers or doctors can add schedule items',
      });
    }

    const targetPatientId = await resolveTargetPatient(req.user, req.body.patientId);
    const { time, activity, notes } = req.body;

    if (!time?.trim() || !activity?.trim()) {
      return res.status(400).json({
        message: 'Time and activity are required',
      });
    }

    const newSchedule = new Schedule({
      patient: targetPatientId,
      time: time.trim(),
      activity: activity.trim(),
      notes: notes ? notes.trim() : '',
    });

    await newSchedule.save();
    return res.status(201).json(newSchedule);
  } catch (error) {
    console.error('Add schedule error:', error);
    return res.status(error.status || 500).json({
      message: error.message || 'Failed to add schedule',
    });
  }
};

// ===============================
// UPDATE SCHEDULE
// ===============================
export const updateSchedule = async (req, res) => {
  try {
    if (req.user.role !== 'caregiver' && req.user.role !== 'doctor') {
      return res.status(403).json({
        message: 'Permission denied: Only caregivers or doctors can update schedule items',
      });
    }

    const schedId = req.params.id;
    const schedule = await Schedule.findById(schedId);

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule item not found' });
    }

    const authorized = await isAuthorizedForPatient(req.user, schedule.patient);
    if (!authorized) {
      return res.status(403).json({
        message: 'Permission denied: You are not authorized for this patient',
      });
    }

    const { time, activity, notes } = req.body;
    if (time !== undefined) schedule.time = time.trim();
    if (activity !== undefined) schedule.activity = activity.trim();
    if (notes !== undefined) schedule.notes = notes.trim();

    await schedule.save();
    return res.status(200).json(schedule);
  } catch (error) {
    console.error('Update schedule error:', error);
    return res.status(error.status || 500).json({
      message: error.message || 'Failed to update schedule',
    });
  }
};

// ===============================
// DELETE SCHEDULE
// ===============================
export const deleteSchedule = async (req, res) => {
  try {
    if (req.user.role !== 'caregiver' && req.user.role !== 'doctor') {
      return res.status(403).json({
        message: 'Permission denied: Only caregivers or doctors can delete schedule items',
      });
    }

    const schedId = req.params.id;
    const schedule = await Schedule.findById(schedId);

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule item not found' });
    }

    const authorized = await isAuthorizedForPatient(req.user, schedule.patient);
    if (!authorized) {
      return res.status(403).json({
        message: 'Permission denied: You are not authorized for this patient',
      });
    }

    await Schedule.findByIdAndDelete(schedId);
    return res.status(200).json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Delete schedule error:', error);
    return res.status(error.status || 500).json({
      message: error.message || 'Failed to delete schedule',
    });
  }
};