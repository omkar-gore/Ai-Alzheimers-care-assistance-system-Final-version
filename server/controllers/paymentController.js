import crypto from 'crypto';
import mongoose from 'mongoose';
import Payment from '../models/Payment.js';
import User from '../models/User.js';
import PatientProfile from '../models/PatientProfile.js';
import CaregiverProfile from '../models/CaregiverProfile.js';
import Appointment from '../models/Appointment.js';
import { isAuthorizedForPatient } from '../utils/authCheck.js';
import { resolveExistingCaregiverForPatient } from '../utils/patientCaregiverHelper.js';

// ==========================================
// HELPER: Check Gateway Configuration
// ==========================================
const isGatewayConfigured = () => {
  const keyId = process.env.PAYMENT_KEY_ID || process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.PAYMENT_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET;
  return Boolean(keyId && keySecret && keyId.trim() !== '' && keySecret.trim() !== '');
};

// ==========================================
// 1. GET PUBLIC PAYMENT CONFIGURATION
// ==========================================
export const getPaymentConfig = async (req, res) => {
  try {
    const configured = isGatewayConfigured();
    const keyId = configured
      ? (process.env.PAYMENT_KEY_ID || process.env.RAZORPAY_KEY_ID)
      : null;

    res.json({
      isConfigured: configured,
      isDemo: !configured,
      keyId,
      currency: 'INR',
      merchantName: process.env.UPI_MERCHANT_NAME || 'CareMate Health Services',
      merchantVpa: process.env.UPI_MERCHANT_VPA || 'caremate.doctor@upi',
      mode: configured ? 'PRODUCTION_GATEWAY' : 'SANDBOX_DEMO',
    });
  } catch (error) {
    console.error('getPaymentConfig error:', error);
    res.status(500).json({ message: 'Failed to retrieve payment configuration' });
  }
};

// ==========================================
// 2. CREATE PAYMENT REQUEST (Doctor Only)
// ==========================================
export const createPayment = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const {
      patientId,
      caregiverId,
      amount,
      purpose,
      description,
      appointmentId,
      expiresAt,
    } = req.body;

    if (!patientId) {
      return res.status(400).json({ message: 'Patient selection is required' });
    }

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ message: 'A valid payment amount in ₹ is required' });
    }

    if (!purpose || !purpose.trim()) {
      return res.status(400).json({ message: 'Payment purpose is required' });
    }

    // Check doctor authorization for this patient
    const authorized = await isAuthorizedForPatient(req.user, patientId);
    if (!authorized) {
      return res.status(403).json({
        message: 'You are not authorized to create a payment for this patient',
      });
    }

    // Verify patient user exists
    const patientUser = await User.findById(patientId);
    if (!patientUser || patientUser.role !== 'patient') {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Resolve Caregiver for this patient from authoritative database relationship
    const caregiverUser = await resolveExistingCaregiverForPatient(patientId);

    const cgRole = String(caregiverUser?.role || caregiverUser?.userRole || '').trim().toLowerCase();
    if (!caregiverUser || (cgRole && cgRole !== 'caregiver')) {
      return res.status(400).json({
        message:
          'No caregiver is linked to this patient. Please assign a caregiver before creating a payment request.',
      });
    }

    const targetCaregiverId = caregiverUser._id;

    // Validate optional appointment
    let linkedAppointment = null;
    if (appointmentId) {
      linkedAppointment = await Appointment.findById(appointmentId);
      if (!linkedAppointment) {
        return res.status(404).json({ message: 'Specified appointment not found' });
      }
    }

    // Unique Receipt Number
    const receiptNumber = `RCPT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const parsedAmount = Number(amount);

    // Build standard NPCI UPI Payment URI
    const merchantVpa = process.env.UPI_MERCHANT_VPA || 'caremate.doctor@upi';
    const merchantName = encodeURIComponent(
      process.env.UPI_MERCHANT_NAME || 'CareMate Health'
    );
    const upiNote = encodeURIComponent(`${purpose.trim()} - ${receiptNumber}`);
    const qrPayload = `upi://pay?pa=${merchantVpa}&pn=${merchantName}&am=${parsedAmount.toFixed(
      2
    )}&cu=INR&tn=${upiNote}&tr=${receiptNumber}`;

    const configured = isGatewayConfigured();
    let gatewayOrderId = '';
    const isDemo = !configured;

    // If real gateway is configured, create Razorpay Order
    if (configured) {
      try {
        const keyId = process.env.PAYMENT_KEY_ID || process.env.RAZORPAY_KEY_ID;
        const keySecret = process.env.PAYMENT_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET;
        const authHeader =
          'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');

        const orderRes = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authHeader,
          },
          body: JSON.stringify({
            amount: Math.round(parsedAmount * 100), // in paise
            currency: 'INR',
            receipt: receiptNumber,
            notes: {
              patientId: patientId.toString(),
              doctorId: doctorId.toString(),
              caregiverId: targetCaregiverId.toString(),
              purpose: purpose.trim(),
            },
          }),
        });

        if (orderRes.ok) {
          const orderData = await orderRes.json();
          gatewayOrderId = orderData.id;
        } else {
          console.warn('Gateway order creation failed, falling back to manual UPI tracking');
        }
      } catch (gwErr) {
        console.error('Payment gateway error during order creation:', gwErr);
      }
    } else {
      gatewayOrderId = `demo_ord_${Date.now()}`;
    }

    // Create Payment Document
    const payment = new Payment({
      doctor: doctorId,
      patient: patientId,
      caregiver: targetCaregiverId,
      appointment: appointmentId || null,
      amount: parsedAmount,
      currency: 'INR',
      purpose: purpose.trim(),
      description: (description || '').trim(),
      status: 'PENDING',
      paymentMethod: 'UPI',
      gatewayOrderId,
      qrPayload,
      receiptNumber,
      isDemo,
      notes: isDemo
        ? 'Created in Sandbox / Demo Mode (No gateway keys configured)'
        : 'Created with Payment Gateway Integration',
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    });

    await payment.save();

    // Link payment in Appointment if provided
    if (appointmentId) {
      await Appointment.findByIdAndUpdate(appointmentId, { payment: payment._id });
    }

    const populatedPayment = await Payment.findById(payment._id)
      .populate('patient', 'name email phone age gender')
      .populate('caregiver', 'name email phone')
      .populate('doctor', 'name email phone')
      .populate('appointment', 'date time title appointmentMode');

    res.status(201).json({
      message: 'Payment request created successfully',
      payment: populatedPayment,
    });
  } catch (error) {
    console.error('createPayment error:', error);
    res.status(500).json({ message: error.message || 'Failed to create payment request' });
  }
};

// ==========================================
// 3. GET DOCTOR PAYMENTS (Doctor Only)
// ==========================================
export const getDoctorPayments = async (req, res) => {
  try {
    const doctorId = req.user._id;

    const payments = await Payment.find({ doctor: doctorId })
      .populate('patient', 'name email phone age gender')
      .populate('caregiver', 'name email phone')
      .populate('appointment', 'date time title appointmentMode')
      .sort({ createdAt: -1 });

    const totalCollected = payments
      .filter((p) => p.status === 'SUCCESSFUL' || p.status === 'DEMO_SUCCESSFUL')
      .reduce((sum, p) => sum + p.amount, 0);

    const pendingAmount = payments
      .filter((p) => p.status === 'PENDING')
      .reduce((sum, p) => sum + p.amount, 0);

    const stats = {
      totalCount: payments.length,
      successfulCount: payments.filter(
        (p) => p.status === 'SUCCESSFUL' || p.status === 'DEMO_SUCCESSFUL'
      ).length,
      pendingCount: payments.filter((p) => p.status === 'PENDING').length,
      totalCollected,
      pendingAmount,
    };

    res.json({
      payments,
      stats,
    });
  } catch (error) {
    console.error('getDoctorPayments error:', error);
    res.status(500).json({ message: 'Failed to fetch doctor payments' });
  }
};

// ==========================================
// 4. GET CAREGIVER PAYMENTS (Caregiver Only)
// ==========================================
export const getCaregiverPayments = async (req, res) => {
  try {
    const caregiverId = req.user._id;

    const payments = await Payment.find({ caregiver: caregiverId })
      .populate('patient', 'name email phone age gender')
      .populate('doctor', 'name email phone')
      .populate('appointment', 'date time title appointmentMode')
      .sort({ createdAt: -1 });

    const pending = payments.filter((p) => p.status === 'PENDING');
    const history = payments.filter((p) => p.status !== 'PENDING');

    res.json({
      payments,
      pending,
      history,
    });
  } catch (error) {
    console.error('getCaregiverPayments error:', error);
    res.status(500).json({ message: 'Failed to fetch caregiver payments' });
  }
};

// ==========================================
// 5. GET PAYMENT BY ID (Doctor or Caregiver)
// ==========================================
export const getPaymentById = async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({ message: 'Invalid payment ID' });
    }

    const payment = await Payment.findById(paymentId)
      .populate('patient', 'name email phone age gender')
      .populate('caregiver', 'name email phone')
      .populate('doctor', 'name email phone')
      .populate('appointment', 'date time title appointmentMode');

    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    const userIdStr = req.user._id.toString();
    const isDoctor = payment.doctor?._id?.toString() === userIdStr || payment.doctor?.toString() === userIdStr;
    const isCaregiver = payment.caregiver?._id?.toString() === userIdStr || payment.caregiver?.toString() === userIdStr;

    if (!isDoctor && !isCaregiver) {
      return res.status(403).json({ message: 'Permission denied: unauthorized payment access' });
    }

    res.json({ payment });
  } catch (error) {
    console.error('getPaymentById error:', error);
    res.status(500).json({ message: 'Failed to fetch payment details' });
  }
};

// ==========================================
// 6. CREATE / PREPARE PAYMENT ORDER (Caregiver Only)
// ==========================================
export const createPaymentOrder = async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({ message: 'Invalid payment ID' });
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.caregiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Permission denied: not your payment' });
    }

    if (payment.status === 'SUCCESSFUL' || payment.status === 'DEMO_SUCCESSFUL') {
      return res.status(400).json({ message: 'Payment is already completed' });
    }

    if (payment.status === 'CANCELLED') {
      return res.status(400).json({ message: 'Payment has been cancelled by the doctor' });
    }

    const configured = isGatewayConfigured();
    const keyId = configured
      ? (process.env.PAYMENT_KEY_ID || process.env.RAZORPAY_KEY_ID)
      : null;

    res.json({
      paymentId: payment._id,
      amount: payment.amount,
      currency: payment.currency,
      purpose: payment.purpose,
      gatewayOrderId: payment.gatewayOrderId,
      qrPayload: payment.qrPayload,
      keyId,
      isDemo: payment.isDemo || !configured,
    });
  } catch (error) {
    console.error('createPaymentOrder error:', error);
    res.status(500).json({ message: 'Failed to prepare payment order' });
  }
};

// ==========================================
// 7. VERIFY PAYMENT (Caregiver Only)
// ==========================================
export const verifyPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      paymentMethod,
      isDemoSimulation,
      payerVpa,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({ message: 'Invalid payment ID' });
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check caregiver authorization
    if (payment.caregiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    // Idempotency: already paid
    if (payment.status === 'SUCCESSFUL' || payment.status === 'DEMO_SUCCESSFUL') {
      const populated = await Payment.findById(payment._id)
        .populate('patient', 'name email')
        .populate('caregiver', 'name email')
        .populate('doctor', 'name email');
      return res.json({
        success: true,
        message: 'Payment already verified and completed',
        payment: populated,
      });
    }

    // ------------------------------------------
    // A. DEMO / SANDBOX MODE VERIFICATION
    // ------------------------------------------
    if (payment.isDemo || isDemoSimulation) {
      const demoTxnId = `DEMO-TXN-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase()}`;

      payment.status = 'DEMO_SUCCESSFUL';
      payment.paymentMethod = paymentMethod || 'DEMO_UPI';
      payment.transactionId = demoTxnId;
      payment.gatewayPaymentId = demoTxnId;
      payment.payerVpa = payerVpa || 'caregiver.demo@upi';
      payment.paidAt = new Date();
      payment.notes = 'DEMO PAYMENT — NOT A REAL TRANSACTION (Simulated in Sandbox Mode)';

      await payment.save();

      const populated = await Payment.findById(payment._id)
        .populate('patient', 'name email')
        .populate('caregiver', 'name email')
        .populate('doctor', 'name email')
        .populate('appointment', 'date time title');

      return res.json({
        success: true,
        isDemo: true,
        message: 'Sandbox demo payment simulation completed',
        payment: populated,
      });
    }

    // ------------------------------------------
    // B. REAL PAYMENT GATEWAY VERIFICATION
    // ------------------------------------------
    const keySecret = process.env.PAYMENT_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(500).json({
        message: 'Payment gateway secret not configured on server',
      });
    }

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({
        message: 'Missing gateway verification signatures',
      });
    }

    // Server-side HMAC SHA-256 signature verification
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      payment.status = 'FAILED';
      payment.failureReason = 'Cryptographic signature mismatch during verification';
      await payment.save();

      return res.status(400).json({
        success: false,
        message: 'Payment signature verification failed',
      });
    }

    // Status verification with gateway API
    try {
      const keyId = process.env.PAYMENT_KEY_ID || process.env.RAZORPAY_KEY_ID;
      const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const fetchRes = await fetch(
        `https://api.razorpay.com/v1/payments/${razorpay_payment_id}`,
        {
          headers: { Authorization: authHeader },
        }
      );

      if (fetchRes.ok) {
        const fetchPayment = await fetchRes.json();
        // Server validates amount against database record
        const expectedPaise = Math.round(payment.amount * 100);
        if (Number(fetchPayment.amount) !== expectedPaise) {
          payment.status = 'FAILED';
          payment.failureReason = 'Amount mismatch detected between gateway and record';
          await payment.save();
          return res.status(400).json({ message: 'Payment amount mismatch' });
        }

        if (fetchPayment.vpa) {
          payment.payerVpa = fetchPayment.vpa;
        }
      }
    } catch (apiErr) {
      console.warn('Could not double-check payment status with gateway API:', apiErr);
    }

    // Mark successful
    payment.status = 'SUCCESSFUL';
    payment.gatewayPaymentId = razorpay_payment_id;
    payment.transactionId = razorpay_payment_id;
    payment.paymentMethod = paymentMethod || 'UPI';
    payment.paidAt = new Date();
    payment.notes = 'Verified through Payment Gateway';

    await payment.save();

    const populated = await Payment.findById(payment._id)
      .populate('patient', 'name email')
      .populate('caregiver', 'name email')
      .populate('doctor', 'name email')
      .populate('appointment', 'date time title');

    res.json({
      success: true,
      isDemo: false,
      message: 'Payment verified successfully',
      payment: populated,
    });
  } catch (error) {
    console.error('verifyPayment error:', error);
    res.status(500).json({ message: error.message || 'Payment verification failed' });
  }
};

// ==========================================
// 8. PAYMENT WEBHOOK (Gateway Server-to-Server)
// ==========================================
export const paymentWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    // Verify webhook signature if secret configured
    if (webhookSecret && signature) {
      const payloadString = req.rawBody
        ? req.rawBody.toString('utf8')
        : JSON.stringify(req.body);

      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(payloadString)
        .digest('hex');

      if (expectedSignature !== signature) {
        console.warn('⚠️ Webhook signature mismatch');
        return res.status(400).json({ message: 'Invalid webhook signature' });
      }
    }

    const event = req.body?.event;
    const payload = req.body?.payload;

    if (!event || !payload) {
      return res.status(200).json({ message: 'Ignored: No event payload' });
    }

    // Handle payment.captured or order.paid
    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload.payment?.entity;
      const orderEntity = payload.order?.entity;
      const orderId = paymentEntity?.order_id || orderEntity?.id;

      if (orderId) {
        const payment = await Payment.findOne({ gatewayOrderId: orderId });
        if (payment && payment.status !== 'SUCCESSFUL') {
          payment.status = 'SUCCESSFUL';
          payment.gatewayPaymentId = paymentEntity?.id || payment.gatewayPaymentId;
          payment.transactionId = paymentEntity?.id || payment.transactionId;
          payment.paidAt = new Date();
          if (paymentEntity?.vpa) {
            payment.payerVpa = paymentEntity.vpa;
          }
          payment.notes = 'Updated via Webhook Event: ' + event;
          await payment.save();
        }
      }
    } else if (event === 'payment.failed') {
      const paymentEntity = payload.payment?.entity;
      const orderId = paymentEntity?.order_id;
      if (orderId) {
        const payment = await Payment.findOne({ gatewayOrderId: orderId });
        if (payment && payment.status === 'PENDING') {
          payment.status = 'FAILED';
          payment.failureReason = paymentEntity?.error_description || 'Payment failed';
          await payment.save();
        }
      }
    }

    res.status(200).json({ status: 'ok', received: true });
  } catch (error) {
    console.error('paymentWebhook error:', error);
    res.status(500).json({ message: 'Webhook processing error' });
  }
};

// ==========================================
// 9. CANCEL PAYMENT (Doctor Only)
// ==========================================
export const cancelPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({ message: 'Invalid payment ID' });
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Permission denied: not your payment' });
    }

    if (payment.status !== 'PENDING') {
      return res.status(400).json({
        message: `Cannot cancel payment with status ${payment.status}`,
      });
    }

    payment.status = 'CANCELLED';
    payment.notes = 'Cancelled by doctor on ' + new Date().toISOString();
    await payment.save();

    res.json({
      message: 'Payment request cancelled successfully',
      payment,
    });
  } catch (error) {
    console.error('cancelPayment error:', error);
    res.status(500).json({ message: 'Failed to cancel payment' });
  }
};
