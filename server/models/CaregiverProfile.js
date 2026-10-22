import mongoose from 'mongoose';

const caregiverProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    relationshipWithPatient: {
      type: String,
      default: 'Caregiver',
      trim: true,
    },
    patientName: {
      type: String,
      default: '',
      trim: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    patients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    emergencyContact: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('CaregiverProfile', caregiverProfileSchema);