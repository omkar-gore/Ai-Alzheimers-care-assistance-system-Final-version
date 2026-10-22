import bcrypt from 'bcrypt';
import User from '../models/User.js';
import CaregiverProfile from '../models/CaregiverProfile.js';
import PatientProfile from '../models/PatientProfile.js';
import DoctorProfile from '../models/DoctorProfile.js';

const getUserId = (req) => {
  return req.user?.id || req.user?.userId || req.user?._id;
};

// GET PROFILE
export const getProfile = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: 'User authentication information is missing.',
      });
    }

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'User not found.',
      });
    }

    const [caregiverProfile, patientProfile, doctorProfile] = await Promise.all([
      CaregiverProfile.findOne({ user: userId }),
      PatientProfile.findOne({ user: userId })
        .populate('caregiver', 'name email phone')
        .populate('doctor', 'name email phone'),
      DoctorProfile.findOne({ user: userId }),
    ]);

    return res.status(200).json({
      user,
      caregiverProfile: caregiverProfile || null,
      patientProfile: patientProfile || null,
      doctorProfile: doctorProfile || null,
    });
  } catch (error) {
    console.error('Get profile error:', error);

    return res.status(500).json({
      message: 'Failed to load profile.',
    });
  }
};

// UPDATE PROFILE
export const updateProfile = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: 'User authentication information is missing.',
      });
    }

    const {
      name,
      age,
      gender,
      email,
      phone,
      relationshipWithPatient,
      patientName,
      emergencyContact,
    } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        message: 'Full name is required.',
      });
    }

    if (!email?.trim()) {
      return res.status(400).json({
        message: 'Email address is required.',
      });
    }

    if (!phone?.trim()) {
      return res.status(400).json({
        message: 'Phone number is required.',
      });
    }

    const existingEmail = await User.findOne({
      email: email.trim().toLowerCase(),
      _id: { $ne: userId },
    });

    if (existingEmail) {
      return res.status(409).json({
        message: 'This email address is already registered.',
      });
    }

    const existingPhone = await User.findOne({
      phone: phone.trim(),
      _id: { $ne: userId },
    });

    if (existingPhone) {
      return res.status(409).json({
        message: 'This phone number is already registered.',
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found.',
      });
    }

    user.name = name.trim();
    user.email = email.trim().toLowerCase();
    user.phone = phone.trim();

    if (age !== undefined && age !== '') {
      user.age = Number(age);
    }

    if (gender) {
      user.gender = gender;
    }

    await user.save();

    // Update caregiver-specific information if a caregiver profile exists.
    if (
      relationshipWithPatient !== undefined ||
      patientName !== undefined ||
      emergencyContact !== undefined
    ) {
      const caregiverProfile = await CaregiverProfile.findOne({
        user: userId,
      });

      if (caregiverProfile) {
        if (relationshipWithPatient !== undefined) {
          caregiverProfile.relationshipWithPatient =
            relationshipWithPatient.trim();
        }

        if (patientName !== undefined) {
          caregiverProfile.patientName = patientName.trim();
        }

        if (emergencyContact !== undefined) {
          caregiverProfile.emergencyContact =
            emergencyContact.trim();
        }

        await caregiverProfile.save();
      }
    }

    // Update patient-specific information if applicable
    const { address, caregiverName, dateOfBirth } = req.body;
    if (address !== undefined || caregiverName !== undefined || emergencyContact !== undefined || dateOfBirth !== undefined) {
      const patientProfile = await PatientProfile.findOne({ user: userId });
      if (patientProfile) {
        if (address !== undefined) patientProfile.address = address.trim();
        if (caregiverName !== undefined) patientProfile.caregiverName = caregiverName.trim();
        if (emergencyContact !== undefined) patientProfile.emergencyContact = emergencyContact.trim();
        if (dateOfBirth !== undefined) patientProfile.dateOfBirth = new Date(dateOfBirth);
        await patientProfile.save();
      }
    }

    // Update doctor-specific information if applicable
    const { medicalDegree, specialization, clinicName, yearsOfExperience } = req.body;
    if (medicalDegree !== undefined || specialization !== undefined || clinicName !== undefined || yearsOfExperience !== undefined) {
      const doctorProfile = await DoctorProfile.findOne({ user: userId });
      if (doctorProfile) {
        if (medicalDegree !== undefined) doctorProfile.medicalDegree = medicalDegree.trim();
        if (specialization !== undefined) doctorProfile.specialization = specialization.trim();
        if (clinicName !== undefined) doctorProfile.clinicName = clinicName.trim();
        if (yearsOfExperience !== undefined) doctorProfile.yearsOfExperience = Number(yearsOfExperience);
        await doctorProfile.save();
      }
    }

    const updatedUser = await User.findById(userId).select('-password');

    const [updatedCaregiverProfile, updatedPatientProfile, updatedDoctorProfile] =
      await Promise.all([
        CaregiverProfile.findOne({ user: userId }),
        PatientProfile.findOne({ user: userId }).populate('caregiver', 'name email phone').populate('doctor', 'name email phone'),
        DoctorProfile.findOne({ user: userId }),
      ]);

    return res.status(200).json({
      message: 'Profile updated successfully.',
      user: updatedUser,
      caregiverProfile: updatedCaregiverProfile || null,
      patientProfile: updatedPatientProfile || null,
      doctorProfile: updatedDoctorProfile || null,
    });
  } catch (error) {
    console.error('Update profile error:', error);

    if (error.code === 11000) {
      return res.status(409).json({
        message:
          'Email or phone number is already being used by another account.',
      });
    }

    return res.status(500).json({
      message: 'Failed to update profile.',
    });
  }
};

// CHANGE PASSWORD
export const changePassword = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: 'User authentication information is missing.',
      });
    }

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: 'All password fields are required.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: 'New password must contain at least 6 characters.',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: 'New password and confirm password do not match.',
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found.',
      });
    }

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: 'Current password is incorrect.',
      });
    }

    const isSamePassword = await bcrypt.compare(
      newPassword,
      user.password
    );

    if (isSamePassword) {
      return res.status(400).json({
        message:
          'New password must be different from your current password.',
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    await user.save();

    return res.status(200).json({
      message: 'Password changed successfully.',
    });
  } catch (error) {
    console.error('Change password error:', error);

    return res.status(500).json({
      message: 'Failed to change password.',
    });
  }
};

// DELETE ACCOUNT
export const deleteAccount = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: 'User authentication information is missing.',
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found.',
      });
    }

    await CaregiverProfile.findOneAndDelete({
      user: userId,
    });

    await User.findByIdAndDelete(userId);

    return res.status(200).json({
      message: 'Account deleted successfully.',
    });
  } catch (error) {
    console.error('Delete account error:', error);

    return res.status(500).json({
      message: 'Failed to delete account.',
    });
  }
};