import mongoose from 'mongoose';
import CaregiverProfile from '../models/CaregiverProfile.js';
import DoctorProfile from '../models/DoctorProfile.js';
import PatientProfile from '../models/PatientProfile.js';

/**
 * Returns an array of Patient User ObjectIds that the given authenticated user is authorized to access.
 */
export const getAuthorizedPatientIds = async (user) => {
  if (!user || !user._id) return [];

  const userId = user._id;
  const role = String(user.role || user.userRole || user.userType || '').trim().toLowerCase();

  if (role === 'patient') {
    return [userId];
  }

  const patientIdSet = new Set();

  if (role === 'caregiver') {
    // 1. From CaregiverProfile
    const caregiverProfile = await CaregiverProfile.findOne({ user: userId });
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
    const patientProfiles = await PatientProfile.find({ caregiver: userId });
    patientProfiles.forEach((pp) => {
      if (pp.user) patientIdSet.add(pp.user.toString());
    });
  } else if (role === 'doctor') {
    // 1. From DoctorProfile
    const doctorProfile = await DoctorProfile.findOne({ user: userId });
    if (doctorProfile && Array.isArray(doctorProfile.patients)) {
      doctorProfile.patients.forEach((p) => {
        if (p) patientIdSet.add(p.toString());
      });
    }

    // 2. From PatientProfile where doctor or doctors includes this user
    const patientProfiles = await PatientProfile.find({
      $or: [{ doctor: userId }, { doctors: userId }],
    });
    patientProfiles.forEach((pp) => {
      if (pp.user) patientIdSet.add(pp.user.toString());
    });
  }

  return Array.from(patientIdSet).map((id) => new mongoose.Types.ObjectId(id));
};

/**
 * Checks whether an authenticated user is authorized to access a given patient's data.
 */
export const isAuthorizedForPatient = async (user, targetPatientId) => {
  if (!user || !targetPatientId) return false;

  const targetIdStr = targetPatientId.toString();
  const role = String(user.role || user.userRole || user.userType || '').trim().toLowerCase();

  if (role === 'patient') {
    return user._id.toString() === targetIdStr;
  }

  const authorizedIds = await getAuthorizedPatientIds(user);
  return authorizedIds.some((id) => id.toString() === targetIdStr);
};

/**
 * Resolves and validates the target patient ID for an operation.
 * Returns ObjectId of target patient or throws an error with status.
 */
export const resolveTargetPatient = async (user, requestedPatientId = null) => {
  if (!user) {
    const error = new Error('Authentication required');
    error.status = 401;
    throw error;
  }

  const role = String(user.role || user.userRole || user.userType || '').trim().toLowerCase();

  if (role === 'patient') {
    return user._id;
  }

  if (requestedPatientId) {
    if (!mongoose.Types.ObjectId.isValid(requestedPatientId)) {
      const error = new Error('Invalid patient ID');
      error.status = 400;
      throw error;
    }

    const authorized = await isAuthorizedForPatient(user, requestedPatientId);
    if (!authorized) {
      const error = new Error('Access denied: You are not authorized for this patient');
      error.status = 403;
      throw error;
    }

    return new mongoose.Types.ObjectId(requestedPatientId);
  }

  // If no patient ID is passed:
  if (role === 'caregiver') {
    const caregiverProfile = await CaregiverProfile.findOne({ user: user._id });
    if (caregiverProfile?.patient) {
      return caregiverProfile.patient;
    }
    if (caregiverProfile?.patients?.length > 0) {
      return caregiverProfile.patients[0];
    }

    // Fallback: search PatientProfile
    const pp = await PatientProfile.findOne({ caregiver: user._id });
    if (pp?.user) {
      return pp.user;
    }

    const error = new Error('No patient is linked to this caregiver');
    error.status = 400;
    throw error;
  }

  if (role === 'doctor') {
    const error = new Error('Patient ID is required for doctor access');
    error.status = 400;
    throw error;
  }

  const error = new Error('Permission denied');
  error.status = 403;
  throw error;
};
