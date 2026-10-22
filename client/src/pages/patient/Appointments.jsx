import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Clock,
  MapPin,
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  CalendarCheck,
  Video,
  PhoneCall,
  PhoneOff,
} from 'lucide-react';
import axios from '../../services/axios';
import PatientLayout from './PatientLayout';

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const getStatusBadge = (status) => {
  if (status === 'Completed') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }
  if (status === 'Cancelled') {
    return 'bg-rose-50 text-rose-700 border-rose-200';
  }
  return 'bg-blue-50 text-blue-700 border-blue-200';
};

const PatientAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/patient/appointments');
      setAppointments(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Patient appointments load error:', err);
      setError('Unable to load appointments at this time.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    const interval = setInterval(fetchAppointments, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAcceptCall = async (appointmentId) => {
    try {
      await axios.post(`/appointments/${appointmentId}/call-response`, { response: 'accepted' });
      navigate(`/patient/appointments/${appointmentId}/meeting`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept consultation');
    }
  };

  const handleRejectCall = async (appointmentId) => {
    try {
      await axios.post(`/appointments/${appointmentId}/call-response`, { response: 'rejected' });
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to decline consultation');
    }
  };

  const scheduledList = appointments.filter((a) => a.status !== 'Completed' && a.status !== 'Cancelled');
  const pastList = appointments.filter((a) => a.status === 'Completed' || a.status === 'Cancelled');

  return (
    <PatientLayout
      title="Doctor Appointments"
      subtitle="View your upcoming doctor visits, timings, and checkup reminders."
    >
      <div className="space-y-8">
        {/* TOP BANNER */}
        <div className="rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 p-7 text-white shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
                <CalendarCheck size={14} /> Care Calendar
              </span>
              <h2 className="text-2xl font-black">Your Medical Appointments</h2>
              <p className="text-sm text-blue-100 max-w-xl">
                Keep track of visits scheduled with your doctor and clinic. Your caregiver and doctor help keep this schedule updated.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 px-5 py-3 text-center">
                <p className="text-xs text-blue-100 font-medium">Upcoming</p>
                <p className="text-2xl font-black">{scheduledList.length}</p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700">
            <AlertCircle size={18} className="shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* UPCOMING VISITS */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <CalendarDays size={20} className="text-blue-600" />
            <h3 className="text-lg font-extrabold text-slate-900">Upcoming Visits</h3>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700">
              {scheduledList.length}
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-12 bg-white rounded-3xl border border-slate-100">
              <p className="text-sm font-semibold text-slate-400">Loading appointments...</p>
            </div>
          ) : scheduledList.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-3">
                <CheckCircle2 size={28} />
              </div>
              <h4 className="text-base font-bold text-slate-800">No Upcoming Appointments</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                You have no scheduled visits at the moment. Your doctor or caregiver can schedule checkups for you.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {scheduledList.map((app) => (
                <div
                  key={app._id}
                  className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                        <Stethoscope size={22} />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900">{app.title}</h4>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <User size={13} /> {app.doctor?.name || 'Assigned Physician'}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-extrabold ${getStatusBadge(
                        app.status
                      )}`}
                    >
                      {app.status || 'Scheduled'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-50 p-3.5 text-xs">
                    <div className="flex items-center gap-2 text-slate-700">
                      <CalendarDays size={15} className="text-blue-500 shrink-0" />
                      <span className="font-semibold">{formatDate(app.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Clock size={15} className="text-blue-500 shrink-0" />
                      <span className="font-semibold">{app.time}</span>
                    </div>
                  </div>

                  {app.location && (
                    <div className="flex items-start gap-2 text-xs text-slate-600">
                      <MapPin size={15} className="text-slate-400 shrink-0 mt-0.5" />
                      <span>{app.location}</span>
                    </div>
                  )}

                  {app.description && (
                    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs text-slate-600 flex items-start gap-2">
                      <FileText size={14} className="text-slate-400 shrink-0 mt-0.5" />
                      <span>{app.description}</span>
                    </div>
                  )}

                  {/* ONLINE VIDEO CONSULTATION ACTIONS */}
                  {app.appointmentMode === 'online' && (
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-black uppercase text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 flex items-center gap-1.5">
                        <Video size={13} /> Online Consultation
                      </span>

                      {/* CALL INVITATION CONTROLS */}
                      {app.meetingStatus === 'waiting' || app.meetingStatus === 'active' ? (
                        app.patientCallResponse === 'rejected' ? (
                          <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-xl">
                            Call Declined
                          </span>
                        ) : app.patientCallResponse === 'accepted' || app.patientJoinedAt ? (
                          <button
                            type="button"
                            onClick={() => navigate(`/patient/appointments/${app._id}/meeting`)}
                            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-black text-white shadow-md shadow-emerald-200 transition"
                          >
                            <Video size={14} />
                            <span>Join Consultation</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleRejectCall(app._id)}
                              className="flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100 transition"
                            >
                              <PhoneOff size={13} />
                              <span>Reject</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAcceptCall(app._id)}
                              className="flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 text-xs font-black text-white shadow-md shadow-emerald-200 transition animate-pulse"
                            >
                              <PhoneCall size={13} />
                              <span>Accept Call</span>
                            </button>
                          </div>
                        )
                      ) : (
                        <span className="text-[11px] font-bold text-slate-400">
                          Waiting for doctor to start call
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* PAST VISITS */}
        {pastList.length > 0 && (
          <section className="space-y-4 pt-4 border-t border-slate-200">
            <h3 className="text-base font-extrabold text-slate-700">Past & Completed Visits</h3>
            <div className="grid gap-3 md:grid-cols-2">
              {pastList.map((app) => (
                <div
                  key={app._id}
                  className="rounded-2xl border border-slate-200 bg-white/70 p-4 space-y-2 opacity-85"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-slate-800 text-sm">{app.title}</h5>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${getStatusBadge(
                        app.status
                      )}`}
                    >
                      {app.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>{formatDate(app.date)}</span>
                    <span>{app.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </PatientLayout>
  );
};

export default PatientAppointments;
