import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../services/axios';
import { useAuth } from '../../context/AuthContext';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Users,
  Shield,
  Stethoscope,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  X,
  AlertTriangle,
  Info,
} from 'lucide-react';

const VideoConsultationPage = ({ role }) => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [callData, setCallData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Media Permissions state
  const [mediaPermissionChecked, setMediaPermissionChecked] = useState(false);
  const [mediaWarning, setMediaWarning] = useState('');

  // Jitsi Container Ref & API instance
  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);
  const [jitsiLoading, setJitsiLoading] = useState(true);

  // Doctor End Consultation Confirmation Modal
  const [showEndModal, setShowEndModal] = useState(false);
  const [endingCall, setEndingCall] = useState(false);

  // Call ended announcement (for Patient & Caregiver)
  const [consultationEnded, setConsultationEnded] = useState(false);

  // 1. Fetch Call Status and verify authorized participant access
  const fetchCallStatus = async () => {
    try {
      const res = await axios.get(`/appointments/${appointmentId}/call-status`);
      setCallData(res.data);
      if (res.data.meetingStatus === 'completed' && role !== 'doctor') {
        setConsultationEnded(true);
      }
    } catch (err) {
      console.error('Failed to load consultation status:', err);
      setError(
        err.response?.data?.message ||
          'Unauthorized or invalid consultation room. Access denied.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCallStatus();
    // Poll call status every 3 seconds for live participant synchronization
    const timer = setInterval(fetchCallStatus, 3000);
    return () => clearInterval(timer);
  }, [appointmentId, role]);

  // 2. Pre-call media permissions check (Requirement 25)
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          // Immediately stop preview stream tracks after checking permission
          stream.getTracks().forEach((track) => track.stop());
        }
      } catch (err) {
        console.warn('Media permission advisory:', err.message);
        setMediaWarning(
          'Camera or microphone permission is required for full video consultation. You can continue with available audio/video settings.'
        );
      } finally {
        setMediaPermissionChecked(true);
      }
    };

    checkPermissions();
  }, []);

  // 3. Initialize Jitsi Meet External API (Requirement 9 & 10)
  useEffect(() => {
    if (!callData?.meetingRoomId || !mediaPermissionChecked) return;

    // Load Jitsi Meet external API script if not already present
    const loadJitsiScript = () => {
      return new Promise((resolve, reject) => {
        if (window.JitsiMeetExternalAPI) {
          resolve(window.JitsiMeetExternalAPI);
          return;
        }
        const existingScript = document.getElementById('jitsi-script');
        if (existingScript) {
          existingScript.onload = () => resolve(window.JitsiMeetExternalAPI);
          return;
        }
        const script = document.createElement('script');
        script.id = 'jitsi-script';
        script.src = 'https://meet.jit.si/external_api.js';
        script.async = true;
        script.onload = () => resolve(window.JitsiMeetExternalAPI);
        script.onerror = () => reject(new Error('Failed to load Jitsi Meet API'));
        document.body.appendChild(script);
      });
    };

    loadJitsiScript()
      .then((JitsiAPI) => {
        if (!jitsiContainerRef.current) return;

        // Clean up previous instance if any
        if (jitsiApiRef.current) {
          jitsiApiRef.current.dispose();
          jitsiApiRef.current = null;
        }

        const domain = 'meet.jit.si';
        const displayName =
          role === 'doctor'
            ? `Dr. ${user?.name || 'Doctor'}`
            : role === 'caregiver'
            ? `${user?.name || 'Caregiver'} (Caregiver)`
            : `${user?.name || 'Patient'} (Patient)`;

        const options = {
          roomName: callData.meetingRoomId,
          width: '100%',
          height: '100%',
          parentNode: jitsiContainerRef.current,
          userInfo: {
            displayName,
            email: user?.email,
          },
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            prejoinPageEnabled: false,
            disableDeepLinking: true,
            enableWelcomePage: false,
            enableClosePage: false,
            disableThirdPartyRequests: true,
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [
              'microphone',
              'camera',
              'desktop',
              'chat',
              'raisehand',
              'videoquality',
              'tileview',
              'hangup',
            ],
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            DEFAULT_BACKGROUND: '#1e293b',
          },
        };

        const api = new JitsiAPI(domain, options);
        jitsiApiRef.current = api;
        setJitsiLoading(false);

        // Listen for hangup from within the Jitsi iframe
        api.addEventListener('videoConferenceLeft', () => {
          handleLeaveCall();
        });
      })
      .catch((err) => {
        console.error('Jitsi initialization error:', err);
        setJitsiLoading(false);
      });

    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
    };
  }, [callData?.meetingRoomId, mediaPermissionChecked]);

  // Leave Call Handler (Individual)
  const handleLeaveCall = () => {
    if (jitsiApiRef.current) {
      try {
        jitsiApiRef.current.dispose();
      } catch (e) {}
    }
    if (role === 'doctor') {
      navigate('/doctor/appointments');
    } else if (role === 'caregiver') {
      navigate('/caregiver/appointments');
    } else {
      navigate('/patient/appointments');
    }
  };

  // End Consultation Handler (Doctor Ends for all)
  const handleConfirmEndConsultation = async () => {
    setEndingCall(true);
    try {
      await axios.post(`/doctor/appointments/${appointmentId}/end-call`);
      if (jitsiApiRef.current) {
        try {
          jitsiApiRef.current.dispose();
        } catch (e) {}
      }
      // Return doctor to appointments with completion state
      navigate('/doctor/appointments', {
        state: { completedAppointmentId: appointmentId },
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to end consultation');
      setEndingCall(false);
      setShowEndModal(false);
    }
  };

  // Error view (Access Denied / Not Found)
  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center space-y-4 shadow-2xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 mx-auto">
            <AlertCircle size={28} />
          </div>
          <h2 className="text-xl font-black text-slate-900">Consultation Room Access Denied</h2>
          <p className="text-xs text-slate-600 leading-relaxed">{error}</p>
          <button
            type="button"
            onClick={handleLeaveCall}
            className="w-full rounded-2xl bg-indigo-600 py-3 text-xs font-black text-white hover:bg-indigo-700 transition"
          >
            Return to Appointments
          </button>
        </div>
      </div>
    );
  }

  // Loading view
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
        <Loader2 size={36} className="animate-spin text-indigo-400 mb-3" />
        <p className="text-sm font-bold text-slate-300">Connecting to secure clinical video room...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-slate-950 text-white flex flex-col overflow-hidden font-sans">
      
      {/* =========================================================
          TOP HEADER
      ========================================================= */}
      <header className="h-16 shrink-0 bg-slate-900/90 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleLeaveCall}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition"
            title="Back to Appointments"
          >
            <ArrowLeft size={16} />
          </button>

          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-black">
              <Stethoscope size={18} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-white">
                  Care<span className="text-indigo-400">Mate</span>
                </span>
                <span className="rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Consultation
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-xs">
                {callData?.title}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT: LEAVE OR END CONSULTATION BUTTON */}
        <div className="flex items-center gap-2 sm:gap-3">
          {role === 'doctor' ? (
            <button
              type="button"
              onClick={() => setShowEndModal(true)}
              className="flex items-center gap-1.5 rounded-2xl bg-red-600 hover:bg-red-700 px-4 py-2 text-xs font-black text-white shadow-lg shadow-red-900/40 transition active:scale-95"
            >
              <PhoneOff size={15} />
              <span className="hidden sm:inline">End Consultation for All</span>
              <span className="sm:hidden">End</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleLeaveCall}
              className="flex items-center gap-1.5 rounded-2xl bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-black text-slate-200 transition"
            >
              <PhoneOff size={15} />
              <span>Leave Call</span>
            </button>
          )}
        </div>
      </header>

      {/* MEDIA PERMISSION ADVISORY BANNER (IF APPLICABLE) */}
      {mediaWarning && (
        <div className="bg-amber-900/40 border-b border-amber-600/30 px-4 py-2 text-amber-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="text-amber-400 shrink-0" />
            <span>{mediaWarning}</span>
          </div>
          <button
            type="button"
            onClick={() => setMediaWarning('')}
            className="text-amber-300 hover:text-white p-1"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* =========================================================
          MAIN CONTENT AREA (VIDEO + PARTICIPANT SIDEBAR)
      ========================================================= */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* WEBRTC VIDEO CONTAINER (LEFT/CENTER) */}
        <div className="flex-1 h-full w-full bg-slate-950 relative flex items-center justify-center">
          {jitsiLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/80">
              <Loader2 size={32} className="animate-spin text-indigo-400 mb-2" />
              <p className="text-xs font-semibold text-slate-400">Loading video room interface...</p>
            </div>
          )}
          <div
            ref={jitsiContainerRef}
            className="h-full w-full"
            style={{ minHeight: '380px' }}
          />
        </div>

        {/* PARTICIPANT & CONSULTATION INFORMATION PANEL (RIGHT) */}
        <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-900/95 p-4 sm:p-5 flex flex-col justify-between shrink-0 overflow-y-auto max-h-60 lg:max-h-full">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Users size={14} className="text-indigo-400" /> Room Participants (3-Way)
              </span>
              <span className="text-[10px] font-bold text-slate-500">
                Encrypted
              </span>
            </div>

            {/* PARTICIPANT 1: DOCTOR */}
            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600/30 text-indigo-400 font-black text-xs border border-indigo-500/30">
                  Dr
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">
                    Dr. {callData?.doctor?.name}
                  </p>
                  <p className="text-[10px] text-indigo-300 font-semibold">Consulting Doctor</p>
                </div>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                <CheckCircle2 size={12} /> Joined
              </span>
            </div>

            {/* PARTICIPANT 2: PATIENT */}
            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600/30 text-blue-400 font-black text-xs border border-blue-500/30">
                  Pt
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">
                    {callData?.patient?.name}
                  </p>
                  <p className="text-[10px] text-blue-300 font-semibold">Patient</p>
                </div>
              </div>
              {callData?.patient?.joined || callData?.patient?.response === 'accepted' ? (
                <span className="flex items-center gap-1 text-[11px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                  <CheckCircle2 size={12} /> Joined
                </span>
              ) : callData?.patient?.response === 'rejected' ? (
                <span className="flex items-center gap-1 text-[11px] font-black text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-500/20">
                  ✕ Declined
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20 animate-pulse">
                  Waiting...
                </span>
              )}
            </div>

            {/* PARTICIPANT 3: CAREGIVER */}
            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal-600/30 text-teal-400 font-black text-xs border border-teal-500/30">
                  Cg
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">
                    {callData?.caregiver?.name || 'Not Assigned'}
                  </p>
                  <p className="text-[10px] text-teal-300 font-semibold">Caregiver</p>
                </div>
              </div>
              {!callData?.caregiver?.id ? (
                <span className="text-[10px] text-slate-500">None</span>
              ) : callData?.caregiver?.joined || callData?.caregiver?.response === 'accepted' ? (
                <span className="flex items-center gap-1 text-[11px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                  <CheckCircle2 size={12} /> Joined
                </span>
              ) : callData?.caregiver?.response === 'rejected' ? (
                <span className="flex items-center gap-1 text-[11px] font-black text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-500/20">
                  ✕ Declined
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20 animate-pulse">
                  Waiting...
                </span>
              )}
            </div>

            {/* APPOINTMENT DETAILS MINI CARD */}
            <div className="p-3.5 rounded-2xl bg-slate-800/30 border border-slate-800 text-xs text-slate-400 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-300">Appointment</span>
                <span className="text-slate-400">{callData?.date}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-300">Scheduled Time</span>
                <span className="text-indigo-400 font-semibold">{callData?.time}</span>
              </div>
            </div>

          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
            <Shield size={13} className="text-emerald-500" />
            <span>CareMate Clinical Video Engine</span>
          </div>

        </aside>

      </div>

      {/* =========================================================
          DOCTOR CONFIRMATION MODAL: END CONSULTATION FOR ALL
      ========================================================= */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 p-6 text-center space-y-4 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/20 text-red-400 mx-auto border border-red-500/30">
              <PhoneOff size={24} />
            </div>
            <h3 className="text-lg font-black text-white">End Consultation for All?</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              This will conclude the online meeting for Dr. {user?.name}, {callData?.patient?.name}, and caregiver. The appointment will be marked as Completed.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                disabled={endingCall}
                onClick={() => setShowEndModal(false)}
                className="rounded-2xl border border-slate-700 bg-slate-800 py-3 text-xs font-bold text-slate-300 hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={endingCall}
                onClick={handleConfirmEndConsultation}
                className="rounded-2xl bg-red-600 hover:bg-red-700 py-3 text-xs font-black text-white shadow-md transition disabled:opacity-50"
              >
                {endingCall ? 'Ending Call...' : 'End Consultation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          CONSULTATION ENDED MODAL (FOR PATIENT & CAREGIVER)
      ========================================================= */}
      {consultationEnded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-7 text-center space-y-4 shadow-2xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mx-auto">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900">Doctor Has Ended Consultation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dr. {callData?.doctor?.name} has concluded this online video meeting. Clinical notes and follow-up directives will be updated in your care portal.
            </p>
            <button
              type="button"
              onClick={handleLeaveCall}
              className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-700 py-3.5 text-xs font-black text-white shadow-md transition"
            >
              Return to Appointments
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default VideoConsultationPage;
