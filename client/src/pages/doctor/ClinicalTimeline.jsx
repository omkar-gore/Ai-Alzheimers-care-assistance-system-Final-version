import React, { useState, useEffect } from 'react';
import axios from '../../services/axios';
import { useDoctor } from '../../context/DoctorContext';
import PatientContextHeader from '../../components/doctor/PatientContextHeader';
import {
  History,
  RefreshCw,
  Loader2,
  Calendar,
  Pill,
  ClipboardList,
  CalendarDays,
  Brain,
  FileText,
} from 'lucide-react';

const ClinicalTimeline = () => {
  const { selectedPatientId, selectedPatient } = useDoctor();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTimeline = async () => {
    if (!selectedPatientId) return;
    setLoading(true);
    try {
      const res = await axios.get(`/doctor/patients/${selectedPatientId}/timeline`);
      setEvents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load timeline:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, [selectedPatientId]);

  return (
    <div className="space-y-6">

      {/* PATIENT CONTEXT HEADER */}
      <PatientContextHeader
        title="Patient Clinical Timeline"
        subtitle="Chronological historical progression across daily reports, medications, visits, caregiver logs, and screenings."
        actionButton={
          <button
            type="button"
            onClick={fetchTimeline}
            className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            <RefreshCw size={14} />
            <span>Refresh Timeline</span>
          </button>
        }
      />

      {/* TIMELINE LIST */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {loading ? (
          <div className="text-center py-16">
            <Loader2 size={32} className="animate-spin mx-auto text-indigo-600 mb-2" />
            <p className="text-xs font-bold text-slate-500">Assembling chronological clinical timeline...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <History size={36} className="mx-auto mb-2 opacity-30 text-indigo-600" />
            <p className="text-sm font-bold text-slate-600">No clinical timeline events recorded yet.</p>
            <p className="text-xs text-slate-400 mt-1">
              Events will be logged chronologically as patient interactions and doctor visits occur.
            </p>
          </div>
        ) : (
          <div className="relative border-l-2 border-indigo-100 ml-4 pl-6 space-y-6">
            {events.map((evt) => (
              <div key={evt.id} className="relative group">
                <div className="absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full bg-indigo-600 border-2 border-white shadow-xs" />
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 hover:bg-indigo-50/20 transition">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-slate-900">{evt.title}</span>
                      <span className={`rounded-md text-[10px] font-black uppercase px-2 py-0.5 ${
                        evt.badgeColor === 'emerald'
                          ? 'bg-emerald-100 text-emerald-800'
                          : evt.badgeColor === 'amber'
                          ? 'bg-amber-100 text-amber-800'
                          : evt.badgeColor === 'blue'
                          ? 'bg-blue-100 text-blue-800'
                          : evt.badgeColor === 'violet'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {evt.badge}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-400">
                      📅 {evt.date}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{evt.details}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default ClinicalTimeline;
