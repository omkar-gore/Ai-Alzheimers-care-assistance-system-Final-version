import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import PatientProfile from '../models/PatientProfile.js';
import CaregiverProfile from '../models/CaregiverProfile.js';
import DoctorProfile from '../models/DoctorProfile.js';

const saltRounds = 10;

// ===============================
// REGISTER
// ===============================
export const register = async (req, res) => {
  try {
    const {
      name,
      age,
      gender,
      email,
      phone,
      password,
      role,

      // Patient fields
      caregiverName,
      caregiverEmail,
      emergencyContact,
      address,
      dateOfBirth,
      doctorEmail,
      doctorId,

      // Caregiver fields
      relationshipWithPatient,
      patientName,
      patientId,
      patientEmail,
      caregiverEmergencyContact,

      // Doctor fields
      medicalDegree,
      specialization,
      clinicName,
      yearsOfExperience,
      medicalRegistrationNumber,
    } = req.body;

    // ===============================
    // REQUIRED COMMON FIELDS
    // ===============================
    if (
      !name ||
      age === undefined ||
      age === null ||
      age === '' ||
      !gender ||
      !email ||
      !phone ||
      !password ||
      !role
    ) {
      return res.status(400).json({
        message: 'Missing required basic fields',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.trim();

    // ===============================
    // VALIDATE AGE
    // ===============================
    const numericAge = Number(age);
    if (!Number.isFinite(numericAge) || numericAge < 1 || numericAge > 120) {
      return res.status(400).json({
        message: 'Please enter a valid age between 1 and 120',
      });
    }

    // ===============================
    // VALIDATE ROLE
    // ===============================
    if (!['patient', 'caregiver', 'doctor'].includes(role)) {
      return res.status(400).json({
        message: 'Invalid user role',
      });
    }

    // ===============================
    // VALIDATE GENDER
    // ===============================
    if (!['Male', 'Female', 'Other'].includes(gender)) {
      return res.status(400).json({
        message: 'Invalid gender',
      });
    }

    // ===============================
    // CHECK EXISTING USER
    // ===============================
    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { phone: normalizedPhone }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'Email or phone is already registered',
      });
    }

    // ===============================
    // HASH PASSWORD
    // ===============================
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // ===============================
    // CREATE USER
    // ===============================
    const user = new User({
      name: name.trim(),
      age: numericAge,
      gender,
      email: normalizedEmail,
      phone: normalizedPhone,
      password: hashedPassword,
      role,
      profileImage: '',
    });

    await user.save();

    // ===============================
    // PATIENT PROFILE
    // ===============================
    if (role === 'patient') {
      let caregiverUser = null;

      if (caregiverEmail) {
        caregiverUser = await User.findOne({
          email: caregiverEmail.trim().toLowerCase(),
          role: 'caregiver',
        });
      }

      if (!caregiverUser && caregiverName) {
        caregiverUser = await User.findOne({
          name: new RegExp(`^${caregiverName.trim()}$`, 'i'),
          role: 'caregiver',
        });
      }

      let doctorUser = null;
      if (doctorId) {
        doctorUser = await User.findOne({ _id: doctorId, role: 'doctor' });
      } else if (doctorEmail) {
        doctorUser = await User.findOne({
          email: doctorEmail.trim().toLowerCase(),
          role: 'doctor',
        });
      }

      const parsedDob = dateOfBirth ? new Date(dateOfBirth) : null;

      const patientProfile = new PatientProfile({
        user: user._id,
        caregiverName: caregiverName ? caregiverName.trim() : (caregiverUser ? caregiverUser.name : ''),
        emergencyContact: emergencyContact ? emergencyContact.trim() : '',
        address: address ? address.trim() : '',
        dateOfBirth: parsedDob && !isNaN(parsedDob) ? parsedDob : undefined,
        caregiver: caregiverUser ? caregiverUser._id : null,
        doctor: doctorUser ? doctorUser._id : null,
        doctors: doctorUser ? [doctorUser._id] : [],
      });

      await patientProfile.save();

      // If caregiver exists, link this patient into their CaregiverProfile
      if (caregiverUser) {
        await CaregiverProfile.findOneAndUpdate(
          { user: caregiverUser._id },
          {
            $addToSet: { patients: user._id },
            $setOnInsert: {
              patientName: user.name,
              relationshipWithPatient: 'Caregiver',
              emergencyContact: emergencyContact || user.phone,
            },
          },
          { upsert: true }
        );

        // Ensure primary patient is set if missing
        const cp = await CaregiverProfile.findOne({ user: caregiverUser._id });
        if (cp && !cp.patient) {
          cp.patient = user._id;
          await cp.save();
        }
      }

      // If doctor was found, add patient to doctor's patients list
      if (doctorUser) {
        await DoctorProfile.findOneAndUpdate(
          { user: doctorUser._id },
          { $addToSet: { patients: user._id } }
        );
      }
    }

    // ===============================
    // CAREGIVER PROFILE
    // ===============================
    else if (role === 'caregiver') {
      let linkedPatient = null;

      if (patientId) {
        linkedPatient = await User.findOne({
          _id: patientId,
          role: 'patient',
        });
      }

      if (!linkedPatient && patientEmail) {
        linkedPatient = await User.findOne({
          email: patientEmail.trim().toLowerCase(),
          role: 'patient',
        });
      }

      if (!linkedPatient && patientName) {
        linkedPatient = await User.findOne({
          name: new RegExp(`^${patientName.trim()}$`, 'i'),
          role: 'patient',
        });
      }

      const caregiverProfile = new CaregiverProfile({
        user: user._id,
        relationshipWithPatient: relationshipWithPatient ? relationshipWithPatient.trim() : 'Caregiver',
        patientName: patientName ? patientName.trim() : (linkedPatient ? linkedPatient.name : ''),
        patient: linkedPatient ? linkedPatient._id : null,
        patients: linkedPatient ? [linkedPatient._id] : [],
        emergencyContact: caregiverEmergencyContact ? caregiverEmergencyContact.trim() : '',
      });

      await caregiverProfile.save();

      // Update patient profile if patient exists
      if (linkedPatient) {
        await PatientProfile.findOneAndUpdate(
          { user: linkedPatient._id },
          {
            caregiver: user._id,
            caregiverName: user.name,
            emergencyContact: caregiverEmergencyContact || user.phone,
          },
          { upsert: true }
        );
      }
    }

    // ===============================
    // DOCTOR PROFILE
    // ===============================
    else if (role === 'doctor') {
      if (
        !medicalDegree ||
        !specialization ||
        !clinicName ||
        !medicalRegistrationNumber
      ) {
        return res.status(400).json({
          message: 'Missing doctor professional fields',
        });
      }

      const doctorProfile = new DoctorProfile({
        user: user._id,
        medicalDegree: medicalDegree.trim(),
        specialization: specialization.trim(),
        clinicName: clinicName.trim(),
        yearsOfExperience: Number(yearsOfExperience) || 0,
        medicalRegistrationNumber: medicalRegistrationNumber.trim(),
        patients: [],
      });

      await doctorProfile.save();
    }

    return res.status(201).json({
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully`,
      userId: user._id,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      message: error.message || 'Server error during registration',
    });
  }
};

// ===============================
// LOGIN
// ===============================
export const login = async (req, res) => {
  try {
    const { email, phone, emailOrPhone, password } = req.body;

    if (!password) {
      return res.status(400).json({
        message: 'Password is required',
      });
    }

    const loginEmail = (email || '').trim().toLowerCase();
    const loginPhone = (phone || '').trim();
    const oldLoginField = (emailOrPhone || '').trim();

    let user = null;

    if (loginEmail) {
      user = await User.findOne({ email: loginEmail });
    }

    if (!user && loginPhone) {
      user = await User.findOne({ phone: loginPhone });
    }

    if (!user && oldLoginField) {
      user = await User.findOne({
        $or: [
          { email: oldLoginField.toLowerCase() },
          { phone: oldLoginField },
        ],
      });
    }

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email/phone or password',
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        message: 'Invalid email/phone or password',
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is missing in .env');
      return res.status(500).json({
        message: 'JWT configuration error',
      });
    }

    const tokenPayload = {
      id: user._id.toString(),
      role: user.role,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id.toString(),
        _id: user._id.toString(),
        name: user.name,
        age: user.age,
        gender: user.gender,
        role: user.role,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage || '',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      message: 'Server error during login',
    });
  }
};

// ===============================
// CHANGE PASSWORD
// ===============================
export const changePassword = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: 'All password fields are required.',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: 'New password and confirm password do not match.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: 'New password must be at least 6 characters long.',
      });
    }

    // Fetch user with password field
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: 'User account not found.',
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: 'Current password is incorrect.',
      });
    }

    // Hash and save new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({
      message: error.message || 'Server error while changing password.',
    });
  }
};