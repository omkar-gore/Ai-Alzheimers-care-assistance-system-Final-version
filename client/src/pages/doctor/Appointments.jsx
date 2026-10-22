import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../../services/axios';
import { useDoctor } from '../../context/DoctorContext';
import PatientContextHeader from '../../components/doctor/PatientContextHeader';
import {
  Calendar,
  Clock,
  Plus,
  CheckCircle2,
  FileText,
  MapPin,
  X,
  Loader2,
  AlertCircle,
  Video,
  PhoneCall,
  Users,
  CreditCard,
} from 'lucide-react';

const Appointments = () => {
  const { selectedPatientId, selectedPatient, patientData, refreshPatientData } = useDoctor();
  const navigate = useNavigate();
  const location = useLocation();

  // Schedule Appointment Modal
  const [showApptModal, setShowApptModal] = useState(false);
  const [apptForm, setApptForm] = useState({
    date: '',
    time: '10:00 AM',
    type: 'Consultation',
    appointmentMode: 'in-person',
    location: 'Clinic Consultation Room',
    notes: '',
  });
  const [apptSubmitting, setApptSubmitting] = useState(false);
  const [apptMessage, setApptMessage] = useState({ type: '', text: '' });

  // Consultation Notes Modal
  const [showConsultModal, setShowConsultModal] = useState(false);
  const [selectedApptForConsult, setSelectedApptForConsult] = useState(null);
  const [consultForm, setConsultForm] = useState({
    status: 'Completed',
    consultationNotes: '',
    followUpInstructions: '',
  });
  const [consultSubmitting, setConsultSubmitting] = useState(false);

  // Check if returning from a completed consultation to prompt notes
  useEffect(() => {
    if (location.state?.completedAppointmentId && patientData) {
      const appt =
        (patientData.upcomingAppointments || []).find(
          (a) => a._id === location.state.completedAppointmentId
        ) ||
        (patientData.previousAppointments || []).find(
          (a) => a._id === location.state.completedAppointmentId
        );
      if (appt) {
        setSelectedApptForConsult(appt);
        setConsultForm({
          status: 'Completed',
          consultationNotes: appt.consultationNotes || '',
          followUpInstructions: appt.followUpInstructions || '',
        });
        setShowConsultModal(true);
      }
    }
  }, [location.state, patientData]);

  const handleStartCall = async (appt) => {
    try {
      await axios.post(`/doctor/appointments/${appt._id}/start-call`);
      navigate(`/doctor/appointments/${appt._id}/meeting`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start video consultation');
    }
  };

  // 1. SCHEDULE APPOINTMENT
  const handleScheduleAppointment = async (e) => {
    e.preventDefault();
    if (!apptForm.date || !apptForm.time || !selectedPatientId) return;
    setApptSubmitting(true);
    setApptMessage({ type: '', text: '' });
    try {
      await axios.post(`/doctor/patients/${selectedPatientId}/appointments`, {
        ...apptForm,
        title: `${apptForm.type} - Patient Consultation`,
      });
      setApptMessage({ type: 'success', text: 'Appointment scheduled successfully!' });
      refreshPatientData();
      setTimeout(() => {
        setShowApptModal(false);
        setApptMessage({ type: '', text: '' });
        setApptForm({
          date: '',
          time: '10:00 AM',
          type: 'Consultation',
          appointmentMode: 'in-person',
          location: 'Clinic Consultation Room',
          notes: '',
        });
      }, 1200);
    } catch (err) {
      setApptMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to schedule appointment.',
      });
    } finally {
      setApptSubmitting(false);
    }
  };

  // 2. SAVE CONSULTATION NOTES
  const handleSaveConsultationNotes = async (e) => {
    e.preventDefault();
    if (!selectedApptForConsult) return;
    setConsultSubmitting(true);
    try {
      await axios.put(`/doctor/appointments/${selectedApptForConsult._id}`, consultForm);
      refreshPatientData();
      setShowConsultModal(false);
      setSelectedApptForConsult(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save consultation notes');
    } finally {
      setConsultSubmitting(false);
    }
  };

  const upcomingAppointments = patientData?.upcomingAppointments || [];
  const previousAppointments = patientData?.previousAppointments || [];

  return (
    <div className="space-y-6">

      {/* PATIENT CONTEXT HEADER */}
      <PatientContextHeader
        title="Clinical Appointments & Follow-up Consultations"
        subtitle="Manage upcoming schedules, complete visits, and log consultation notes."
        actionButton={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/doctor/payments')}
              className="flex items-center gap-1.5 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-xs font-black text-indigo-700 hover:bg-indigo-100 transition"
            >
              <CreditCard size={15} />
              <span>Payments & Invoices</span>
            </button>
            <button
              type="button"
              onClick={() => setShowApptModal(true)}
              className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-xs font-black text-white shadow-md hover:bg-indigo-700 transition"
            >
              <Plus size={16} />
              <span>Schedule Appointment</span>
            </button>
          </div>
        }
      />

      {/* UPCOMING APPOINTMENTS SECTION */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-black text-sm uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Clock size={16} className="text-blue-600" /> Upcoming Scheduled Appointments
          </h3>
          <span className="text-xs font-bold text-slate-400">
            {upcomingAppointments.length} Scheduled
          </span>
        </div>

        {upcomingAppointments.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <Calendar size={36} className="mx-auto mb-2 opacity-30 text-indigo-600" />
            <p className="text-sm font-bold text-slate-600">No appointments scheduled for this patient.</p>
            <p className="text-xs text-slate-400 mt-1">
              Click "Schedule Appointment" to plan a clinical review or consultation.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingAppointments.map((appt) => {
              const isOnline = appt.appointmentMode === 'online';
              return (
                <div
                  key={appt._id}
                  className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
                    isOnline
                      ? 'bg-gradient-to-r from-indigo-50/40 to-purple-50/30 border-indigo-200'
                      : 'bg-slate-50 border-slate-200/80'
                  }`}
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {isOnline ? (
                        <span className="rounded-md bg-purple-100 text-purple-800 text-[10px] font-black uppercase px-2.5 py-0.5 flex items-center gap-1">
                          <Video size={11} /> Online Consultation
                        </span>
                      ) : (
                        <span className="rounded-md bg-slate-200 text-slate-700 text-[10px] font-black uppercase px-2 py-0.5">
                          In-Person
                        </span>
                      )}

                      <span className="rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-black uppercase px-2 py-0.5">
                        {appt.type || 'Consultation'}
                      </span>

                      {isOnline && appt.meetingStatus === 'active' && (
                        <span className="rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2 py-0.5 flex items-center gap-1 animate-pulse">
                          ● Call in progress
                        </span>
                      )}

                      <span className="font-black text-sm text-slate-900 truncate">
                        {appt.title}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-600">
                      📅 Date: <strong className="text-slate-900">{appt.date}</strong> at{' '}
                      <strong className="text-indigo-600">{appt.time}</strong> • 📍{' '}
                      {appt.location || (isOnline ? 'Online Video Consultation' : 'Clinic')}
                    </p>

                    {/* LIVE PARTICIPANT STATUS LABELS */}
                    {isOnline && (
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                        {appt.patientCallResponse === 'rejected' ? (
                          <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                            ✕ Patient Declined
                          </span>
                        ) : appt.patientJoinedAt ? (
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                            ✓ Patient Joined
                          </span>
                        ) : null}

                        {appt.caregiverCallResponse === 'rejected' ? (
                          <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                            ✕ Caregiver Declined
                          </span>
                        ) : appt.caregiverJoinedAt ? (
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                            ✓ Caregiver Joined
                          </span>
                        ) : null}
                      </div>
                    )}

                    {appt.notes && (
                      <p className="text-xs text-slate-500 italic mt-0.5">"{appt.notes}"</p>
                    )}

                    {/* PAYMENT STATUS IF ATTACHED */}
                    {appt.payment && (
                      <div className="flex items-center gap-2 pt-1 text-[11px] font-bold text-slate-600">
                        <CreditCard size={13} className="text-indigo-600" />
                        <span>
                          Fee: <strong className="text-slate-800">₹{appt.payment.amount || ''}</strong>
                        </span>
                        {appt.payment.status === 'SUCCESSFUL' || appt.payment.status === 'DEMO_SUCCESSFUL' ? (
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-100">
                            ✓ Paid
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => navigate('/doctor/payments')}
                            className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 hover:bg-blue-100 border border-blue-100"
                          >
                            View Invoice
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 self-start sm:self-center shrink-0">
                    {/* START CALL / JOIN CALL BUTTON FOR ONLINE APPOINTMENT */}
                    {isOnline && (
                      <button
                        type="button"
                        onClick={() => handleStartCall(appt)}
                        className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 px-4 py-2 text-xs font-black text-white shadow-md shadow-indigo-200 transition active:scale-95"
                      >
                        <Video size={14} />
                        <span>{appt.meetingStatus === 'active' ? 'Join Call' : 'Start Call'}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedApptForConsult(appt);
                        setConsultForm({
                          status: 'Completed',
                          consultationNotes: appt.consultationNotes || '',
                          followUpInstructions: appt.followUpInstructions || '',
                        });
                        setShowConsultModal(true);
                      }}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                    >
                      Complete & Notes
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PREVIOUS COMPLETED / PAST APPOINTMENTS */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-black text-sm uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" /> Previous Appointments & Consultation Records
          </h3>
          <span className="text-xs font-bold text-slate-400">
            {previousAppointments.length} Past Records
          </span>
        </div>

        {previousAppointments.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No past appointment history recorded.</p>
        ) : (
          <div className="space-y-3">
            {previousAppointments.map((appt) => (
              <div key={appt._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-slate-900">{appt.title}</span>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      appt.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {appt.status}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    {appt.date} • {appt.time}
                  </span>
                </div>

                {appt.consultationNotes ? (
                  <div className="rounded-xl bg-white p-3 border border-slate-200 text-xs space-y-1">
                    <p className="font-black text-slate-700">Doctor Consultation Notes:</p>
                    <p className="text-slate-600">{appt.consultationNotes}</p>
                    {appt.followUpInstructions && (
                      <p className="text-indigo-700 font-semibold mt-1">
                        Follow-up Instructions: {appt.followUpInstructions}
                      </p>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedApptForConsult(appt);
                      setConsultForm({
                        status: appt.status || 'Completed',
                        consultationNotes: '',
                        followUpInstructions: '',
                      });
                      setShowConsultModal(true);
                    }}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
                  >
                    + Add consultation notes & follow-up instructions
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SCHEDULE APPOINTMENT MODAL */}
      {showApptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-indigo-600" />
                <h3 className="font-black text-lg text-slate-800">Schedule Clinical Appointment</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowApptModal(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleScheduleAppointment} className="mt-4 space-y-4">
              {/* APPOINTMENT MODE SELECTOR (REQUIREMENT 1) */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-2">
                  Appointment Mode *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setApptForm({
                        ...apptForm,
                        appointmentMode: 'in-person',
                        location: 'Clinic Consultation Room',
                      })
                    }
                    className={`p-3 rounded-2xl border text-xs text-left transition ${
                      apptForm.appointmentMode === 'in-person'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-500 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white'
                    }`}
                  >
                    <span className="block font-black text-sm">🏥 In-Person</span>
                    <span className="text-[10px] text-slate-500">Clinic / Physical Visit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setApptForm({
                        ...apptForm,
                        appointmentMode: 'online',
                        location: 'Online Video Consultation',
                      })
                    }
                    className={`p-3 rounded-2xl border text-xs text-left transition ${
                      apptForm.appointmentMode === 'online'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-500 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white'
                    }`}
                  >
                    <span className="block font-black text-sm text-indigo-600">📹 Online Video</span>
                    <span className="text-[10px] text-slate-500">CareMate Telehealth Room</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={apptForm.date}
                    onChange={(e) => setApptForm({ ...apptForm, date: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                    Time *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10:30 AM"
                    value={apptForm.time}
                    onChange={(e) => setApptForm({ ...apptForm, time: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                  Appointment Type
                </label>
                <select
                  value={apptForm.type}
                  onChange={(e) => setApptForm({ ...apptForm, type: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-600"
                >
                  <option value="Consultation">Consultation</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Cognitive Review">Cognitive Review</option>
                  <option value="Medication Review">Medication Review</option>
                  <option value="General Check-up">General Check-up</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                  Location / Room
                </label>
                <input
                  type="text"
                  placeholder="Clinic Consultation Room 302 / Telehealth"
                  value={apptForm.location}
                  onChange={(e) => setApptForm({ ...apptForm, location: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                  Clinical Notes / Preparation Instructions
                </label>
                <textarea
                  rows={3}
                  placeholder="Notes for patient and caregiver prior to consultation..."
                  value={apptForm.notes}
                  onChange={(e) => setApptForm({ ...apptForm, notes: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-600"
                />
              </div>

              {apptMessage.text && (
                <div className={`p-3 rounded-xl text-xs font-bold ${
                  apptMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                }`}>
                  {apptMessage.text}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApptModal(false)}
                  className="rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={apptSubmitting}
                  className="rounded-2xl bg-indigo-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {apptSubmitting ? 'Scheduling...' : 'Save Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD CONSULTATION NOTES MODAL */}
      {showConsultModal && selectedApptForConsult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-indigo-600" />
                <h3 className="font-black text-lg text-slate-800">Record Consultation Notes</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowConsultModal(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveConsultationNotes} className="mt-4 space-y-4">
              <p className="text-xs text-slate-500">
                Recording consultation observations for: <strong>{selectedApptForConsult.title}</strong> ({selectedApptForConsult.date})
              </p>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                  Status
                </label>
                <select
                  value={consultForm.status}
                  onChange={(e) => setConsultForm({ ...consultForm, status: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-600"
                >
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                  Consultation Notes & Observations
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Record clinical impressions, cognitive status, and caregiver discussion..."
                  value={consultForm.consultationNotes}
                  onChange={(e) => setConsultForm({ ...consultForm, consultationNotes: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                  Follow-Up Instructions
                </label>
                <textarea
                  rows={2}
                  placeholder="Instructions for next appointment, care adjustments, or tests..."
                  value={consultForm.followUpInstructions}
                  onChange={(e) => setConsultForm({ ...consultForm, followUpInstructions: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConsultModal(false)}
                  className="rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={consultSubmitting}
                  className="rounded-2xl bg-indigo-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {consultSubmitting ? 'Saving...' : 'Save Consultation Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Appointments;
