import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true, enum: ['Male', 'Female', 'Other'] },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  phone: { type: String, trim: true, default: '' },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['patient', 'caregiver', 'doctor', 'screeningUser'] },
  profileImage: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
