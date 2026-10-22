import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import {
  resolveTargetPatient,
  isAuthorizedForPatient,
  getAuthorizedPatientIds,
} from '../utils/authCheck.js';
import {
  broadcastIncomingCall,
  broadcastCallResponse,
  broadcastCallEnded,
  registerSseClient,
} from '../services/consultationNotifier.js';

// ==========================================
// GET APPOINTMENTS
// ==========================================
export const getAppointments = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'patient') {
      query = { patient: req.user._id };
    } else if (req.user.role === 'caregiver') {
      if (req.query.patientId) {
        const targetPatientId = await resolveTargetPatient(req.user, req.query.patientId);
        query = { patient: targetPatientId };
      } else {
        const authorizedPatientIds = await getAuthorizedPatientIds(req.user);
        query = {
          $or: [
            { caregiver: req.user._id },
            { patient: { $in: authorizedPatientIds } },
          ],
        };
      }
    } else if (req.user.role === 'doctor') {
      if (req.query.patientId) {
        const targetPatientId = await resolveTargetPatient(req.user, req.query.patientId);
        query = { patient: targetPatientId };
      } else {
        const authorizedPatientIds = await getAuthorizedPatientIds(req.user);
        query = {
          $or: [
            { doctor: req.user._id },
            { patient: { $in: authorizedPatientIds } },
          ],
        };
      }
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone age gender')
      .populate('caregiver', 'name email phone')
      .populate('doctor', 'name email phone')
      .populate('payment', 'amount status purpose transactionId receiptNumber')
      .sort({ date: 1, time: 1 });

    return res.status(200).json(appointments);
  } catch (error) {
    console.error('Get appointments error:', error);
    return res.status(error.status || 500).json({
      message: error.message || 'Failed to get appointments',
    });
  }
};

// ==========================================
// ADD APPOINTMENT
// ==========================================
export const addAppointment = async (req, res) => {
  try {
    if (req.user.role !== 'caregiver' && req.user.role !== 'doctor') {
      return res.status(403).json({
        message: 'Permission denied: Only caregivers or doctors can create appointments',
      });
    }

    const targetPatientId = await resolveTargetPatient(req.user, req.body.patientId);

    const { date, time, title, description, location, doctor, status } = req.body;

    if (!date?.trim() || !time?.trim() || !title?.trim()) {
      return res.status(400).json({
        message: 'Date, time, and title are required',
      });
    }

    let doctorId = null;
    if (req.user.role === 'doctor') {
      doctorId = req.user._id;
    } else if (doctor) {
      const doctorUser = await User.findOne({ _id: doctor, role: 'doctor' });
      if (doctorUser) {
        doctorId = doctorUser._id;
      }
    }

    let caregiverId = null;
    if (req.user.role === 'caregiver') {
      caregiverId = req.user._id;
    }

    const isOnline =
      req.body.appointmentMode === 'online' ||
      req.body.type === 'online' ||
      location?.toLowerCase().includes('online') ||
      location?.toLowerCase().includes('video');
    const finalMode = isOnline ? 'online' : 'in-person';
    const generatedRoomId = isOnline
      ? `CareMate-APT-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`
      : null;

    const appointment = new Appointment({
      patient: targetPatientId,
      caregiver: caregiverId,
      doctor: doctorId,
      date: date.trim(),
      time: time.trim(),
      title: title.trim(),
      description: description ? description.trim() : '',
      location: location ? location.trim() : (isOnline ? 'Online Video Consultation' : ''),
      status: status || 'Scheduled',
      appointmentMode: finalMode,
      meetingRoomId: generatedRoomId,
      meetingStatus: isOnline ? 'scheduled' : 'scheduled',
    });

    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone age gender')
      .populate('caregiver', 'name email phone')
      .populate('doctor', 'name email phone');

    return res.status(201).json(populatedAppointment);
  } catch (error) {
    console.error('Add appointment error:', error);
    return res.status(error.status || 500).json({
      message: error.message || 'Failed to add appointment',
    });
  }
};

// ==========================================
// UPDATE APPOINTMENT
// ==========================================
export const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Authorization check
    let authorized = false;
    if (req.user.role === 'patient') {
      authorized = appointment.patient.equals(req.user._id);
    } else if (req.user.role === 'caregiver') {
      authorized =
        (appointment.caregiver && appointment.caregiver.equals(req.user._id)) ||
        (await isAuthorizedForPatient(req.user, appointment.patient));
    } else if (req.user.role === 'doctor') {
      authorized =
        (appointment.doctor && appointment.doctor.equals(req.user._id)) ||
        (await isAuthorizedForPatient(req.user, appointment.patient));
    }

    if (!authorized) {
      return res.status(403).json({
        message: 'Permission denied: You cannot edit this appointment',
      });
    }

    const { date, time, title, description, location, doctor, status } = req.body;
    if (date !== undefined) appointment.date = date.trim();
    if (time !== undefined) appointment.time = time.trim();
    if (title !== undefined) appointment.title = title.trim();
    if (description !== undefined) appointment.description = description.trim();
    if (location !== undefined) appointment.location = location.trim();
    if (status !== undefined) appointment.status = status;
    if (req.body.appointmentMode !== undefined) {
      appointment.appointmentMode = req.body.appointmentMode;
      if (req.body.appointmentMode === 'online' && !appointment.meetingRoomId) {
        appointment.meetingRoomId = `CareMate-APT-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
      }
    }

    if (doctor !== undefined) {
      if (!doctor) {
        appointment.doctor = null;
      } else {
        const doctorUser = await User.findOne({ _id: doctor, role: 'doctor' });
        if (doctorUser) {
          appointment.doctor = doctorUser._id;
        }
      }
    }

    await appointment.save();

    const updatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone age gender')
      .populate('caregiver', 'name email phone')
      .populate('doctor', 'name email phone');

    return res.status(200).json(updatedAppointment);
  } catch (error) {
    console.error('Update appointment error:', error);
    return res.status(error.status || 500).json({
      message: error.message || 'Failed to update appointment',
    });
  }
};

// ==========================================
// DELETE APPOINTMENT
// ==========================================
export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    let authorized = false;
    if (req.user.role === 'caregiver') {
      authorized =
        (appointment.caregiver && appointment.caregiver.equals(req.user._id)) ||
        (await isAuthorizedForPatient(req.user, appointment.patient));
    } else if (req.user.role === 'doctor') {
      authorized =
        (appointment.doctor && appointment.doctor.equals(req.user._id)) ||
        (await isAuthorizedForPatient(req.user, appointment.patient));
    }

    if (!authorized) {
      return res.status(403).json({
        message: 'Permission denied: You cannot delete this appointment',
      });
    }

    await Appointment.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Delete appointment error:', error);
    return res.status(error.status || 500).json({
      message: error.message || 'Failed to delete appointment',
    });
  }
};

// ==========================================
// START VIDEO CALL (DOCTOR ONLY)
// ==========================================
export const startVideoCall = async (req, res) => {
  try {
    const appointmentId = req.params.appointmentId || req.params.id;
    const appointment = await Appointment.findById(appointmentId)
      .populate('patient', 'name email phone age gender')
      .populate('caregiver', 'name email phone')
      .populate('doctor', 'name email phone');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // 1. Verify caller is doctor and owns the appointment
    if (req.user.role !== 'doctor' || !appointment.doctor?._id.equals(req.user._id)) {
      return res.status(403).json({
        message: 'Access denied: Only the assigned consulting doctor can initiate this call',
      });
    }

    // 2. Verify appointment is an online consultation
    if (appointment.appointmentMode !== 'online') {
      return res.status(400).json({
        message: 'This appointment is designated as In-Person and does not support video consultation',
      });
    }

    // 3. Verify appointment is not cancelled or already completed
    if (appointment.status === 'Cancelled') {
      return res.status(400).json({ message: 'Cannot initiate call for a cancelled appointment' });
    }

    // 4. Ensure meeting room ID exists
    if (!appointment.meetingRoomId) {
      appointment.meetingRoomId = `CareMate-APT-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
    }

    // 5. Update call state
    appointment.meetingStatus = 'waiting';
    appointment.callStartedAt = new Date();
    appointment.doctorJoinedAt = new Date();
    appointment.patientCallResponse = 'pending';
    appointment.caregiverCallResponse = 'pending';

    await appointment.save();

    // 6. Broadcast incoming call notification to patient and caregiver
    broadcastIncomingCall(appointment, req.user);

    return res.status(200).json({
      success: true,
      message: 'Consultation initiated. Calling patient and caregiver...',
      meetingRoomId: appointment.meetingRoomId,
      appointment,
    });
  } catch (error) {
    console.error('Start video call error:', error);
    return res.status(500).json({ message: error.message || 'Failed to initiate video call' });
  }
};

// ==========================================
// END VIDEO CALL (DOCTOR ONLY)
// ==========================================
export const endVideoCall = async (req, res) => {
  try {
    const appointmentId = req.params.appointmentId || req.params.id;
    const appointment = await Appointment.findById(appointmentId)
      .populate('patient', 'name email phone age gender')
      .populate('caregiver', 'name email phone')
      .populate('doctor', 'name email phone');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Authorization: only the consulting doctor can end the consultation for all
    if (req.user.role !== 'doctor' || !appointment.doctor?._id.equals(req.user._id)) {
      return res.status(403).json({
        message: 'Access denied: Only the attending doctor can terminate this consultation',
      });
    }

    appointment.meetingStatus = 'completed';
    appointment.status = 'Completed';
    appointment.callEndedAt = new Date();

    await appointment.save();

    // Notify all participants
    broadcastCallEnded(appointment);

    return res.status(200).json({
      success: true,
      message: 'Consultation ended successfully',
      appointment,
    });
  } catch (error) {
    console.error('End video call error:', error);
    return res.status(500).json({ message: error.message || 'Failed to end consultation' });
  }
};

// ==========================================
// RESPOND TO CALL (PATIENT OR CAREGIVER)
// ==========================================
export const respondToCall = async (req, res) => {
  try {
    const appointmentId = req.params.appointmentId || req.params.id;
    const { response } = req.body; // 'accepted' or 'rejected'

    if (!['accepted', 'rejected'].includes(response)) {
      return res.status(400).json({ message: 'Invalid response: must be "accepted" or "rejected"' });
    }

    const appointment = await Appointment.findById(appointmentId)
      .populate('patient', 'name email phone age gender')
      .populate('caregiver', 'name email phone')
      .populate('doctor', 'name email phone');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const isPatient = appointment.patient?._id.equals(req.user._id);
    const isCaregiver =
      (appointment.caregiver && appointment.caregiver._id.equals(req.user._id)) ||
      (req.user.role === 'caregiver' && (await isAuthorizedForPatient(req.user, appointment.patient?._id)));

    if (!isPatient && !isCaregiver) {
      return res.status(403).json({
        message: 'Access denied: You are not an assigned participant for this appointment',
      });
    }

    if (isPatient) {
      appointment.patientCallResponse = response;
      if (response === 'accepted') {
        appointment.patientJoinedAt = new Date();
        appointment.meetingStatus = 'active';
      }
    }

    if (isCaregiver) {
      appointment.caregiverCallResponse = response;
      if (response === 'accepted') {
        appointment.caregiverJoinedAt = new Date();
        appointment.meetingStatus = 'active';
      }
    }

    await appointment.save();

    // Broadcast response event
    broadcastCallResponse(appointment, req.user, response);

    return res.status(200).json({
      success: true,
      response,
      meetingRoomId: response === 'accepted' ? appointment.meetingRoomId : null,
      appointment,
    });
  } catch (error) {
    console.error('Respond to call error:', error);
    return res.status(500).json({ message: error.message || 'Failed to record call response' });
  }
};

// ==========================================
// GET CALL STATUS & VERIFY ACCESS
// ==========================================
export const getCallStatus = async (req, res) => {
  try {
    const appointmentId = req.params.appointmentId || req.params.id;
    const appointment = await Appointment.findById(appointmentId)
      .populate('patient', 'name email phone age gender')
      .populate('caregiver', 'name email phone')
      .populate('doctor', 'name email phone');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Verify participant authorization
    let isAuthorized = false;
    if (req.user.role === 'doctor') {
      isAuthorized = appointment.doctor && appointment.doctor._id.equals(req.user._id);
    } else if (req.user.role === 'patient') {
      isAuthorized = appointment.patient && appointment.patient._id.equals(req.user._id);
    } else if (req.user.role === 'caregiver') {
      isAuthorized =
        (appointment.caregiver && appointment.caregiver._id.equals(req.user._id)) ||
        (await isAuthorizedForPatient(req.user, appointment.patient?._id));
    }

    if (!isAuthorized) {
      return res.status(403).json({
        message: 'Access denied: You are not authorized to access this consultation room',
      });
    }

    return res.status(200).json({
      success: true,
      appointmentId: appointment._id,
      title: appointment.title,
      date: appointment.date,
      time: appointment.time,
      location: appointment.location,
      appointmentMode: appointment.appointmentMode || 'in-person',
      meetingRoomId: appointment.meetingRoomId,
      meetingStatus: appointment.meetingStatus || 'scheduled',
      status: appointment.status,
      callStartedAt: appointment.callStartedAt,
      callEndedAt: appointment.callEndedAt,
      doctor: {
        id: appointment.doctor?._id,
        name: appointment.doctor?.name || 'Doctor',
        joined: !!appointment.doctorJoinedAt,
      },
      patient: {
        id: appointment.patient?._id,
        name: appointment.patient?.name || 'Patient',
        response: appointment.patientCallResponse,
        joined: !!appointment.patientJoinedAt,
      },
      caregiver: {
        id: appointment.caregiver?._id,
        name: appointment.caregiver?.name || 'Caregiver',
        response: appointment.caregiverCallResponse,
        joined: !!appointment.caregiverJoinedAt,
      },
      consultationNotes: appointment.consultationNotes,
      followUpInstructions: appointment.followUpInstructions,
    });
  } catch (error) {
    console.error('Get call status error:', error);
    return res.status(500).json({ message: error.message || 'Failed to fetch call status' });
  }
};

// ==========================================
// GET ACTIVE CALL INVITATIONS FOR CURRENT USER
// ==========================================
export const getActiveCallInvitations = async (req, res) => {
  try {
    const userId = req.user._id;
    let query = {
      appointmentMode: 'online',
      meetingStatus: { $in: ['waiting', 'active'] },
      status: { $ne: 'Cancelled' },
    };

    if (req.user.role === 'patient') {
      query.patient = userId;
      query.patientCallResponse = { $ne: 'rejected' };
    } else if (req.user.role === 'caregiver') {
      const authorizedPatientIds = await getAuthorizedPatientIds(req.user);
      query.$or = [
        { caregiver: userId },
        { patient: { $in: authorizedPatientIds } },
      ];
      query.caregiverCallResponse = { $ne: 'rejected' };
    } else if (req.user.role === 'doctor') {
      query.doctor = userId;
    }

    const activeCalls = await Appointment.find(query)
      .populate('patient', 'name email phone age gender')
      .populate('caregiver', 'name email phone')
      .populate('doctor', 'name email phone')
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      invitations: activeCalls,
    });
  } catch (error) {
    console.error('Get active invitations error:', error);
    return res.status(500).json({ message: error.message || 'Failed to get call invitations' });
  }
};

// ==========================================
// SSE STREAM FOR REAL-TIME CONSULTATION EVENTS
// ==========================================
export const consultationStream = async (req, res) => {
  try {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    registerSseClient(req.user._id, res);

    res.write(`event: connected\ndata: ${JSON.stringify({ userId: req.user._id, status: 'listening' })}\n\n`);

    // Heartbeat ping every 25 seconds
    const pingInterval = setInterval(() => {
      try {
        res.write(`event: ping\ndata: ${Date.now()}\n\n`);
      } catch (err) {
        clearInterval(pingInterval);
      }
    }, 25000);

    res.on('close', () => {
      clearInterval(pingInterval);
    });
  } catch (error) {
    console.error('Consultation stream error:', error);
    res.end();
  }
};