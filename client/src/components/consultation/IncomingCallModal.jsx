import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Video,
  PhoneCall,
  PhoneOff,
  Stethoscope,
  Calendar,
  Clock,
  User,
  ShieldCheck,
} from 'lucide-react';

const IncomingCallModal = ({ incomingCall, onAccept, onReject, userRole }) => {
  const navigate = useNavigate();

  if (!incomingCall) return null;

  const doctorName =
    incomingCall.doctor?.name || incomingCall.doctorName || 'Attending Doctor';
  const patientName =
    incomingCall.patient?.name || incomingCall.patientName || 'Patient';
  const appointmentDate = incomingCall.date || 'Today';
  const appointmentTime = incomingCall.time || 'Now';
  const appointmentTitle = incomingCall.title || 'Clinical Video Consultation';

  const handleAcceptClick = async () => {
    try {
      await onAccept(incomingCall._id || incomingCall.appointmentId);
      const targetRoute =
        userRole === 'caregiver'
          ? `/caregiver/appointments/${incomingCall._id || incomingCall.appointmentId}/meeting`
          : `/patient/appointments/${incomingCall._id || incomingCall.appointmentId}/meeting`;
      navigate(targetRoute);
    } catch (err) {
      console.error('Accept call error:', err);
    }
  };

  const handleRejectClick = async () => {
    try {
      await onReject(incomingCall._id || incomingCall.appointmentId);
    } catch (err) {
      console.error('Reject call error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 sm:p-8 text-center shadow-2xl border border-indigo-100">
        
        {/* PULSING MEDICAL RINGING BADGE */}
        <div className="relative mx-auto mb-5 flex h-24 w-24 items-center justify-center">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-30" />
          <span className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white shadow-xl shadow-indigo-200">
            <Video size={36} className="animate-bounce" />
          </span>
        </div>

        {/* HEADER */}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-indigo-700 border border-indigo-100 mb-2">
          <Stethoscope size={13} /> Incoming Video Consultation
        </span>

        {/* DOCTOR & PATIENT ANNOUNCEMENT */}
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Dr. {doctorName}
        </h3>

        <p className="mt-1.5 text-xs sm:text-sm font-semibold text-slate-600">
          {userRole === 'caregiver' ? (
            <>
              is starting an online consultation for{' '}
              <strong className="text-slate-900">{patientName}</strong>
            </>
          ) : (
            <>is starting your online clinical consultation</>
          )}
        </p>

        {/* APPOINTMENT DETAILS CARD */}
        <div className="my-5 rounded-2xl bg-slate-50 border border-slate-200/80 p-4 text-left space-y-1.5 text-xs text-slate-600">
          <p className="font-extrabold text-slate-800 text-xs sm:text-sm truncate">
            {appointmentTitle}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold text-slate-500 pt-1">
            <span className="flex items-center gap-1">
              <Calendar size={13} className="text-indigo-600" /> {appointmentDate}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={13} className="text-indigo-600" /> {appointmentTime}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 mb-6">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span>Encrypted WebRTC consultation room</span>
        </div>

        {/* ACCEPT / REJECT BUTTONS */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <button
            type="button"
            onClick={handleRejectClick}
            className="flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 py-3.5 px-4 text-xs font-black text-red-600 shadow-xs hover:bg-red-100 hover:border-red-300 transition active:scale-95"
          >
            <PhoneOff size={16} />
            <span>Reject Call</span>
          </button>

          <button
            type="button"
            onClick={handleAcceptClick}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3.5 px-4 text-xs font-black text-white shadow-lg shadow-emerald-200 hover:from-emerald-700 hover:to-teal-700 transition active:scale-95"
          >
            <PhoneCall size={16} />
            <span>Accept Call</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default IncomingCallModal;
