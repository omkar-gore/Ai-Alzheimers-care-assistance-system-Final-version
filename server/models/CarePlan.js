import mongoose from 'mongoose';

const carePlanSchema = new mongoose.Schema(
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
    goal: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      enum: ['Cognitive', 'Physical', 'Medication', 'Routine', 'General'],
      default: 'General',
    },
    startDate: {
      type: String,
      default: '',
      trim: true,
    },
    targetDate: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Completed', 'Discontinued'],
      default: 'Active',
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('CarePlan', carePlanSchema);
