import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

import User from './models/User.js';
import PatientProfile from './models/PatientProfile.js';
import CaregiverProfile from './models/CaregiverProfile.js';
import DoctorProfile from './models/DoctorProfile.js';
import Medicine from './models/Medicine.js';
import Schedule from './models/Schedule.js';
import Task from './models/Task.js';
import Appointment from './models/Appointment.js';
import MedicalReport from './models/MedicalReport.js';
import MemoryPerson from './models/MemoryPerson.js';
import Prescription from './models/Prescription.js';
import CaregiverReport from './models/CaregiverReport.js';
import DailyActivityReport from './models/DailyActivityReport.js';
import DoctorNote from './models/DoctorNote.js';
import CarePlan from './models/CarePlan.js';
import CognitiveScreening from './models/CognitiveScreening.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to DB');

  // Clean up existing
  await User.deleteMany({});
  await PatientProfile.deleteMany({});
  await CaregiverProfile.deleteMany({});
  await DoctorProfile.deleteMany({});
  await Medicine.deleteMany({});
  await Schedule.deleteMany({});
  await Task.deleteMany({});
  await Appointment.deleteMany({});
  await MedicalReport.deleteMany({});
  await MemoryPerson.deleteMany({});
  await Prescription.deleteMany({});
  await CaregiverReport.deleteMany({});
  await DailyActivityReport.deleteMany({});
  await DoctorNote.deleteMany({});
  await CarePlan.deleteMany({});
  await CognitiveScreening.deleteMany({});

  const salt = await bcrypt.genSalt(10);
  const defaultPassword = await bcrypt.hash('CareMate@123', salt);

  // ==========================================
  // 1. PATIENT A, CAREGIVER A, DOCTOR A
  // ==========================================
  const patientA = await User.create({
    name: 'Reeya Patel (Patient A)',
    age: 68,
    gender: 'Female',
    email: 'patienta@demo.com',
    phone: '9876543210',
    password: defaultPassword,
    role: 'patient',
  });

  const caregiverA = await User.create({
    name: 'Rajesh Patel (Caregiver A)',
    age: 45,
    gender: 'Male',
    email: 'caregivera@demo.com',
    phone: '9876501234',
    password: defaultPassword,
    role: 'caregiver',
  });

  const doctorA = await User.create({
    name: 'Dr. Asha Joshi (Doctor A)',
    age: 50,
    gender: 'Female',
    email: 'doctora@demo.com',
    phone: '9876509876',
    password: defaultPassword,
    role: 'doctor',
  });

  // ==========================================
  // 2. PATIENT B, CAREGIVER B, DOCTOR B
  // ==========================================
  const patientB = await User.create({
    name: 'Ramesh Sharma (Patient B)',
    age: 74,
    gender: 'Male',
    email: 'patientb@demo.com',
    phone: '9876543211',
    password: defaultPassword,
    role: 'patient',
  });

  const caregiverB = await User.create({
    name: 'Sunita Sharma (Caregiver B)',
    age: 48,
    gender: 'Female',
    email: 'caregiverb@demo.com',
    phone: '9876501235',
    password: defaultPassword,
    role: 'caregiver',
  });

  const doctorB = await User.create({
    name: 'Dr. Vikram Rao (Doctor B)',
    age: 54,
    gender: 'Male',
    email: 'doctorb@demo.com',
    phone: '9876509877',
    password: defaultPassword,
    role: 'doctor',
  });

  // ==========================================
  // 3. PROFILES & RELATIONSHIPS
  // Patient A is linked to Caregiver A and Doctor A
  // Patient B is linked to Caregiver B AND Doctor A (Doctor A has both Patient A and Patient B!)
  // ==========================================
  await PatientProfile.create({
    user: patientA._id,
    caregiverName: caregiverA.name,
    emergencyContact: caregiverA.phone,
    address: '101 Lotus Park, Nashik, Maharashtra',
    dateOfBirth: new Date('1958-04-15'),
    caregiver: caregiverA._id,
    doctor: doctorA._id,
    doctors: [doctorA._id],
  });

  await PatientProfile.create({
    user: patientB._id,
    caregiverName: caregiverB.name,
    emergencyContact: caregiverB.phone,
    address: '204 Heritage Heights, Pune, Maharashtra',
    dateOfBirth: new Date('1952-11-20'),
    caregiver: caregiverB._id,
    doctor: doctorA._id, // Assigned to Doctor A as well
    doctors: [doctorA._id],
  });

  await CaregiverProfile.create({
    user: caregiverA._id,
    relationshipWithPatient: 'Son',
    patientName: patientA.name,
    patient: patientA._id,
    patients: [patientA._id],
    emergencyContact: caregiverA.phone,
  });

  await CaregiverProfile.create({
    user: caregiverB._id,
    relationshipWithPatient: 'Daughter',
    patientName: patientB.name,
    patient: patientB._id,
    patients: [patientB._id],
    emergencyContact: caregiverB.phone,
  });

  // Doctor A has BOTH Patient A and Patient B
  await DoctorProfile.create({
    user: doctorA._id,
    medicalDegree: 'MD Neurology, DNB',
    specialization: 'Cognitive Neurology & Memory Disorders',
    clinicName: 'Metro Memory & Brain Wellness Clinic',
    yearsOfExperience: 22,
    medicalRegistrationNumber: 'MCI-DOC-10293',
    patients: [patientA._id, patientB._id],
  });

  // Doctor B has no patients assigned initially (or Patient B can be assigned)
  await DoctorProfile.create({
    user: doctorB._id,
    medicalDegree: 'MBBS, MD Geriatric Medicine',
    specialization: 'Geriatric Psychiatry',
    clinicName: 'Silver Oaks Care Center',
    yearsOfExperience: 18,
    medicalRegistrationNumber: 'MCI-DOC-54819',
    patients: [],
  });

  // ==========================================
  // 4. SEED DATA FOR PATIENT A
  // ==========================================
  await Medicine.create([
    {
      patient: patientA._id,
      name: 'Donepezil (Aricept)',
      dosage: '10 mg',
      time: '09:00 AM',
      instructions: 'Take 1 tablet after morning breakfast with water',
      status: 'pending',
    },
    {
      patient: patientA._id,
      name: 'Memantine (Namenda)',
      dosage: '10 mg',
      time: '08:00 PM',
      instructions: 'Take 1 tablet with evening meal',
      status: 'pending',
    },
  ]);

  await Schedule.create([
    { patient: patientA._id, time: '07:30 AM', activity: 'Wake Up & Gentle Stretches', notes: 'Open blinds for daylight' },
    { patient: patientA._id, time: '08:30 AM', activity: 'Healthy Breakfast', notes: 'Oatmeal, fruits, and warm milk' },
    { patient: patientA._id, time: '11:00 AM', activity: 'Memory Book Review', notes: 'Look through family album' },
    { patient: patientA._id, time: '05:00 PM', activity: 'Evening Garden Walk', notes: '20 minutes walking in garden' },
  ]);

  await Task.create([
    { patient: patientA._id, title: 'Drink morning glass of water', status: 'completed', dueTime: '08:00 AM' },
    { patient: patientA._id, title: 'Take morning Donepezil medication', status: 'pending', dueTime: '09:00 AM' },
    { patient: patientA._id, title: 'Solve 1 Mind Puzzle', status: 'pending', dueTime: '03:00 PM' },
    { patient: patientA._id, title: 'Evening light walk with Rajesh', status: 'pending', dueTime: '05:30 PM' },
  ]);

  await Appointment.create([
    {
      patient: patientA._id,
      caregiver: caregiverA._id,
      doctor: doctorA._id,
      title: 'Monthly Cognitive Review & MMSE',
      date: '2026-10-15',
      time: '10:30 AM',
      description: 'Check Donepezil tolerance and memory score changes.',
      location: 'Metro Memory Clinic, Room 302',
      status: 'Scheduled',
    },
  ]);

  await MedicalReport.create([
    {
      patient: patientA._id,
      caregiver: caregiverA._id,
      doctor: doctorA._id,
      reportName: 'Brain MRI Scan - Hippocampal Volume',
      reportType: 'MRI',
      fileName: 'mri_scan_patient_a.pdf',
      fileUrl: '/uploads/sample_mri.pdf',
      fileType: 'application/pdf',
      fileSize: 2450000,
    },
    {
      patient: patientA._id,
      caregiver: caregiverA._id,
      doctor: doctorA._id,
      reportName: 'Complete Blood Count & Vitamin B12',
      reportType: 'Blood Report',
      fileName: 'blood_report_patient_a.pdf',
      fileUrl: '/uploads/sample_blood.pdf',
      fileType: 'application/pdf',
      fileSize: 840000,
    },
  ]);

  await MemoryPerson.create([
    {
      patient: patientA._id,
      name: 'Rajesh Patel',
      relationship: 'Son (Caregiver)',
      photo: '',
      description: 'Your loving eldest son who visits and takes care of you every day.',
    },
  ]);

  // CLINICAL PRESCRIPTION HISTORY (PART 4)
  await Prescription.create([
    {
      patient: patientA._id,
      doctor: doctorA._id,
      medicineName: 'Donepezil',
      dosage: '5 mg',
      frequency: 'Once daily',
      duration: '30 days',
      startDate: '2026-10-01',
      endDate: '2026-10-31',
      instructions: 'Take after dinner with a glass of water.',
      doctorNotes: 'Stepped up dose to 5mg. Continue monitoring tolerance and gastrointestinal comfort.',
      status: 'Active',
      prescribedAt: new Date('2026-10-01T10:00:00Z'),
    },
    {
      patient: patientA._id,
      doctor: doctorA._id,
      medicineName: 'Donepezil',
      dosage: '2.5 mg',
      frequency: 'Once daily',
      duration: '30 days',
      startDate: '2026-09-01',
      endDate: '2026-09-30',
      instructions: 'Take after dinner.',
      doctorNotes: 'Initial titration dose for 4 weeks.',
      status: 'Stopped',
      prescribedAt: new Date('2026-09-01T09:30:00Z'),
    },
    {
      patient: patientA._id,
      doctor: doctorA._id,
      medicineName: 'Memantine',
      dosage: '5 mg',
      frequency: 'Once daily in the morning',
      duration: '60 days',
      startDate: '2026-09-15',
      endDate: '2026-11-15',
      instructions: 'Take with breakfast.',
      doctorNotes: 'Adjunct NMDA receptor antagonist therapy.',
      status: 'Active',
      prescribedAt: new Date('2026-09-15T11:00:00Z'),
    },
  ]);

  // CAREGIVER REPORTS (PART 5)
  await CaregiverReport.create([
    {
      patient: patientA._id,
      caregiver: caregiverA._id,
      reportDate: '2026-10-07',
      mood: 'Good',
      sleep: 'Normal (7-8 hrs)',
      meals: 'Finished all meals',
      medicationAdherence: '100% Taken on time',
      behaviorObservations: 'Very cooperative and engaged in conversation during afternoon tea.',
      dailyConcerns: '',
      additionalNotes: 'Completed morning routine smoothly.',
    },
    {
      patient: patientA._id,
      caregiver: caregiverA._id,
      reportDate: '2026-10-06',
      mood: 'Mildly Agitated',
      sleep: 'Woke up twice',
      meals: 'Ate half lunch',
      medicationAdherence: '85% Delayed morning dose',
      behaviorObservations: 'Slight agitation in the late afternoon around sunset.',
      dailyConcerns: 'Sundowning symptoms observed between 5 PM and 6:30 PM.',
      additionalNotes: 'Listening to classical bhajans helped restore calm.',
    },
    {
      patient: patientA._id,
      caregiver: caregiverA._id,
      reportDate: '2026-10-04',
      mood: 'Calm',
      sleep: 'Normal (8 hrs)',
      meals: 'Good appetite',
      medicationAdherence: '100% Taken on time',
      behaviorObservations: 'Enjoyed looking at old family albums.',
      dailyConcerns: '',
      additionalNotes: 'Memory recognition of grandchildren was prompt.',
    },
  ]);

  // COGNITIVE SCREENINGS (PART 9)
  await CognitiveScreening.create([
    {
      screeningUser: patientA._id,
      age: 68,
      educationLevel: 'Graduate',
      language: 'English',
      memoryScore: 78,
      delayedRecallScore: 72,
      attentionScore: 82,
      orientationScore: 80,
      languageScore: 84,
      reasoningScore: 76,
      workingMemoryScore: 74,
      dailyLifeScore: 78,
      overallScore: 78,
      riskIndicator: 'Some Cognitive Concerns',
      strengths: ['Immediate memory', 'Orientation', 'Language clarity'],
      areasForAttention: ['Delayed word recall after interference task'],
      createdAt: new Date('2026-10-05T14:30:00Z'),
    },
    {
      screeningUser: patientA._id,
      age: 68,
      educationLevel: 'Graduate',
      language: 'English',
      memoryScore: 70,
      delayedRecallScore: 65,
      attentionScore: 74,
      orientationScore: 76,
      languageScore: 80,
      reasoningScore: 70,
      workingMemoryScore: 70,
      dailyLifeScore: 72,
      overallScore: 72,
      riskIndicator: 'Some Cognitive Concerns',
      strengths: ['Language comprehension', 'Orientation'],
      areasForAttention: ['Delayed recall', 'Working memory under distraction'],
      createdAt: new Date('2026-09-02T10:15:00Z'),
    },
  ]);

  // PREVIOUS COMPLETED APPOINTMENT (PART 3)
  await Appointment.create([
    {
      patient: patientA._id,
      caregiver: caregiverA._id,
      doctor: doctorA._id,
      title: 'Initial Clinical Cognitive & Medication Assessment',
      type: 'Consultation',
      date: '2026-09-15',
      time: '11:00 AM',
      description: 'Review initial memory concerns and establish medication titration.',
      location: 'Metro Memory Clinic, Consultation Room 302',
      status: 'Completed',
      notes: 'Initial clinical baseline meeting.',
      consultationNotes: 'Patient is pleasant and communicative. Neurological exam reveals no focal deficits. MMSE baseline 22/30.',
      followUpInstructions: 'Initiate Donepezil at 2.5mg daily for 4 weeks. Monitor sleep and gastrointestinal tolerance.',
    },
  ]);

  // DOCTOR CLINICAL OBSERVATIONS (PART 12)
  await DoctorNote.create([
    {
      patient: patientA._id,
      doctor: doctorA._id,
      category: 'Cognitive Observation',
      note: 'Latest screening reflects stable cognitive performance (78/100). Orientation and daily recognition remain intact.',
      date: new Date('2026-10-05T15:00:00Z'),
    },
    {
      patient: patientA._id,
      doctor: doctorA._id,
      category: 'Medication',
      note: 'Titrated Donepezil up to 5 mg once daily. Caregiver reports good tolerance with zero GI discomfort.',
      date: new Date('2026-10-01T10:15:00Z'),
    },
  ]);

  // CARE PLAN GOALS (PART 21)
  await CarePlan.create([
    {
      patient: patientA._id,
      doctor: doctorA._id,
      goal: 'Complete 3 cognitive brain exercises daily',
      description: 'Engage in word puzzles or memory matching games to stimulate cognitive engagement.',
      category: 'Cognitive Stimulation',
      startDate: '2026-10-01',
      targetDate: '2026-11-01',
      status: 'Active',
    },
    {
      patient: patientA._id,
      doctor: doctorA._id,
      goal: 'Maintain >95% evening Donepezil compliance',
      description: 'Ensure medication is taken immediately post-dinner under caregiver supervision.',
      category: 'Medication Adherence',
      startDate: '2026-10-01',
      targetDate: '2026-11-15',
      status: 'Active',
    },
    {
      patient: patientA._id,
      doctor: doctorA._id,
      goal: 'Establish consistent 7-8 hour sleep hygiene',
      description: 'Dim lighting and calming classical music after 8:30 PM to minimize evening agitation.',
      category: 'Routine & Sleep',
      startDate: '2026-09-01',
      targetDate: '2026-09-30',
      status: 'Completed',
    },
  ]);

  // ==========================================
  // 5. SEED DATA FOR PATIENT B
  // ==========================================
  await Medicine.create([
    {
      patient: patientB._id,
      name: 'Rivastigmine (Exelon Patch)',
      dosage: '9.5 mg / 24h',
      time: '08:00 AM',
      instructions: 'Apply 1 patch to clean, dry skin on upper arm or back',
      status: 'pending',
    },
    {
      patient: patientB._id,
      name: 'Vitamin D3 & Calcium',
      dosage: '60,000 IU',
      time: '12:30 PM',
      instructions: 'Take with lunch',
      status: 'pending',
    },
  ]);

  await Schedule.create([
    { patient: patientB._id, time: '07:00 AM', activity: 'Morning Chai & Morning Walk', notes: 'In courtyard' },
    { patient: patientB._id, time: '12:30 PM', activity: 'Lunch & Family News', notes: 'Light Indian meal' },
    { patient: patientB._id, time: '04:00 PM', activity: 'Listening to Old Classical Songs', notes: 'Relaxing music session' },
  ]);

  await Task.create([
    { patient: patientB._id, title: 'Apply Rivastigmine Patch', status: 'pending', dueTime: '08:00 AM' },
    { patient: patientB._id, title: '15-minute breathing exercises', status: 'completed', dueTime: '09:00 AM' },
    { patient: patientB._id, title: 'Drink 2 liters of water by sunset', status: 'pending', dueTime: '06:00 PM' },
  ]);

  await Appointment.create([
    {
      patient: patientB._id,
      caregiver: caregiverB._id,
      doctor: doctorA._id,
      title: 'Exelon Patch Skin Check & Neuro Review',
      date: '2026-10-22',
      time: '02:00 PM',
      description: 'Evaluate skin tolerance and dosage effectiveness.',
      location: 'Metro Memory Clinic, Room 302',
      status: 'Scheduled',
    },
  ]);

  console.log('Seed completed successfully with multiple connected accounts!');
  console.log('Login credentials for all seeded accounts: Password = CareMate@123');
  console.log('Patient A: patienta@demo.com');
  console.log('Caregiver A: caregivera@demo.com');
  console.log('Doctor A: doctora@demo.com (Assigned: Patient A & Patient B)');
  console.log('Patient B: patientb@demo.com');
  console.log('Caregiver B: caregiverb@demo.com');
  console.log('Doctor B: doctorb@demo.com (Assigned: 0 patients)');

  mongoose.connection.close();
}

seed().catch((err) => {
  console.error('Seed error:', err);
  mongoose.connection.close();
});
