import mongoose from 'mongoose';

const caregiverReportSchema = new mongoose.Schema(
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
      required: true,
      index: true,
    },
    reportDate: {
      type: String,
      required: true,
      index: true,
    },
    mood: {
      type: String,
      default: 'Good',
      trim: true,
    },
    sleep: {
      type: String,
      default: 'Normal (7-8 hrs)',
      trim: true,
    },
    meals: {
      type: String,
      default: 'Finished all meals',
      trim: true,
    },
    medicationAdherence: {
      type: String,
      default: '100% Taken on time',
      trim: true,
    },
    behaviorObservations: {
      type: String,
      default: '',
      trim: true,
    },
    dailyConcerns: {
      type: String,
      default: '',
      trim: true,
    },
    additionalNotes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('CaregiverReport', caregiverReportSchema);
