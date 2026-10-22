import mongoose from 'mongoose';

const dailyActivityReportSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    caregiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    tasksCompleted: {
      type: Number,
      default: 0,
    },
    tasksAssigned: {
      type: Number,
      default: 0,
    },
    taskCompletion: {
      type: Number,
      default: 0,
    },
    medicinesTaken: {
      type: Number,
      default: 0,
    },
    medicinesTotal: {
      type: Number,
      default: 0,
    },
    medicationAdherence: {
      type: Number,
      default: 0,
    },
    mood: {
      type: String,
      default: 'Not recorded',
      trim: true,
    },
    sleep: {
      type: String,
      default: 'Not recorded',
      trim: true,
    },
    caregiverNotes: {
      type: String,
      default: '',
      trim: true,
    },
    screeningCompleted: {
      type: Boolean,
      default: false,
    },
    screeningScore: {
      type: Number,
      default: null,
    },
    cognitiveActivityScore: {
      type: Number,
      default: 0,
    },
    overallActivityScore: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 100,
    },
    activityHighlights: [
      {
        type: String,
      },
    ],
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Unique index so a patient has only 1 report per date
dailyActivityReportSchema.index({ patient: 1, date: 1 }, { unique: true });

export default mongoose.model('DailyActivityReport', dailyActivityReportSchema);
