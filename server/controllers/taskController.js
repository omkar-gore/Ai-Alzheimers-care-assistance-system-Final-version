import Task from '../models/Task.js';
import { resolveTargetPatient, isAuthorizedForPatient } from '../utils/authCheck.js';

// ===============================
// GET TASKS
// ===============================
export const getTasks = async (req, res) => {
  try {
    const targetPatientId = await resolveTargetPatient(req.user, req.query.patientId);

    const tasks = await Task.find({ patient: targetPatientId }).sort({ createdAt: 1 });
    return res.status(200).json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    return res.status(error.status || 500).json({
      message: error.message || 'Failed to get tasks',
    });
  }
};

// ===============================
// ADD TASK
// ===============================
export const addTask = async (req, res) => {
  try {
    if (req.user.role !== 'caregiver' && req.user.role !== 'doctor') {
      return res.status(403).json({
        message: 'Permission denied: Only caregivers or doctors can add tasks',
      });
    }

    const targetPatientId = await resolveTargetPatient(req.user, req.body.patientId);
    const { title, dueTime } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        message: 'Task title is required',
      });
    }

    const task = new Task({
      patient: targetPatientId,
      title: title.trim(),
      dueTime: dueTime ? dueTime.trim() : '',
      status: 'pending',
    });

    await task.save();
    return res.status(201).json(task);
  } catch (error) {
    console.error('Add task error:', error);
    return res.status(error.status || 500).json({
      message: error.message || 'Failed to add task',
    });
  }
};

// ===============================
// UPDATE TASK
// ===============================
export const updateTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Patient permissions: can only update status
    if (req.user.role === 'patient') {
      if (!task.patient.equals(req.user._id)) {
        return res.status(403).json({ message: 'Permission denied: Not your task' });
      }

      if (req.body.status !== undefined) {
        task.status = req.body.status;
        task.completedAt = req.body.status === 'completed' ? new Date() : undefined;
      }
      await task.save();
      return res.status(200).json(task);
    }

    // Caregiver or Doctor: verify authorization
    const authorized = await isAuthorizedForPatient(req.user, task.patient);
    if (!authorized) {
      return res.status(403).json({
        message: 'Permission denied: You are not authorized for this patient',
      });
    }

    const { title, dueTime, status } = req.body;
    if (title !== undefined) task.title = title.trim();
    if (dueTime !== undefined) task.dueTime = dueTime.trim();
    if (status !== undefined) {
      task.status = status;
      task.completedAt = status === 'completed' ? new Date() : undefined;
    }

    await task.save();
    return res.status(200).json(task);
  } catch (error) {
    console.error('Update task error:', error);
    return res.status(error.status || 500).json({
      message: error.message || 'Failed to update task',
    });
  }
};

// ===============================
// DELETE TASK
// ===============================
export const deleteTask = async (req, res) => {
  try {
    if (req.user.role !== 'caregiver' && req.user.role !== 'doctor') {
      return res.status(403).json({
        message: 'Permission denied: Only caregivers or doctors can delete tasks',
      });
    }

    const taskId = req.params.id;
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const authorized = await isAuthorizedForPatient(req.user, task.patient);
    if (!authorized) {
      return res.status(403).json({
        message: 'Permission denied: You are not authorized for this patient',
      });
    }

    await Task.findByIdAndDelete(taskId);
    return res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    return res.status(error.status || 500).json({
      message: error.message || 'Failed to delete task',
    });
  }
};

// ===============================
// COMPLETE TASK (PATIENT OR CAREGIVER)
// ===============================
export const completeTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.user.role === 'patient') {
      if (!task.patient.equals(req.user._id)) {
        return res.status(403).json({ message: 'Permission denied: Not your task' });
      }
    } else {
      const authorized = await isAuthorizedForPatient(req.user, task.patient);
      if (!authorized) {
        return res.status(403).json({
          message: 'Permission denied: You are not authorized for this patient',
        });
      }
    }

    // Toggle or set to completed
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    task.status = newStatus;
    task.completedAt = newStatus === 'completed' ? new Date() : undefined;

    await task.save();
    return res.status(200).json(task);
  } catch (error) {
    console.error('Complete task error:', error);
    return res.status(error.status || 500).json({
      message: error.message || 'Failed to complete task',
    });
  }
};
