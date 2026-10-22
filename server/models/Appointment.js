import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    caregiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    location: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled'],
      default: 'Scheduled',
    },
    type: {
      type: String,
      enum: [
        'Consultation',
        'Follow-up',
        'Cognitive Review',
        'Medication Review',
        'General Check-up',
        'Other',
      ],
      default: 'Consultation',
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    consultationNotes: {
      type: String,
      default: '',
      trim: true,
    },
    followUpInstructions: {
      type: String,
      default: '',
      trim: true,
    },
    appointmentMode: {
      type: String,
      enum: ['in-person', 'online'],
      default: 'in-person',
    },
    meetingRoomId: {
      type: String,
      default: null,
    },
    meetingStatus: {
      type: String,
      enum: ['scheduled', 'waiting', 'active', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    callStartedAt: {
      type: Date,
      default: null,
    },
    callEndedAt: {
      type: Date,
      default: null,
    },
    doctorJoinedAt: {
      type: Date,
      default: null,
    },
    patientJoinedAt: {
      type: Date,
      default: null,
    },
    caregiverJoinedAt: {
      type: Date,
      default: null,
    },
    patientCallResponse: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    caregiverCallResponse: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Appointment', appointmentSchema);