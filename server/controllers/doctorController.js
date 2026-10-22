import mongoose from 'mongoose';
import User from '../models/User.js';
import DoctorProfile from '../models/DoctorProfile.js';
import PatientProfile from '../models/PatientProfile.js';
import CaregiverProfile from '../models/CaregiverProfile.js';
import Medicine from '../models/Medicine.js';
import Schedule from '../models/Schedule.js';
import Task from '../models/Task.js';
import Appointment from '../models/Appointment.js';
import MedicalReport from '../models/MedicalReport.js';
import MemoryPerson from '../models/MemoryPerson.js';
import Prescription from '../models/Prescription.js';
import CaregiverReport from '../models/CaregiverReport.js';
import DailyActivityReport from '../models/DailyActivityReport.js';
import DoctorNote from '../models/DoctorNote.js';
import CarePlan from '../models/CarePlan.js';
import CognitiveScreening from '../models/CognitiveScreening.js';
import { isAuthorizedForPatient } from '../utils/authCheck.js';
import { calculateScreeningComparison } from '../utils/screeningScoring.js';
import { resolveExistingCaregiverForPatient } from '../utils/patientCaregiverHelper.js';

// ==========================================
// GET ALL ASSIGNED PATIENTS
// ==========================================
export const getAssignedPatients = async (req, res) => {
  try {
    const doctorId = req.user._id;

    // 1. Find from DoctorProfile.patients
    const doctorProfile = await DoctorProfile.findOne({ user: doctorId });
    const assignedIdsSet = new Set();

    if (doctorProfile && Array.isArray(doctorProfile.patients)) {
      doctorProfile.patients.forEach((p) => {
        if (p) assignedIdsSet.add(p.toString());
      });
    }

    // 2. Find from PatientProfile where doctor or doctors matches
    const patientProfiles = await PatientProfile.find({
      $or: [{ doctor: doctorId }, { doctors: doctorId }],
    });

    patientProfiles.forEach((pp) => {
      if (pp.user) assignedIdsSet.add(pp.user.toString());
    });

    const assignedIds = Array.from(assignedIdsSet).map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    // Fetch user info for each patient
    const patients = await User.find({
      _id: { $in: assignedIds },
      role: 'patient',
    }).select('-password');

    // Also enrich with patient profile details
    const enrichedPatients = await Promise.all(
      patients.map(async (patient) => {
        const caregiverUser = await resolveExistingCaregiverForPatient(patient._id);
        const profile = await PatientProfile.findOne({
          user: patient._id,
        });

        const activeMeds = await Medicine.countDocuments({
          patient: patient._id,
        });

        const pendingTasks = await Task.countDocuments({
          patient: patient._id,
          status: 'pending',
        });

        const profileObj = profile ? profile.toObject() : {};
        if (caregiverUser) {
          profileObj.caregiver = caregiverUser;
        }

        return {
          ...patient.toObject(),
          profile: profileObj,
          caregiver: caregiverUser,
          activeMedsCount: activeMeds,
          pendingTasksCount: pendingTasks,
        };
      })
    );

    return res.status(200).json(enrichedPatients);
  } catch (error) {
    console.error('Get assigned patients error:', error);
    return res.status(500).json({
      message: error.message || 'Failed to fetch assigned patients',
    });
  }
};

// ==========================================
// GET DETAILED PATIENT RECORD (DOCTOR VIEW)
// ==========================================
export const getPatientDetails = async (req, res) => {
  try {
    const { patientId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ message: 'Invalid patient ID format' });
    }

    // STRICT AUTHORIZATION CHECK
    const authorized = await isAuthorizedForPatient(req.user, patientId);
    if (!authorized) {
      return res.status(403).json({
        message: 'Access denied: Patient is not assigned to this doctor',
      });
    }

    const patientUser = await User.findOne({
      _id: patientId,
      role: 'patient',
    }).select('-password');

    if (!patientUser) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const patientProfile = await PatientProfile.findOne({
      user: patientId,
    }).populate('caregiver', 'name email phone age gender profileImage');

    let caregiverDetails = null;
    const caregiverUser = (await resolveExistingCaregiverForPatient(patientId)) || patientProfile?.caregiver || null;
    if (caregiverUser) {
      const cp = await CaregiverProfile.findOne({
        user: caregiverUser._id,
      });
      caregiverDetails = {
        user: caregiverUser,
        relationship: cp?.relationshipWithPatient || 'Caregiver',
        emergencyContact: cp?.emergencyContact || patientProfile?.emergencyContact || '',
      };
    }

    const [
      medicines,
      schedules,
      tasks,
      appointments,
      reports,
      memories,
    ] = await Promise.all([
      Medicine.find({ patient: patientId }).sort({ time: 1 }),
      Schedule.find({ patient: patientId }).sort({ time: 1 }),
      Task.find({ patient: patientId }).sort({ createdAt: 1 }),
      Appointment.find({ patient: patientId })
        .populate('caregiver', 'name email phone')
        .populate('doctor', 'name email phone')
        .sort({ date: 1, time: 1 }),
      MedicalReport.find({ patient: patientId }).sort({ uploadedAt: -1 }),
      MemoryPerson.find({ patient: patientId }).sort({ createdAt: -1 }),
    ]);

    const completedTasksCount = tasks.filter((t) => t.status === 'completed').length;

    return res.status(200).json({
      patient: patientUser,
      profile: patientProfile,
      caregiver: caregiverDetails,
      medicines,
      schedules,
      tasks,
      appointments,
      reports,
      memories,
      statistics: {
        totalTasks: tasks.length,
        completedTasks: completedTasksCount,
        taskCompletionRate: tasks.length
          ? Math.round((completedTasksCount / tasks.length) * 100)
          : 0,
        totalMedicines: medicines.length,
        pendingMedicines: medicines.filter((m) => m.status === 'pending').length,
        totalAppointments: appointments.length,
        totalReports: reports.length,
      },
    });
  } catch (error) {
    console.error('Get patient details error:', error);
    return res.status(500).json({
      message: error.message || 'Failed to fetch patient details',
    });
  }
};

// ==========================================
// ASSIGN PATIENT TO THIS DOCTOR
// ==========================================
export const assignPatient = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { patientId, patientEmail } = req.body;

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

    // 1. Add to DoctorProfile.patients
    await DoctorProfile.findOneAndUpdate(
      { user: doctorId },
      { $addToSet: { patients: patientUser._id } },
      { upsert: true }
    );

    // 2. Link in PatientProfile
    await PatientProfile.findOneAndUpdate(
      { user: patientUser._id },
      {
        doctor: doctorId,
        $addToSet: { doctors: doctorId },
      },
      { upsert: true }
    );

    return res.status(200).json({
      message: `Patient ${patientUser.name} successfully assigned to you`,
      patient: {
        _id: patientUser._id,
        name: patientUser.name,
        email: patientUser.email,
        phone: patientUser.phone,
        age: patientUser.age,
        gender: patientUser.gender,
      },
    });
  } catch (error) {
    console.error('Assign patient error:', error);
    return res.status(500).json({
      message: error.message || 'Failed to assign patient',
    });
  }
};

// ==========================================
// UNASSIGN PATIENT FROM THIS DOCTOR
// ==========================================
export const unassignPatient = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { patientId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ message: 'Invalid patient ID format' });
    }

    await DoctorProfile.findOneAndUpdate(
      { user: doctorId },
      { $pull: { patients: new mongoose.Types.ObjectId(patientId) } }
    );

    const patientProfile = await PatientProfile.findOne({ user: patientId });
    if (patientProfile) {
      if (patientProfile.doctor && patientProfile.doctor.toString() === doctorId.toString()) {
        patientProfile.doctor = null;
      }
      patientProfile.doctors = (patientProfile.doctors || []).filter(
        (d) => d && d.toString() !== doctorId.toString()
      );
      await patientProfile.save();
    }

    return res.status(200).json({
      message: 'Patient unassigned successfully',
    });
  } catch (error) {
    console.error('Unassign patient error:', error);
    return res.status(500).json({
      message: error.message || 'Failed to unassign patient',
    });
  }
};

// ==========================================
// GET LOGGED-IN DOCTOR PROFILE
// ==========================================
export const getDoctorProfile = async (req, res) => {
  try {
    const doctorId = req.user._id || req.user.id;

    const user = await User.findById(doctorId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Doctor account not found' });
    }

    const doctorProfile = await DoctorProfile.findOne({ user: doctorId });

    return res.status(200).json({
      success: true,
      doctor: {
        _id: user._id,
        id: user._id,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        gender: user.gender || '',
        age: user.age || null,
        role: user.role || 'doctor',
        profileImage: user.profileImage || '',
        createdAt: user.createdAt,
        medicalDegree: doctorProfile?.medicalDegree || '',
        specialization: doctorProfile?.specialization || '',
        clinicName: doctorProfile?.clinicName || '',
        yearsOfExperience: doctorProfile?.yearsOfExperience ?? 0,
        medicalRegistrationNumber: doctorProfile?.medicalRegistrationNumber || '',
        patientCount: Array.isArray(doctorProfile?.patients) ? doctorProfile.patients.length : 0,
      },
    });
  } catch (error) {
    console.error('Get doctor profile error:', error);
    return res.status(500).json({
      message: error.message || 'Failed to fetch doctor profile',
    });
  }
};

// ==========================================
// UPDATE LOGGED-IN DOCTOR PROFILE
// ==========================================
export const updateDoctorProfile = async (req, res) => {
  try {
    const doctorId = req.user._id || req.user.id;
    const {
      name,
      phone,
      gender,
      age,
      medicalDegree,
      specialization,
      clinicName,
      yearsOfExperience,
    } = req.body;

    const user = await User.findById(doctorId);
    if (!user) {
      return res.status(404).json({ message: 'Doctor account not found' });
    }

    if (name && name.trim()) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (gender && ['Male', 'Female', 'Other'].includes(gender)) user.gender = gender;
    if (age !== undefined && Number(age) > 0) user.age = Number(age);
    await user.save();

    const doctorProfile = await DoctorProfile.findOneAndUpdate(
      { user: doctorId },
      {
        ...(medicalDegree !== undefined ? { medicalDegree: medicalDegree.trim() } : {}),
        ...(specialization !== undefined ? { specialization: specialization.trim() } : {}),
        ...(clinicName !== undefined ? { clinicName: clinicName.trim() } : {}),
        ...(yearsOfExperience !== undefined ? { yearsOfExperience: Number(yearsOfExperience) } : {}),
      },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      doctor: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        age: user.age,
        role: user.role,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
        medicalDegree: doctorProfile.medicalDegree,
        specialization: doctorProfile.specialization,
        clinicName: doctorProfile.clinicName,
        yearsOfExperience: doctorProfile.yearsOfExperience,
        medicalRegistrationNumber: doctorProfile.medicalRegistrationNumber,
        patientCount: Array.isArray(doctorProfile.patients) ? doctorProfile.patients.length : 0,
      },
    });
  } catch (error) {
    console.error('Update doctor profile error:', error);
    return res.status(500).json({
      message: error.message || 'Failed to update doctor profile',
    });
  }
};

// ==========================================
// HELPER: ENSURE / AGGREGATE DAILY REPORT
// ==========================================
export const ensureDailyReportForPatient = async (patientId, doctorId = null, targetDateStr = null) => {
  const dateStr = targetDateStr || new Date().toISOString().split('T')[0];

  const [tasks, medicines, caregiverReport, screening] = await Promise.all([
    Task.find({ patient: patientId }),
    Medicine.find({ patient: patientId }),
    CaregiverReport.findOne({ patient: patientId, reportDate: dateStr }),
    CognitiveScreening.findOne({ screeningUser: patientId }).sort({ createdAt: -1 }),
  ]);

  const tasksAssigned = tasks.length;
  const tasksCompleted = tasks.filter((t) => t.status === 'completed').length;
  const taskCompletion = tasksAssigned > 0 ? Math.round((tasksCompleted / tasksAssigned) * 100) : 100;

  const medicinesTotal = medicines.length;
  const medicinesTaken = medicines.filter((m) => m.status === 'done').length;
  const medicationAdherence = medicinesTotal > 0 ? Math.round((medicinesTaken / medicinesTotal) * 100) : 100;

  let cognitiveScore = 75;
  let screeningCompleted = false;
  let screeningScoreVal = null;

  if (screening) {
    const scrDateStr = new Date(screening.createdAt).toISOString().split('T')[0];
    if (scrDateStr === dateStr) {
      screeningCompleted = true;
      screeningScoreVal = screening.overallScore;
      cognitiveScore = screening.overallScore;
    } else {
      cognitiveScore = screening.overallScore;
    }
  }

  // Calculate composite daily activity score (0 - 100)
  // Medication Adherence (40%), Task Completion (35%), Cognitive Activity Score (25%)
  const overallActivityScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(medicationAdherence * 0.4 + taskCompletion * 0.35 + cognitiveScore * 0.25)
    )
  );

  const highlights = [];
  if (medicinesTotal > 0) {
    highlights.push(`Medication adherence: ${medicationAdherence}% (${medicinesTaken}/${medicinesTotal} taken)`);
  }
  if (tasksAssigned > 0) {
    highlights.push(`Daily routine tasks: ${tasksCompleted}/${tasksAssigned} completed (${taskCompletion}%)`);
  }
  if (caregiverReport) {
    highlights.push(`Caregiver observation recorded: Mood ${caregiverReport.mood || 'Normal'}, Sleep ${caregiverReport.sleep || 'Normal'}`);
  }
  if (screeningCompleted) {
    highlights.push(`Cognitive screening completed today: Score ${screeningScoreVal}/100`);
  }
  if (highlights.length === 0) {
    highlights.push('Baseline routine care tracking active');
  }

  const report = await DailyActivityReport.findOneAndUpdate(
    { patient: patientId, date: dateStr },
    {
      patient: patientId,
      date: dateStr,
      doctor: doctorId || null,
      tasksCompleted,
      tasksAssigned,
      taskCompletion,
      medicinesTaken,
      medicinesTotal,
      medicationAdherence,
      mood: caregiverReport ? caregiverReport.mood : 'Not recorded',
      sleep: caregiverReport ? caregiverReport.sleep : 'Not recorded',
      caregiverNotes: caregiverReport ? caregiverReport.additionalNotes : '',
      screeningCompleted,
      screeningScore: screeningScoreVal,
      cognitiveActivityScore: cognitiveScore,
      overallActivityScore,
      activityHighlights: highlights,
      updatedAt: new Date(),
    },
    { upsert: true, new: true }
  );

  return report;
};

// ==========================================
// 1. GET DETAILED PATIENT CLINICAL SUMMARY
// ==========================================
export const getPatientClinicalSummary = async (req, res) => {
  try {
    const { patientId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ message: 'Invalid patient ID format' });
    }

    const authorized = await isAuthorizedForPatient(req.user, patientId);
    if (!authorized) {
      return res.status(403).json({
        message: 'Access denied: Patient is not assigned to your clinical panel',
      });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    await ensureDailyReportForPatient(patientId, req.user._id, todayStr);

    const [
      patientUser,
      patientProfile,
      medicines,
      prescriptions,
      appointments,
      caregiverReports,
      medicalReports,
      screenings,
      dailyReports,
      doctorNotes,
      carePlans,
      tasks,
      schedules,
      memories,
    ] = await Promise.all([
      User.findOne({ _id: patientId, role: 'patient' }).select('-password'),
      PatientProfile.findOne({ user: patientId }).populate('caregiver', 'name email phone age gender profileImage'),
      Medicine.find({ patient: patientId }).sort({ time: 1 }),
      Prescription.find({ patient: patientId }).populate('doctor', 'name email').sort({ createdAt: -1 }),
      Appointment.find({ patient: patientId })
        .populate('caregiver', 'name email phone')
        .populate('doctor', 'name email phone')
        .populate('payment', 'amount status purpose transactionId receiptNumber')
        .sort({ date: 1, time: 1 }),
      CaregiverReport.find({ patient: patientId }).populate('caregiver', 'name email').sort({ reportDate: -1 }),
      MedicalReport.find({ patient: patientId }).sort({ uploadedAt: -1 }),
      CognitiveScreening.find({ screeningUser: patientId }).sort({ createdAt: -1 }),
      DailyActivityReport.find({ patient: patientId }).sort({ date: -1 }).limit(14),
      DoctorNote.find({ patient: patientId }).populate('doctor', 'name').sort({ date: -1 }).limit(10),
      CarePlan.find({ patient: patientId }).sort({ createdAt: -1 }),
      Task.find({ patient: patientId }).sort({ createdAt: 1 }),
      Schedule.find({ patient: patientId }).sort({ time: 1 }),
      MemoryPerson.find({ patient: patientId }).sort({ createdAt: -1 }),
    ]);

    if (!patientUser) {
      return res.status(404).json({ message: 'Patient account not found' });
    }

    // Categorize appointments
    const upcomingAppointments = appointments.filter(
      (a) => a.status === 'Scheduled' && a.date >= todayStr
    );
    const previousAppointments = appointments.filter(
      (a) => a.status !== 'Scheduled' || a.date < todayStr
    );

    // Latest screening info
    const latestScreening = screenings.length > 0 ? screenings[0] : null;
    const previousScreening = screenings.length > 1 ? screenings[1] : null;
    const screeningComparison =
      latestScreening && previousScreening
        ? calculateScreeningComparison(latestScreening, previousScreening)
        : null;

    // Last 7 days metrics
    const recent7Reports = dailyReports.slice(0, 7);
    const avgDailyScore =
      recent7Reports.length > 0
        ? Math.round(
            recent7Reports.reduce((sum, r) => sum + (r.overallActivityScore || 0), 0) /
              recent7Reports.length
          )
        : 75;

    const older7Reports = dailyReports.slice(7, 14);
    const prevAvgScore =
      older7Reports.length > 0
        ? Math.round(
            older7Reports.reduce((sum, r) => sum + (r.overallActivityScore || 0), 0) /
              older7Reports.length
          )
        : avgDailyScore;

    const activityTrend =
      avgDailyScore > prevAvgScore + 3
        ? 'Improving'
        : avgDailyScore < prevAvgScore - 3
        ? 'Needs Attention'
        : 'Stable';

    // Alerts / Attention Required (Strictly rule-based observations from real records)
    const alerts = [];
    const todayReport = dailyReports.find((r) => r.date === todayStr);

    if (todayReport && todayReport.medicationAdherence < 70 && todayReport.medicinesTotal > 0) {
      alerts.push({
        type: 'warning',
        title: 'Medication Adherence Lower',
        message: `Medication adherence is recorded at ${todayReport.medicationAdherence}% today.`,
      });
    }

    if (upcomingAppointments.length === 0) {
      alerts.push({
        type: 'info',
        title: 'No Upcoming Appointment',
        message: 'No follow-up or review appointment is currently scheduled.',
      });
    }

    if (caregiverReports.length > 0 && caregiverReports[0].dailyConcerns) {
      alerts.push({
        type: 'warning',
        title: 'Caregiver Daily Concern Logged',
        message: caregiverReports[0].dailyConcerns,
      });
    }

    if (screeningComparison && screeningComparison.overallChange <= -5) {
      alerts.push({
        type: 'info',
        title: 'Screening Score Variation',
        message: `Latest cognitive screening score varied by ${screeningComparison.formattedOverallChange} from prior assessment.`,
      });
    }

    // Patient Care Insights (Rule-based transparent clinical observations)
    const careInsights = [];
    if (recent7Reports.length > 0) {
      careInsights.push(
        `Recorded average daily activity score of ${avgDailyScore}/100 over the past ${recent7Reports.length} days.`
      );
    }
    const totalActiveMeds = prescriptions.filter((p) => p.status === 'Active').length || medicines.length;
    careInsights.push(
      `Currently maintaining ${totalActiveMeds} active medication prescription records.`
    );
    if (caregiverReports.length > 0) {
      careInsights.push(
        `Most recent caregiver observation noted mood as "${caregiverReports[0].mood}" and sleep as "${caregiverReports[0].sleep}".`
      );
    }
    if (latestScreening) {
      careInsights.push(
        `Latest cognitive screening performance evaluated at ${latestScreening.overallScore}/100 (${latestScreening.riskIndicator}).`
      );
    }

    const suggestedDoctorAttention = [];
    if (alerts.some((a) => a.title.includes('Medication'))) {
      suggestedDoctorAttention.push('Review medication schedule and timing with caregiver.');
    }
    if (upcomingAppointments.length === 0) {
      suggestedDoctorAttention.push('Schedule routine follow-up or cognitive review appointment.');
    }
    if (suggestedDoctorAttention.length === 0) {
      suggestedDoctorAttention.push('Continue monitoring daily routine and routine caregiver updates.');
    }

    const resolvedCaregiver = (await resolveExistingCaregiverForPatient(patientId)) || patientProfile?.caregiver || null;

    return res.status(200).json({
      success: true,
      patient: patientUser,
      profile: patientProfile,
      caregiver: resolvedCaregiver,
      stats: {
        activeMedicationsCount: totalActiveMeds,
        upcomingAppointmentsCount: upcomingAppointments.length,
        caregiverReportsCount: caregiverReports.length + medicalReports.length,
        dailyReportsCount: dailyReports.length,
        latestScreeningScore: latestScreening ? latestScreening.overallScore : null,
        latestScreeningRisk: latestScreening ? latestScreening.riskIndicator : null,
        averageDailyScore: avgDailyScore,
        activityTrend,
      },
      statusSummary: {
        activity: avgDailyScore >= 75 ? 'Good' : avgDailyScore >= 55 ? 'Moderate' : 'Needs Attention',
        medication:
          todayReport && todayReport.medicationAdherence < 75
            ? 'Lower Adherence'
            : 'On Schedule',
        appointments: upcomingAppointments.length > 0 ? `${upcomingAppointments.length} Upcoming` : 'None Scheduled',
        recentScreening: latestScreening ? `${latestScreening.overallScore}/100` : 'Not completed',
        caregiverReports: caregiverReports.length > 0 ? `Updated (${caregiverReports[0].reportDate})` : 'Pending',
      },
      alerts,
      weeklySummary: {
        avgDailyActivity: avgDailyScore,
        taskCompletionRate: recent7Reports.length > 0
          ? Math.round(recent7Reports.reduce((s, r) => s + (r.taskCompletion || 0), 0) / recent7Reports.length)
          : 0,
        medicationAdherence: recent7Reports.length > 0
          ? Math.round(recent7Reports.reduce((s, r) => s + (r.medicationAdherence || 0), 0) / recent7Reports.length)
          : 100,
        caregiverReportsCount: caregiverReports.length,
        cognitiveScreeningCount: screenings.length,
        trend: activityTrend,
      },
      careInsights,
      suggestedDoctorAttention,
      upcomingAppointments,
      previousAppointments,
      activePrescriptions: prescriptions.filter((p) => p.status === 'Active'),
      prescriptionHistory: prescriptions,
      medicines,
      caregiverReports,
      medicalReports,
      screenings,
      screeningComparison,
      dailyReports,
      doctorNotes,
      carePlans,
      tasks,
      schedules,
      memories,
    });
  } catch (error) {
    console.error('Get patient clinical summary error:', error);
    return res.status(500).json({
      message: error.message || 'Failed to fetch patient clinical summary',
    });
  }
};

// ==========================================
// 2. APPOINTMENT MANAGEMENT
// ==========================================
export const getPatientAppointments = async (req, res) => {
  try {
    const { patientId } = req.params;
    const authorized = await isAuthorizedForPatient(req.user, patientId);
    if (!authorized) {
      return res.status(403).json({ message: 'Access denied: Patient not in your panel' });
    }

    const appointments = await Appointment.find({ patient: patientId })
      .populate('caregiver', 'name email phone')
      .populate('doctor', 'name email phone')
      .populate('payment', 'amount status purpose transactionId receiptNumber')
      .sort({ date: 1, time: 1 });

    const todayStr = new Date().toISOString().split('T')[0];
    const upcoming = appointments.filter((a) => a.status === 'Scheduled' && a.date >= todayStr);
    const previous = appointments.filter((a) => a.status !== 'Scheduled' || a.date < todayStr);

    return res.status(200).json({ upcoming, previous, all: appointments });
  } catch (error) {
    console.error('Get patient appointments error:', error);
    return res.status(500).json({ message: error.message || 'Failed to fetch appointments' });
  }
};

export const schedulePatientAppointment = async (req, res) => {
  try {
    const { patientId } = req.params;
    const authorized = await isAuthorizedForPatient(req.user, patientId);
    if (!authorized) {
      return res.status(403).json({ message: 'Access denied: Patient not in your panel' });
    }

    const { date, time, type, title, notes, location, caregiverId, appointmentMode } = req.body;

    if (!date?.trim() || !time?.trim()) {
      return res.status(400).json({ message: 'Appointment date and time are required' });
    }

    const pp = await PatientProfile.findOne({ user: patientId });

    const isOnline =
      appointmentMode === 'online' ||
      type === 'online' ||
      location?.toLowerCase().includes('online') ||
      location?.toLowerCase().includes('video');
    const finalMode = isOnline ? 'online' : 'in-person';
    const generatedRoomId = isOnline
      ? `CareMate-APT-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`
      : null;

    const appointment = new Appointment({
      patient: patientId,
      doctor: req.user._id,
      caregiver: caregiverId || pp?.caregiver || null,
      date: date.trim(),
      time: time.trim(),
      type: type || 'Consultation',
      appointmentMode: finalMode,
      meetingRoomId: generatedRoomId,
      meetingStatus: isOnline ? 'scheduled' : 'scheduled',
      title: title?.trim() || `${type || 'Consultation'} with Dr. ${req.user.name}`,
      description: notes ? notes.trim() : '',
      notes: notes ? notes.trim() : '',
      location: location ? location.trim() : (isOnline ? 'Online Video Consultation' : 'Clinic Consultation Room'),
      status: 'Scheduled',
    });

    await appointment.save();

    const populated = await Appointment.findById(appointment._id)
      .populate('caregiver', 'name email phone')
      .populate('doctor', 'name email phone');

    return res.status(201).json({
      success: true,
      message: 'Appointment scheduled successfully',
      appointment: populated,
    });
  } catch (error) {
    console.error('Schedule appointment error:', error);
    return res.status(500).json({ message: error.message || 'Failed to schedule appointment' });
  }
};

export const updatePatientAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const authorized = await isAuthorizedForPatient(req.user, appointment.patient);
    if (!authorized) {
      return res.status(403).json({ message: 'Access denied: Not your patient' });
    }

    const { status, consultationNotes, followUpInstructions, notes, date, time, type, location, appointmentMode } = req.body;

    if (status !== undefined) appointment.status = status;
    if (consultationNotes !== undefined) appointment.consultationNotes = consultationNotes.trim();
    if (followUpInstructions !== undefined) appointment.followUpInstructions = followUpInstructions.trim();
    if (notes !== undefined) appointment.notes = notes.trim();
    if (date !== undefined) appointment.date = date.trim();
    if (time !== undefined) appointment.time = time.trim();
    if (type !== undefined) appointment.type = type.trim();
    if (location !== undefined) appointment.location = location.trim();
    if (appointmentMode !== undefined) {
      appointment.appointmentMode = appointmentMode;
      if (appointmentMode === 'online' && !appointment.meetingRoomId) {
        appointment.meetingRoomId = `CareMate-APT-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
      }
    }

    await appointment.save();

    const populated = await Appointment.findById(appointment._id)
      .populate('caregiver', 'name email phone')
      .populate('doctor', 'name email phone');

    return res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      appointment: populated,
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    return res.status(500).json({ message: error.message || 'Failed to update appointment' });
  }
};

// ==========================================
// 3. MEDICATION & PRESCRIPTION MANAGEMENT
// ==========================================
export const getPatientPrescriptions = async (req, res) => {
  try {
    const { patientId } = req.params;
    const authorized = await isAuthorizedForPatient(req.user, patientId);
    if (!authorized) {
      return res.status(403).json({ message: 'Access denied: Patient not in your panel' });
    }

    const [prescriptions, medicines] = await Promise.all([
      Prescription.find({ patient: patientId }).populate('doctor', 'name email').sort({ createdAt: -1 }),
      Medicine.find({ patient: patientId }).sort({ time: 1 }),
    ]);

    const activePrescriptions = prescriptions.filter((p) => p.status === 'Active');
    const historyPrescriptions = prescriptions;

    return res.status(200).json({
      active: activePrescriptions,
      history: historyPrescriptions,
      medicines,
    });
  } catch (error) {
    console.error('Get prescriptions error:', error);
    return res.status(500).json({ message: error.message || 'Failed to fetch prescriptions' });
  }
};

export const prescribeMedication = async (req, res) => {
  try {
    const { patientId } = req.params;
    const authorized = await isAuthorizedForPatient(req.user, patientId);
    if (!authorized) {
      return res.status(403).json({ message: 'Access denied: Patient not in your panel' });
    }

    const {
      medicineName,
      dosage,
      frequency,
      duration,
      startDate,
      endDate,
      instructions,
      doctorNotes,
    } = req.body;

    if (!medicineName?.trim() || !dosage?.trim() || !frequency?.trim()) {
      return res.status(400).json({
        message: 'Medicine name, dosage, and frequency are required',
      });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const prescription = new Prescription({
      patient: patientId,
      doctor: req.user._id,
      medicineName: medicineName.trim(),
      dosage: dosage.trim(),
      frequency: frequency.trim(),
      duration: duration ? duration.trim() : '30 days',
      startDate: startDate ? startDate.trim() : todayStr,
      endDate: endDate ? endDate.trim() : '',
      instructions: instructions ? instructions.trim() : '',
      doctorNotes: doctorNotes ? doctorNotes.trim() : '',
      status: 'Active',
      prescribedAt: new Date(),
    });

    await prescription.save();

    // Synchronize into Medicine model so Patient and Caregiver dashboards see it
    const existingMed = await Medicine.findOne({
      patient: patientId,
      name: new RegExp(`^${medicineName.trim()}$`, 'i'),
    });

    if (existingMed) {
      existingMed.dosage = dosage.trim();
      existingMed.time = frequency.trim();
      existingMed.instructions = instructions ? instructions.trim() : existingMed.instructions;
      existingMed.status = 'pending';
      await existingMed.save();
    } else {
      await Medicine.create({
        patient: patientId,
        name: medicineName.trim(),
        dosage: dosage.trim(),
        time: frequency.trim(),
        instructions: instructions ? instructions.trim() : '',
        status: 'pending',
      });
    }

    const populated = await Prescription.findById(prescription._id).populate('doctor', 'name email');

    return res.status(201).json({
      success: true,
      message: `Prescription for ${medicineName} created successfully and added to active medications`,
      prescription: populated,
    });
  } catch (error) {
    console.error('Prescribe medication error:', error);
    return res.status(500).json({ message: error.message || 'Failed to prescribe medication' });
  }
};

export const updatePrescriptionStatus = async (req, res) => {
  try {
    const { prescriptionId } = req.params;
    const { status } = req.body;

    if (!['Active', 'Completed', 'Stopped'].includes(status)) {
      return res.status(400).json({ message: 'Status must be Active, Completed, or Stopped' });
    }

    const prescription = await Prescription.findById(prescriptionId);
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription record not found' });
    }

    const authorized = await isAuthorizedForPatient(req.user, prescription.patient);
    if (!authorized) {
      return res.status(403).json({ message: 'Access denied: Not your patient' });
    }

    prescription.status = status;
    await prescription.save();

    return res.status(200).json({
      success: true,
      message: `Prescription status updated to ${status}`,
      prescription,
    });
  } catch (error) {
    console.error('Update prescription status error:', error);
    return res.status(500).json({ message: error.message || 'Failed to update prescription' });
  }
};

// ==========================================
// 4. CAREGIVER REPORTS MANAGEMENT
// ==========================================
export const getPatientCaregiverReports = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { filter } = req.query; // 'today', '7days', '30days', 'all'

    const authorized = await isAuthorizedForPatient(req.user, patientId);
    if (!authorized) {
      return res.status(403).json({ message: 'Access denied: Patient not in your panel' });
    }

    let dateFilter = {};
    const now = new Date();

    if (filter === 'today') {
      const todayStr = now.toISOString().split('T')[0];
      dateFilter = { reportDate: todayStr };
    } else if (filter === '7days') {
      const cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      dateFilter = { reportDate: { $gte: cutoff } };
    } else if (filter === '30days') {
      const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      dateFilter = { reportDate: { $gte: cutoff } };
    }

    const [caregiverReports, medicalReports] = await Promise.all([
      CaregiverReport.find({ patient: patientId, ...dateFilter })
        .populate('caregiver', 'name email phone')
        .sort({ reportDate: -1 }),
      MedicalReport.find({ patient: patientId })
        .populate('caregiver', 'name email')
        .sort({ uploadedAt: -1 }),
    ]);

    return res.status(200).json({
      caregiverReports,
      medicalReports,
      totalCount: caregiverReports.length + medicalReports.length,
    });
  } catch (error) {
    console.error('Get caregiver reports error:', error);
    return res.status(500).json({ message: error.message || 'Failed to fetch caregiver reports' });
  }
};

export const submitCaregiverReport = async (req, res) => {
  try {
    const { patientId } = req.params;
    const authorized = await isAuthorizedForPatient(req.user, patientId);
    if (!authorized) {
      return res.status(403).json({ message: 'Access denied: Patient not in your panel' });
    }

    const {
      reportDate,
      mood,
      sleep,
      meals,
      medicationAdherence,
      behaviorObservations,
      dailyConcerns,
      additionalNotes,
    } = req.body;

    const dateStr = reportDate || new Date().toISOString().split('T')[0];

    const pp = await PatientProfile.findOne({ user: patientId });
    const caregiverId = pp?.caregiver || req.user._id;

    const report = await CaregiverReport.findOneAndUpdate(
      { patient: patientId, reportDate: dateStr },
      {
        patient: patientId,
        caregiver: caregiverId,
        reportDate: dateStr,
        mood: mood || 'Good',
        sleep: sleep || 'Normal (7-8 hrs)',
        meals: meals || 'Finished all meals',
        medicationAdherence: medicationAdherence || '100% Taken on time',
        behaviorObservations: behaviorObservations || '',
        dailyConcerns: dailyConcerns || '',
        additionalNotes: additionalNotes || '',
      },
      { upsert: true, new: true }
    );

    // Refresh daily activity report with this caregiver data
    await ensureDailyReportForPatient(patientId, req.user._id, dateStr);

    return res.status(201).json({
      success: true,
      message: 'Caregiver report logged successfully',
      report,
    });
  } catch (error) {
    console.error('Submit caregiver report error:', error);
    return res.status(500).json({ message: error.message || 'Failed to submit caregiver report' });
  }
};

// ==========================================
// 5. DAILY ACTIVITY REPORTS
// ==========================================
export const getPatientDailyReports = async (req, res) => {
  try {
    const { patientId } = req.params;
    const authorized = await isAuthorizedForPatient(req.user, patientId);
    if (!authorized) {
      return res.status(403).json({ message: 'Access denied: Patient not in your panel' });
    }

    // Ensure today's report exists / refreshed
    const todayStr = new Date().toISOString().split('T')[0];
    await ensureDailyReportForPatient(patientId, req.user._id, todayStr);

    const dailyReports = await DailyActivityReport.find({ patient: patientId }).sort({ date: -1 });

    return res.status(200).json(dailyReports);
  } catch (error) {
    console.error('Get daily reports error:', error);
    return res.status(500).json({ message: error.message || 'Failed to fetch daily activity reports' });
  }
};

// ==========================================
// 6. COGNITIVE SCREENING HISTORY
// ==========================================
export const getPatientScreeningHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const authorized = await isAuthorizedForPatient(req.user, patientId);
    if (!authorized) {
      return res.status(403).json({ message: 'Access denied: Patient not in your panel' });
    }

    const screenings = await CognitiveScreening.find({ screeningUser: patientId }).sort({ createdAt: -1 });

    const comparisons = [];
    for (let i = 0; i < screenings.length - 1; i++) {
      comparisons.push(calculateScreeningComparison(screenings[i], screenings[i + 1]));
    }

    return res.status(200).json({
      screenings,
      comparisons,
      totalCount: screenings.length,
      disclaimer:
        'Cognitive screening results represent non-diagnostic educational performance and are not a clinical diagnosis of Alzheimer’s disease or dementia.',
    });
  } catch (error) {
    console.error('Get patient screening history error:', error);
    return res.status(500).json({ message: error.message || 'Failed to fetch screening history' });
  }
};

// ==========================================
// 7. CLINICAL TIMELINE
// ==========================================
export const getPatientClinicalTimeline = async (req, res) => {
  try {
    const { patientId } = req.params;
    const authorized = await isAuthorizedForPatient(req.user, patientId);
    if (!authorized) {
      return res.status(403).json({ message: 'Access denied: Patient not in your panel' });
    }

    const [dailyReports, prescriptions, appointments, caregiverReports, screenings, notes] =
      await Promise.all([
        DailyActivityReport.find({ patient: patientId }),
        Prescription.find({ patient: patientId }).populate('doctor', 'name'),
        Appointment.find({ patient: patientId }),
        CaregiverReport.find({ patient: patientId }).populate('caregiver', 'name'),
        CognitiveScreening.find({ screeningUser: patientId }),
        DoctorNote.find({ patient: patientId }).populate('doctor', 'name'),
      ]);

    const timeline = [];

    dailyReports.forEach((dr) => {
      timeline.push({
        id: `daily_${dr._id}`,
        type: 'daily_report',
        title: 'Daily Activity Report',
        date: dr.date,
        timestamp: dr.createdAt,
        badge: `${dr.overallActivityScore}/100 Activity Score`,
        badgeColor: dr.overallActivityScore >= 75 ? 'emerald' : dr.overallActivityScore >= 50 ? 'amber' : 'rose',
        details: dr.activityHighlights.join(' • '),
      });
    });

    prescriptions.forEach((p) => {
      timeline.push({
        id: `presc_${p._id}`,
        type: 'medication',
        title: `Medication Prescribed: ${p.medicineName} (${p.dosage})`,
        date: p.startDate,
        timestamp: p.createdAt,
        badge: p.status,
        badgeColor: p.status === 'Active' ? 'blue' : 'slate',
        details: `${p.frequency} • ${p.duration || 'Standard duration'} • Instructions: ${p.instructions || 'Take as directed'}`,
      });
    });

    appointments.forEach((a) => {
      const isOnline = a.appointmentMode === 'online';
      timeline.push({
        id: `appt_${a._id}`,
        type: isOnline ? 'video_consultation' : 'appointment',
        title: isOnline ? `Online Video Consultation: ${a.title}` : `Appointment: ${a.title}`,
        date: a.date,
        timestamp: a.createdAt,
        badge: isOnline && (a.meetingStatus === 'completed' || a.status === 'Completed')
          ? 'Video Completed'
          : a.status,
        badgeColor: a.status === 'Completed' ? 'emerald' : a.status === 'Scheduled' ? 'indigo' : 'rose',
        details: isOnline
          ? `Online Video Consultation at ${a.time} • ${a.consultationNotes || a.notes || 'Virtual clinical review'}`
          : `${a.type || 'Consultation'} at ${a.time} • ${a.consultationNotes || a.description || 'Routine clinic checkup'}`,
      });
    });

    caregiverReports.forEach((cr) => {
      timeline.push({
        id: `caregiver_${cr._id}`,
        type: 'caregiver_report',
        title: 'Caregiver Daily Care Observation',
        date: cr.reportDate,
        timestamp: cr.createdAt,
        badge: `Mood: ${cr.mood}`,
        badgeColor: 'teal',
        details: `Sleep: ${cr.sleep} • Meals: ${cr.meals} • Adherence: ${cr.medicationAdherence}${cr.dailyConcerns ? ` • Concern: ${cr.dailyConcerns}` : ''}`,
      });
    });

    screenings.forEach((s) => {
      const scrDate = new Date(s.createdAt).toISOString().split('T')[0];
      timeline.push({
        id: `screen_${s._id}`,
        type: 'screening',
        title: 'Cognitive Screening Assessment',
        date: scrDate,
        timestamp: s.createdAt,
        badge: `Score: ${s.overallScore}/100`,
        badgeColor: s.overallScore >= 75 ? 'emerald' : s.overallScore >= 50 ? 'amber' : 'rose',
        details: `${s.riskIndicator} • Memory: ${s.memoryScore}% • Focus: ${s.attentionScore}%`,
      });
    });

    notes.forEach((n) => {
      const noteDate = new Date(n.date).toISOString().split('T')[0];
      timeline.push({
        id: `note_${n._id}`,
        type: 'doctor_note',
        title: `Clinical Note (${n.category})`,
        date: noteDate,
        timestamp: n.createdAt,
        badge: n.category,
        badgeColor: 'violet',
        details: n.note,
      });
    });

    timeline.sort((a, b) => new Date(b.date || b.timestamp) - new Date(a.date || a.timestamp));

    return res.status(200).json(timeline);
  } catch (error) {
    console.error('Get patient timeline error:', error);
    return res.status(500).json({ message: error.message || 'Failed to assemble timeline' });
  }
};

// ==========================================
// 8. DOCTOR NOTES MANAGEMENT
// ==========================================
export const getPatientDoctorNotes = async (req, res) => {
  try {
    const { patientId } = req.params;
    const authorized = await isAuthorizedForPatient(req.user, patientId);
    if (!authorized) {
      return res.status(403).json({ message: 'Access denied: Patient not in your panel' });
    }

    const notes = await DoctorNote.find({ patient: patientId })
      .populate('doctor', 'name email')
      .sort({ date: -1 });

    return res.status(200).json(notes);
  } catch (error) {
    console.error('Get doctor notes error:', error);
    return res.status(500).json({ message: error.message || 'Failed to fetch doctor notes' });
  }
};

export const addPatientDoctorNote = async (req, res) => {
  try {
    const { patientId } = req.params;
    const authorized = await isAuthorizedForPatient(req.user, patientId);
    if (!authorized) {
      return res.status(403).json({ message: 'Access denied: Patient not in your panel' });
    }

    const { note, category } = req.body;
    if (!note?.trim()) {
      return res.status(400).json({ message: 'Clinical note text is required' });
    }

    const doctorNote = new DoctorNote({
      patient: patientId,
      doctor: req.user._id,
      note: note.trim(),
      category: category || 'General Observation',
      date: new Date(),
    });

    await doctorNote.save();

    const populated = await DoctorNote.findById(doctorNote._id).populate('doctor', 'name email');

    return res.status(201).json({
      success: true,
      message: 'Clinical note recorded successfully',
      note: populated,
    });
  } catch (error) {
    console.error('Add doctor note error:', error);
    return res.status(500).json({ message: error.message || 'Failed to add clinical note' });
  }
};

// ==========================================
// 9. DOCTOR CARE PLAN MANAGEMENT
// ==========================================
export const getPatientCarePlans = async (req, res) => {
  try {
    const { patientId } = req.params;
    const authorized = await isAuthorizedForPatient(req.user, patientId);
    if (!authorized) {
      return res.status(403).json({ message: 'Access denied: Patient not in your panel' });
    }

    const carePlans = await CarePlan.find({ patient: patientId })
      .populate('doctor', 'name')
      .sort({ createdAt: -1 });

    const active = carePlans.filter((cp) => cp.status === 'Active');
    const completed = carePlans.filter((cp) => cp.status === 'Completed');

    return res.status(200).json({ active, completed, all: carePlans });
  } catch (error) {
    console.error('Get care plans error:', error);
    return res.status(500).json({ message: error.message || 'Failed to fetch care plans' });
  }
};

export const createPatientCarePlan = async (req, res) => {
  try {
    const { patientId } = req.params;
    const authorized = await isAuthorizedForPatient(req.user, patientId);
    if (!authorized) {
      return res.status(403).json({ message: 'Access denied: Patient not in your panel' });
    }

    const { goal, description, category, startDate, targetDate } = req.body;
    if (!goal?.trim()) {
      return res.status(400).json({ message: 'Goal title is required' });
    }

    const plan = new CarePlan({
      patient: patientId,
      doctor: req.user._id,
      goal: goal.trim(),
      description: description ? description.trim() : '',
      category: category || 'General',
      startDate: startDate || new Date().toISOString().split('T')[0],
      targetDate: targetDate || '',
      status: 'Active',
    });

    await plan.save();

    return res.status(201).json({
      success: true,
      message: 'Care goal created successfully',
      carePlan: plan,
    });
  } catch (error) {
    console.error('Create care plan error:', error);
    return res.status(500).json({ message: error.message || 'Failed to create care plan' });
  }
};

export const updatePatientCarePlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const { status, goal, description, targetDate } = req.body;

    const plan = await CarePlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Care goal not found' });
    }

    const authorized = await isAuthorizedForPatient(req.user, plan.patient);
    if (!authorized) {
      return res.status(403).json({ message: 'Access denied: Not your patient' });
    }

    if (status) plan.status = status;
    if (goal) plan.goal = goal.trim();
    if (description !== undefined) plan.description = description.trim();
    if (targetDate !== undefined) plan.targetDate = targetDate.trim();

    await plan.save();

    return res.status(200).json({
      success: true,
      message: 'Care goal updated successfully',
      carePlan: plan,
    });
  } catch (error) {
    console.error('Update care plan error:', error);
    return res.status(500).json({ message: error.message || 'Failed to update care plan' });
  }
};
