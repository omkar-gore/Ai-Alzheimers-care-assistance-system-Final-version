import User from '../models/User.js';
import PatientProfile from '../models/PatientProfile.js';
import CaregiverProfile from '../models/CaregiverProfile.js';

/**
 * Authoritatively resolves the assigned Caregiver User for a given patientId.
 * Checks PatientProfile.caregiver and CaregiverProfile (patient / patients).
 * Automatically synchronizes both models to maintain a single source of truth.
 * Returns the populated Caregiver User object or null.
 */
export const resolveExistingCaregiverForPatient = async (patientId) => {
  if (!patientId) return null;

  // 1. Check PatientProfile
  const patientProfile = await PatientProfile.findOne({ user: patientId }).populate(
    'caregiver',
    'name email phone age gender profileImage role'
  );

  let caregiverUser = patientProfile?.caregiver || null;

  // 2. Fallback: search CaregiverProfile
  let caregiverProfile = null;
  if (!caregiverUser) {
    caregiverProfile = await CaregiverProfile.findOne({
      $or: [{ patient: patientId }, { patients: patientId }],
    }).populate('user', 'name email phone age gender profileImage role');

    if (caregiverProfile?.user) {
      caregiverUser = caregiverProfile.user;
    }
  }

  // 3. If found, ensure bidirectional synchronization in the database
  if (caregiverUser && caregiverUser._id) {
    // Ensure PatientProfile has caregiver linked
    await PatientProfile.findOneAndUpdate(
      { user: patientId },
      {
        caregiver: caregiverUser._id,
        caregiverName: caregiverUser.name,
      },
      { upsert: true }
    );

    // Ensure CaregiverProfile has patient linked
    await CaregiverProfile.findOneAndUpdate(
      { user: caregiverUser._id },
      {
        $addToSet: { patients: patientId },
        $setOnInsert: { patient: patientId, patientName: '' },
      },
      { upsert: true }
    );
  }

  return caregiverUser;
};
