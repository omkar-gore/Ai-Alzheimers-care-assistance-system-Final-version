import { EventEmitter } from 'events';

export const consultationEmitter = new EventEmitter();
consultationEmitter.setMaxListeners(200);

// Active SSE clients map: userId (string) -> Set of Express response objects
const sseClients = new Map();

/**
 * Register an SSE client connection for a given user
 */
export const registerSseClient = (userId, res) => {
  const uid = userId.toString();
  if (!sseClients.has(uid)) {
    sseClients.set(uid, new Set());
  }
  const clientSet = sseClients.get(uid);
  clientSet.add(res);

  res.on('close', () => {
    clientSet.delete(res);
    if (clientSet.size === 0) {
      sseClients.delete(uid);
    }
  });
};

/**
 * Send an event payload to a specific user via SSE
 */
export const sendEventToUser = (userId, eventType, data) => {
  if (!userId) return;
  const uid = userId.toString();
  const clients = sseClients.get(uid);
  if (clients && clients.size > 0) {
    const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const res of clients) {
      try {
        res.write(payload);
      } catch (err) {
        console.error(`Failed to push SSE event to user ${uid}:`, err.message);
      }
    }
  }
};

/**
 * Broadcast an incoming video call invitation to target Patient and Caregiver
 */
export const broadcastIncomingCall = (appointment, doctorUser) => {
  const payload = {
    type: 'videoCallIncoming',
    appointmentId: appointment._id.toString(),
    meetingRoomId: appointment.meetingRoomId,
    doctorId: doctorUser?._id?.toString() || appointment.doctor?.toString(),
    doctorName: doctorUser?.name || 'Practitioner',
    patientId: appointment.patient?.toString(),
    caregiverId: appointment.caregiver ? appointment.caregiver.toString() : null,
    date: appointment.date,
    time: appointment.time,
    title: appointment.title,
    meetingStatus: appointment.meetingStatus || 'waiting',
    callStartedAt: appointment.callStartedAt,
  };

  consultationEmitter.emit('call-incoming', payload);

  // Send specifically to patient
  if (appointment.patient) {
    sendEventToUser(appointment.patient, 'videoCallIncoming', payload);
  }

  // Send specifically to assigned caregiver
  if (appointment.caregiver) {
    sendEventToUser(appointment.caregiver, 'videoCallIncoming', payload);
  }
};

/**
 * Notify doctor and participants about an accept/reject call response
 */
export const broadcastCallResponse = (appointment, responderUser, responseType) => {
  const payload = {
    type: responseType === 'accepted' ? 'videoCallAccepted' : 'videoCallRejected',
    appointmentId: appointment._id.toString(),
    meetingRoomId: appointment.meetingRoomId,
    responderId: responderUser._id.toString(),
    responderName: responderUser.name,
    responderRole: responderUser.role,
    response: responseType,
    meetingStatus: appointment.meetingStatus,
    patientCallResponse: appointment.patientCallResponse,
    caregiverCallResponse: appointment.caregiverCallResponse,
    patientJoined: !!appointment.patientJoinedAt,
    caregiverJoined: !!appointment.caregiverJoinedAt,
  };

  consultationEmitter.emit('call-response', payload);

  // Send to doctor
  if (appointment.doctor) {
    sendEventToUser(appointment.doctor, payload.type, payload);
  }
  // Send to patient & caregiver for synchronization
  if (appointment.patient) {
    sendEventToUser(appointment.patient, payload.type, payload);
  }
  if (appointment.caregiver) {
    sendEventToUser(appointment.caregiver, payload.type, payload);
  }
};

/**
 * Notify participants that the consultation has ended
 */
export const broadcastCallEnded = (appointment) => {
  const payload = {
    type: 'consultationEnded',
    appointmentId: appointment._id.toString(),
    meetingStatus: 'completed',
    callEndedAt: appointment.callEndedAt,
  };

  consultationEmitter.emit('call-ended', payload);

  if (appointment.doctor) {
    sendEventToUser(appointment.doctor, 'consultationEnded', payload);
  }
  if (appointment.patient) {
    sendEventToUser(appointment.patient, 'consultationEnded', payload);
  }
  if (appointment.caregiver) {
    sendEventToUser(appointment.caregiver, 'consultationEnded', payload);
  }
};
