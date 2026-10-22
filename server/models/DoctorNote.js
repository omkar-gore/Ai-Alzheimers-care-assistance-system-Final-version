import mongoose from 'mongoose';

const doctorNoteSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    note: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        'General Observation',
        'Cognitive Observation',
        'Medication',
        'Behaviour',
        'Follow-up',
        'Other',
      ],
      default: 'General Observation',
      index: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model('DoctorNote', doctorNoteSchema);
