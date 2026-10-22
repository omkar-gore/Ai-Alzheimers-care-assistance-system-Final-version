import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
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
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      default: null,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
    },
    purpose: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: [
        'PENDING',
        'PROCESSING',
        'SUCCESSFUL',
        'FAILED',
        'CANCELLED',
        'EXPIRED',
        'DEMO_SUCCESSFUL',
      ],
      default: 'PENDING',
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['UPI', 'UPI_QR', 'UPI_INTENT', 'DEMO_UPI', 'GATEWAY'],
      default: 'UPI',
    },
    upiId: {
      type: String,
      default: '',
      trim: true,
    },
    payerVpa: {
      type: String,
      default: '',
      trim: true,
    },
    gatewayOrderId: {
      type: String,
      default: '',
      index: true,
    },
    gatewayPaymentId: {
      type: String,
      default: '',
    },
    transactionId: {
      type: String,
      default: '',
      index: true,
    },
    qrPayload: {
      type: String,
      default: '',
    },
    paidAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    failureReason: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    isDemo: {
      type: Boolean,
      default: false,
    },
    receiptNumber: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ doctor: 1, createdAt: -1 });
paymentSchema.index({ caregiver: 1, createdAt: -1 });
paymentSchema.index({ patient: 1, createdAt: -1 });

export default mongoose.model('Payment', paymentSchema);
