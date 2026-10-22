import Medicine from '../models/Medicine.js';
import { resolveTargetPatient, isAuthorizedForPatient } from '../utils/authCheck.js';

// ==========================================
// GET MEDICINES
// ==========================================
export const getMedicines = async (req, res) => {
  try {
    const targetPatientId = await resolveTargetPatient(req.user, req.query.patientId);

    const medicines = await Medicine.find({ patient: targetPatientId }).sort({ time: 1 });
    return res.status(200).json(medicines);
  } catch (error) {
    console.error('Get medicines error:', error);
    return res.status(error.status || 500).json({
      message: error.message || 'Failed to get medicines',
    });
  }
};

// ==========================================
// ADD MEDICINE
// ==========================================
export const addMedicine = async (req, res) => {
  try {
    if (req.user.role !== 'caregiver' && req.user.role !== 'doctor') {
      return res.status(403).json({
        message: 'Permission denied: Only caregivers or doctors can add medicines',
      });
    }

    const targetPatientId = await resolveTargetPatient(req.user, req.body.patientId);

    const { name, dosage, time, instructions, status } = req.body;

    if (!name?.trim() || !dosage?.trim() || !time?.trim()) {
      return res.status(400).json({
        message: 'Name, dosage, and time are required fields',
      });
    }

    const medicine = new Medicine({
      patient: targetPatientId,
      name: name.trim(),
      dosage: dosage.trim(),
      time: time.trim(),
      instructions: instructions ? instructions.trim() : '',
      status: status === 'done' ? 'done' : 'pending',
      lastTakenAt: status === 'done' ? new Date() : undefined,
    });

    await medicine.save();
    return res.status(201).json(medicine);
  } catch (error) {
    console.error('Add medicine error:', error);
    return res.status(error.status || 500).json({
      message: error.message || 'Failed to add medicine',
    });
  }
};

// ==========================================
// UPDATE MEDICINE
// ==========================================
export const updateMedicine = async (req, res) => {
  try {
    const medId = req.params.id;
    const medicine = await Medicine.findById(medId);

    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    // Patient permissions: can only mark status (done/pending) for their own medicines
    if (req.user.role === 'patient') {
      if (!medicine.patient.equals(req.user._id)) {
        return res.status(403).json({ message: 'Permission denied: Not your medicine' });
      }

      if (req.body.status !== undefined) {
        medicine.status = req.body.status === 'done' ? 'done' : 'pending';
        medicine.lastTakenAt = medicine.status === 'done' ? new Date() : undefined;
      }

      await medicine.save();
      return res.status(200).json(medicine);
    }

    // Caregiver or Doctor: must be authorized for this patient
    const authorized = await isAuthorizedForPatient(req.user, medicine.patient);
    if (!authorized) {
      return res.status(403).json({
        message: 'Permission denied: You are not authorized to update this patient\'s medicines',
      });
    }

    const { name, dosage, time, instructions, status } = req.body;
    if (name !== undefined) medicine.name = name.trim();
    if (dosage !== undefined) medicine.dosage = dosage.trim();
    if (time !== undefined) medicine.time = time.trim();
    if (instructions !== undefined) medicine.instructions = instructions.trim();
    if (status !== undefined) {
      medicine.status = status === 'done' ? 'done' : 'pending';
      medicine.lastTakenAt = medicine.status === 'done' ? new Date() : undefined;
    }

    await medicine.save();
    return res.status(200).json(medicine);
  } catch (error) {
    console.error('Update medicine error:', error);
    return res.status(error.status || 500).json({
      message: error.message || 'Failed to update medicine',
    });
  }
};

// ==========================================
// TOGGLE MEDICINE STATUS (TAKE / PENDING)
// ==========================================
export const toggleMedicineStatus = async (req, res) => {
  try {
    const medId = req.params.id;
    const medicine = await Medicine.findById(medId);

    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    if (req.user.role === 'patient') {
      if (!medicine.patient.equals(req.user._id)) {
        return res.status(403).json({ message: 'Permission denied: Not your medicine' });
      }
    } else {
      const authorized = await isAuthorizedForPatient(req.user, medicine.patient);
      if (!authorized) {
        return res.status(403).json({ message: 'Permission denied: Not authorized for this patient' });
      }
    }

    const newStatus = medicine.status === 'done' ? 'pending' : 'done';
    medicine.status = newStatus;
    medicine.lastTakenAt = newStatus === 'done' ? new Date() : undefined;

    await medicine.save();
    return res.status(200).json(medicine);
  } catch (error) {
    console.error('Toggle medicine status error:', error);
    return res.status(error.status || 500).json({
      message: error.message || 'Failed to toggle medicine status',
    });
  }
};

// ==========================================
// DELETE MEDICINE
// ==========================================
export const deleteMedicine = async (req, res) => {
  try {
    if (req.user.role !== 'caregiver' && req.user.role !== 'doctor') {
      return res.status(403).json({
        message: 'Permission denied: Only caregivers or doctors can delete medicines',
      });
    }

    const medId = req.params.id;
    const medicine = await Medicine.findById(medId);

    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    const authorized = await isAuthorizedForPatient(req.user, medicine.patient);
    if (!authorized) {
      return res.status(403).json({
        message: 'Permission denied: You are not authorized for this patient',
      });
    }

    await Medicine.findByIdAndDelete(medId);
    return res.status(200).json({ message: 'Medicine deleted successfully' });
  } catch (error) {
    console.error('Delete medicine error:', error);
    return res.status(error.status || 500).json({
      message: error.message || 'Failed to delete medicine',
    });
  }
};
