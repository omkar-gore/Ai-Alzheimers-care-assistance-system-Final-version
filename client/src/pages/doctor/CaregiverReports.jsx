import React, { useState, useEffect } from 'react';
import axios from '../../services/axios';
import { useDoctor } from '../../context/DoctorContext';
import PatientContextHeader from '../../components/doctor/PatientContextHeader';
import {
  ClipboardList,
  Plus,
  FileText,
  ExternalLink,
  X,
  Loader2,
  Calendar,
} from 'lucide-react';

const CaregiverReports = () => {
  const { selectedPatientId, selectedPatient, patientData, refreshPatientData } = useDoctor();

  const [filter, setFilter] = useState('all');
  const [reportsList, setReportsList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Log Caregiver Observation Modal
  const [showLogModal, setShowLogModal] = useState(false);
  const [form, setForm] = useState({
    reportDate: new Date().toISOString().split('T')[0],
    mood: 'Good',
    sleep: 'Normal (7-8 hrs)',
    meals: 'Finished all meals',
    medicationAdherence: '100% Taken on time',
    behaviorObservations: '',
    dailyConcerns: '',
    additionalNotes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch reports when selectedPatientId or filter changes
  useEffect(() => {
    if (!selectedPatientId) return;
    const fetchReports = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `/doctor/patients/${selectedPatientId}/caregiver-reports?filter=${filter}`
        );
        setReportsList(res.data.caregiverReports || []);
      } catch (err) {
        console.error('Failed to load caregiver reports:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [selectedPatientId, filter]);

  // Log report
  const handleLogSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatientId) return;
    setSubmitting(true);
    try {
      await axios.post(`/doctor/patients/${selectedPatientId}/caregiver-reports`, form);
      refreshPatientData();
      setShowLogModal(false);
      // Refetch
      const res = await axios.get(
        `/doctor/patients/${selectedPatientId}/caregiver-reports?filter=${filter}`
      );
      setReportsList(res.data.caregiverReports || []);
      setForm({
        reportDate: new Date().toISOString().split('T')[0],
        mood: 'Good',
        sleep: 'Normal (7-8 hrs)',
        meals: 'Finished all meals',
        medicationAdherence: '100% Taken on time',
        behaviorObservations: '',
        dailyConcerns: '',
        additionalNotes: '',
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit caregiver report');
    } finally {
      setSubmitting(false);
    }
  };

  const medicalReports = patientData?.medicalReports || [];

  return (
    <div className="space-y-6">

      {/* PATIENT CONTEXT HEADER */}
      <PatientContextHeader
        title="Caregiver Daily Reports & Diagnostic Files"
        subtitle="Review mood, sleep, meals, behaviour observations, and medical files."
        actionButton={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowLogModal(true)}
              className="flex items-center gap-1.5 rounded-2xl bg-teal-600 px-4 py-2 text-xs font-black text-white hover:bg-teal-700 shadow-md transition"
            >
              <Plus size={15} />
              <span>Log Observation</span>
            </button>
          </div>
        }
      />

      {/* FILTER BAR & REPORTS LIST */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ClipboardList size={18} className="text-teal-600" />
            <h3 className="font-black text-sm uppercase tracking-wider text-slate-800">
              Caregiver Daily Log Records
            </h3>
          </div>

          <div className="flex items-center rounded-2xl bg-slate-100 p-1 text-xs font-bold">
            {['all', 'today', '7days', '30days'].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded-xl px-3 py-1.5 transition ${
                  filter === f
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {f === 'all'
                  ? 'All'
                  : f === 'today'
                  ? 'Today'
                  : f === '7days'
                  ? 'Last 7 Days'
                  : 'Last 30 Days'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <Loader2 size={24} className="animate-spin mx-auto text-teal-600 mb-2" />
            <p className="text-xs font-bold text-slate-500">Loading caregiver reports...</p>
          </div>
        ) : reportsList.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <ClipboardList size={36} className="mx-auto mb-2 opacity-30 text-teal-600" />
            <p className="text-sm font-bold text-slate-600">No caregiver reports available for selected period.</p>
            <p className="text-xs text-slate-400 mt-1">
              Caregiver daily updates will appear here when submitted.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reportsList.map((rep) => (
              <div key={rep._id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-slate-900">
                      📅 Report Date: {rep.reportDate}
                    </span>
                    <span className="rounded-md bg-teal-100 text-teal-800 text-[10px] font-extrabold uppercase px-2 py-0.5">
                      Caregiver: {rep.caregiver?.name || 'Primary Caregiver'}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">
                    Logged: {new Date(rep.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-100">
                    <span className="text-slate-400 font-bold block text-[10px]">Mood</span>
                    <span className="font-extrabold text-slate-800">{rep.mood}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-100">
                    <span className="text-slate-400 font-bold block text-[10px]">Sleep Quality</span>
                    <span className="font-extrabold text-slate-800">{rep.sleep}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-100">
                    <span className="text-slate-400 font-bold block text-[10px]">Meals</span>
                    <span className="font-extrabold text-slate-800">{rep.meals}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-100">
                    <span className="text-slate-400 font-bold block text-[10px]">Medication Adherence</span>
                    <span className="font-extrabold text-indigo-600">{rep.medicationAdherence}</span>
                  </div>
                </div>

                {rep.behaviorObservations && (
                  <div className="text-xs text-slate-700">
                    <strong className="text-slate-900">Behaviour Observation: </strong>
                    <span>{rep.behaviorObservations}</span>
                  </div>
                )}

                {rep.dailyConcerns && (
                  <div className="rounded-xl bg-amber-50 p-3 border border-amber-200 text-xs text-amber-900">
                    <strong className="font-black">Daily Concern Flagged: </strong>
                    <span>{rep.dailyConcerns}</span>
                  </div>
                )}

                {rep.additionalNotes && (
                  <p className="text-xs text-slate-500 italic">Notes: "{rep.additionalNotes}"</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* UPLOADED MEDICAL DIAGNOSTIC FILES */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h3 className="font-black text-sm uppercase tracking-wider text-slate-800 flex items-center gap-2">
          <FileText size={16} className="text-indigo-600" /> Uploaded Medical Files & Diagnostic Scans
        </h3>

        {medicalReports.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No diagnostic files uploaded for this patient.</p>
        ) : (
          <div className="space-y-3">
            {medicalReports.map((rep) => (
              <div key={rep._id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                    <FileText size={18} />
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-800">{rep.reportName}</p>
                    <p className="text-slate-400 text-[11px]">
                      Type: <strong className="text-indigo-600">{rep.reportType}</strong> • Uploaded: {new Date(rep.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {rep.fileUrl && (
                  <a
                    href={`http://localhost:5000${rep.fileUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 flex items-center gap-1 transition"
                  >
                    <span>View File</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* LOG CAREGIVER OBSERVATION MODAL */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ClipboardList size={18} className="text-teal-600" />
                <h3 className="font-black text-lg text-slate-800">Log Caregiver Daily Observation</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLogModal(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleLogSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                    Report Date
                  </label>
                  <input
                    type="date"
                    required
                    value={form.reportDate}
                    onChange={(e) => setForm({ ...form, reportDate: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                    Mood
                  </label>
                  <select
                    value={form.mood}
                    onChange={(e) => setForm({ ...form, mood: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-teal-600"
                  >
                    <option value="Good">Good</option>
                    <option value="Calm">Calm</option>
                    <option value="Cheerful">Cheerful</option>
                    <option value="Mildly Agitated">Mildly Agitated</option>
                    <option value="Confused">Confused</option>
                    <option value="Anxious">Anxious</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                    Sleep Quality
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Normal (7-8 hrs)"
                    value={form.sleep}
                    onChange={(e) => setForm({ ...form, sleep: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                    Meals & Appetite
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Finished all meals"
                    value={form.meals}
                    onChange={(e) => setForm({ ...form, meals: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                  Medication Adherence
                </label>
                <input
                  type="text"
                  placeholder="e.g. 100% Taken on time"
                  value={form.medicationAdherence}
                  onChange={(e) => setForm({ ...form, medicationAdherence: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                  Behaviour Observations
                </label>
                <textarea
                  rows={2}
                  placeholder="Observations about wandering, conversation, memory recall..."
                  value={form.behaviorObservations}
                  onChange={(e) => setForm({ ...form, behaviorObservations: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                  Daily Concerns (if any)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sundowning at 6 PM / Dizziness noticed"
                  value={form.dailyConcerns}
                  onChange={(e) => setForm({ ...form, dailyConcerns: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-teal-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-2xl bg-teal-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-teal-700 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Observation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CaregiverReports;
