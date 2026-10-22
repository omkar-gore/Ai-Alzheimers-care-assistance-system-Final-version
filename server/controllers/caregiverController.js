import mongoose from 'mongoose';
import User from '../models/User.js';
import CaregiverProfile from '../models/CaregiverProfile.js';
import PatientProfile from '../models/PatientProfile.js';
import Medicine from '../models/Medicine.js';
import Task from '../models/Task.js';

// ==========================================
// GET ASSIGNED PATIENTS FOR CAREGIVER
// ==========================================
export const getCaregiverPatients = async (req, res) => {
  try {
    const caregiverId = req.user._id;

    const patientIdSet = new Set();

    // 1. From CaregiverProfile
    const caregiverProfile = await CaregiverProfile.findOne({
      user: caregiverId,
    });

    if (caregiverProfile) {
      if (caregiverProfile.patient) {
        patientIdSet.add(caregiverProfile.patient.toString());
      }
      if (Array.isArray(caregiverProfile.patients)) {
        caregiverProfile.patients.forEach((p) => {
          if (p) patientIdSet.add(p.toString());
        });
      }
    }

    // 2. From PatientProfile where caregiver is this user
    const patientProfiles = await PatientProfile.find({
      caregiver: caregiverId,
    });

    patientProfiles.forEach((pp) => {
      if (pp.user) patientIdSet.add(pp.user.toString());
    });

    const patientIds = Array.from(patientIdSet).map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    const patients = await User.find({
      _id: { $in: patientIds },
      role: 'patient',
    }).select('-password');

    const enriched = await Promise.all(
      patients.map(async (patient) => {
        const pp = await PatientProfile.findOne({ user: patient._id });
        const medCount = await Medicine.countDocuments({ patient: patient._id });
        const pendingTaskCount = await Task.countDocuments({
          patient: patient._id,
          status: 'pending',
        });

        return {
          ...patient.toObject(),
          profile: pp || null,
          activeMedsCount: medCount,
          pendingTasksCount: pendingTaskCount,
          relationship: caregiverProfile?.relationshipWithPatient || 'Caregiver',
        };
      })
    );

    return res.status(200).json(enriched);
  } catch (error) {
    console.error('Get caregiver patients error:', error);
    return res.status(500).json({
      message: error.message || 'Failed to fetch caregiver patients',
    });
  }
};

// ==========================================
// ASSIGN PATIENT TO CAREGIVER
// ==========================================
export const assignCaregiverPatient = async (req, res) => {
  try {
    const caregiverId = req.user._id;
    const { patientId, patientEmail, relationship } = req.body;

    let patientUser = null;

    if (patientId) {
      if (!mongoose.Types.ObjectId.isValid(patientId)) {
        return res.status(400).json({ message: 'Invalid patient ID format' });
      }
      patientUser = await User.findOne({ _id: patientId, role: 'patient' });
    } else if (patientEmail) {
      patientUser = await User.findOne({
        email: patientEmail.trim().toLowerCase(),
        role: 'patient',
      });
    }

    if (!patientUser) {
      return res.status(404).json({
        message: 'Patient account not found. Please verify the ID or email.',
      });
    }

    // Update CaregiverProfile
    let cp = await CaregiverProfile.findOne({ user: caregiverId });
    if (!cp) {
      cp = new CaregiverProfile({
        user: caregiverId,
        relationshipWithPatient: relationship || 'Caregiver',
        patientName: patientUser.name,
        patient: patientUser._id,
        patients: [patientUser._id],
        emergencyContact: req.user.phone,
      });
    } else {
      if (!cp.patient) cp.patient = patientUser._id;
      if (!cp.patients) cp.patients = [];
      if (!cp.patients.some((p) => p.equals(patientUser._id))) {
        cp.patients.push(patientUser._id);
      }
      if (relationship) cp.relationshipWithPatient = relationship;
      cp.patientName = patientUser.name;
    }
    await cp.save();

    // Update PatientProfile
    await PatientProfile.findOneAndUpdate(
      { user: patientUser._id },
      {
        caregiver: caregiverId,
        caregiverName: req.user.name,
        emergencyContact: req.user.phone,
      },
      { upsert: true }
    );

    return res.status(200).json({
      message: `Patient ${patientUser.name} linked successfully`,
      patient: {
        _id: patientUser._id,
        name: patientUser.name,
        email: patientUser.email,
        phone: patientUser.phone,
      },
    });
  } catch (error) {
    console.error('Assign caregiver patient error:', error);
    return res.status(500).json({
      message: error.message || 'Failed to link patient',
    });
  }
};
