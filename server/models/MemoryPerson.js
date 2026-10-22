import mongoose from 'mongoose';

const memoryPersonSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  relationship: { type: String, required: true },
  photo: { type: String },
  description: { type: String },
}, { timestamps: true });

export default mongoose.model('MemoryPerson', memoryPersonSchema);
