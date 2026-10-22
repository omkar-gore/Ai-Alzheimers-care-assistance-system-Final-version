import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from '../services/axios';
import { useAuth } from './AuthContext';
import IncomingCallModal from '../components/consultation/IncomingCallModal';

const ConsultationContext = createContext(null);

export const ConsultationProvider = ({ children }) => {
  const { user } = useAuth();
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeConsultation, setActiveConsultation] = useState(null);

  // 1. Fetch active incoming call invitations via REST polling
  const checkActiveCalls = useCallback(async () => {
    if (!user || (user.role !== 'patient' && user.role !== 'caregiver')) {
      return;
    }
    try {
      const res = await axios.get('/appointments/active-call-invitations');
      const invitations = res.data?.invitations || [];
      if (invitations.length > 0) {
        // Find first call that is still waiting/active and user hasn't rejected
        const activeInvite = invitations[0];
        setIncomingCall((prev) => {
          // If already showing this invite, don't re-trigger state
          if (prev && prev._id === activeInvite._id) return prev;
          return activeInvite;
        });
      } else {
        setIncomingCall(null);
      }
    } catch (err) {
      // Gracefully ignore background poll errors
    }
  }, [user]);

  // 2. Poll every 4 seconds for Patient / Caregiver
  useEffect(() => {
    if (!user || (user.role !== 'patient' && user.role !== 'caregiver')) {
      setIncomingCall(null);
      return;
    }

    checkActiveCalls();
    const pollTimer = setInterval(checkActiveCalls, 4000);
    return () => clearInterval(pollTimer);
  }, [user, checkActiveCalls]);

  // 3. Connect real-time SSE stream for instant push notifications
  useEffect(() => {
    if (!user) return;

    const token =
      localStorage.getItem('caremate-token') ||
      localStorage.getItem('caremate_token') ||
      localStorage.getItem('token');
    if (!token) return;

    let eventSource = null;
    try {
      const streamUrl = `http://localhost:5000/api/appointments/consultation-stream?token=${encodeURIComponent(token)}`;
      eventSource = new EventSource(streamUrl);

      eventSource.addEventListener('videoCallIncoming', (event) => {
        try {
          const data = JSON.parse(event.data);
          // Check if this incoming call is for this user
          if (user.role === 'patient' || user.role === 'caregiver') {
            setIncomingCall(data);
          }
        } catch (e) {
          console.error('Error parsing videoCallIncoming event:', e);
        }
      });

      eventSource.addEventListener('consultationEnded', (event) => {
        setIncomingCall(null);
      });

      eventSource.onerror = () => {
        // EventSource will auto-reconnect
      };
    } catch (e) {
      console.warn('SSE connection could not be established; polling remains active:', e);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [user]);

  // 4. Accept Call Handler
  const acceptCall = async (appointmentId) => {
    try {
      const res = await axios.post(`/appointments/${appointmentId}/call-response`, {
        response: 'accepted',
      });
      setIncomingCall(null);
      return res.data;
    } catch (err) {
      console.error('Failed to accept call:', err);
      throw err;
    }
  };

  // 5. Reject Call Handler
  const rejectCall = async (appointmentId) => {
    try {
      await axios.post(`/appointments/${appointmentId}/call-response`, {
        response: 'rejected',
      });
      setIncomingCall(null);
    } catch (err) {
      console.error('Failed to reject call:', err);
      throw err;
    }
  };

  const value = {
    incomingCall,
    acceptCall,
    rejectCall,
    dismissCall: () => setIncomingCall(null),
    activeConsultation,
    setActiveConsultation,
  };

  return (
    <ConsultationContext.Provider value={value}>
      {children}
      {/* Global incoming consultation modal for patient and caregiver */}
      <IncomingCallModal
        incomingCall={incomingCall}
        onAccept={acceptCall}
        onReject={rejectCall}
        userRole={user?.role}
      />
    </ConsultationContext.Provider>
  );
};

export const useConsultation = () => {
  const context = useContext(ConsultationContext);
  if (!context) {
    throw new Error('useConsultation must be used within a ConsultationProvider');
  }
  return context;
};
