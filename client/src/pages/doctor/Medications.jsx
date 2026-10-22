import React, { useState } from 'react';
import axios from '../../services/axios';
import { useAuth } from '../../context/AuthContext';
import { useDoctor } from '../../context/DoctorContext';
import PatientContextHeader from '../../components/doctor/PatientContextHeader';
import {
  Pill,
  Plus,
  History,
  CheckCircle2,
  X,
  AlertCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';

const Medications = () => {
  const { user } = useAuth();
  const { selectedPatientId, selectedPatient, patientData, refreshPatientData } = useDoctor();

  // Prescribe Medication Modal
  const [showRxModal, setShowRxModal] = useState(false);
  const [rxForm, setRxForm] = useState({
    medicineName: '',
    dosage: '',
    frequency: 'Once daily',
    duration: '30 days',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    instructions: '',
    doctorNotes: '',
  });
  const [rxSubmitting, setRxSubmitting] = useState(false);
  const [rxMessage, setRxMessage] = useState({ type: '', text: '' });

  // 1. PRESCRIBE MEDICATION
  const handlePrescribeMedication = async (e) => {
    e.preventDefault();
    if (!rxForm.medicineName || !rxForm.dosage || !rxForm.frequency || !selectedPatientId) return;
    setRxSubmitting(true);
    setRxMessage({ type: '', text: '' });
    try {
      await axios.post(`/doctor/patients/${selectedPatientId}/prescriptions`, rxForm);
      setRxMessage({ type: 'success', text: `Prescription for ${rxForm.medicineName} added!` });
      refreshPatientData();
      setTimeout(() => {
        setShowRxModal(false);
        setRxMessage({ type: '', text: '' });
        setRxForm({
          medicineName: '',
          dosage: '',
          frequency: 'Once daily',
          duration: '30 days',
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          instructions: '',
          doctorNotes: '',
        });
      }, 1200);
    } catch (err) {
      setRxMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to prescribe medication.',
      });
    } finally {
      setRxSubmitting(false);
    }
  };

  // 2. UPDATE PRESCRIPTION STATUS
  const handleUpdatePrescriptionStatus = async (prescriptionId, status) => {
    try {
      await axios.put(`/doctor/prescriptions/${prescriptionId}`, { status });
      refreshPatientData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update prescription status');
    }
  };

  const activePrescriptions = patientData?.activePrescriptions || [];
  const prescriptionHistory = patientData?.prescriptionHistory || [];

  return (
    <div className="space-y-6">

      {/* PATIENT CONTEXT HEADER */}
      <PatientContextHeader
        title="Medication & Prescription Management"
        subtitle="Manage active drug regimens and track permanent dosage history."
        actionButton={
          <button
            type="button"
            onClick={() => setShowRxModal(true)}
            className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-xs font-black text-white shadow-md hover:bg-indigo-700 transition"
          >
            <Plus size={16} />
            <span>Prescribe Medication</span>
          </button>
        }
      />

      {/* ACTIVE MEDICATIONS */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-black text-sm uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" /> Current Active Medications
          </h3>
          <span className="text-xs font-bold text-slate-400">
            {activePrescriptions.length} Active Regimens
          </span>
        </div>

        {activePrescriptions.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <Pill size={36} className="mx-auto mb-2 opacity-30 text-indigo-600" />
            <p className="text-sm font-bold text-slate-600">No active medications recorded for this patient.</p>
            <p className="text-xs text-slate-400 mt-1">
              Click "Prescribe Medication" to add an active drug regimen.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {activePrescriptions.map((rx) => (
              <div key={rx._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-extrabold text-base text-slate-900">{rx.medicineName}</p>
                    <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2 py-0.5">
                      {rx.status}
                    </span>
                    <span className="rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5">
                      Started: {rx.startDate}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-600">
                    Dosage: <strong className="text-slate-900">{rx.dosage}</strong> • Frequency: <strong className="text-indigo-600">{rx.frequency}</strong> • Duration: {rx.duration || 'Ongoing'}
                  </p>
                  {rx.instructions && (
                    <p className="text-xs text-slate-500 italic">Instructions: "{rx.instructions}"</p>
                  )}
                  {rx.doctorNotes && (
                    <p className="text-xs text-indigo-900 font-medium">Doctor Notes: {rx.doctorNotes}</p>
                  )}
                  <p className="text-[11px] text-slate-400">
                    Prescribed by: Dr. {rx.doctor?.name || user.name}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleUpdatePrescriptionStatus(rx._id, 'Stopped')}
                    className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                  >
                    Stop Medicine
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdatePrescriptionStatus(rx._id, 'Completed')}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                  >
                    Mark Completed
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PERMANENT PRESCRIPTION AUDIT HISTORY */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-black text-sm uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <History size={16} className="text-slate-600" /> Permanent Prescription History & Audit Trail
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Prescriptions are never overwritten. Dose adjustments and stopped medicines remain visible chronologically.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400">
            {prescriptionHistory.length} Total Records
          </span>
        </div>

        {prescriptionHistory.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No prescription history recorded.</p>
        ) : (
          <div className="space-y-3">
            {prescriptionHistory.map((rx) => (
              <div key={rx._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-slate-900">{rx.medicineName}</span>
                    <span className="text-slate-600 font-bold">— {rx.dosage}</span>
                    <span className="text-slate-500">— {rx.frequency}</span>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      rx.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : rx.status === 'Stopped'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {rx.status}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Start Date: {rx.startDate} {rx.endDate && `• End Date: ${rx.endDate}`} • Doctor: Dr. {rx.doctor?.name || user.name}
                  </p>
                  {rx.instructions && (
                    <p className="text-slate-500 italic mt-0.5">Instructions: "{rx.instructions}"</p>
                  )}
                </div>

                {rx.doctorNotes && (
                  <p className="text-slate-600 italic max-w-xs sm:text-right bg-white p-2 rounded-xl border border-slate-100">
                    "{rx.doctorNotes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PRESCRIBE MEDICATION MODAL */}
      {showRxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Pill size={18} className="text-indigo-600" />
                <h3 className="font-black text-lg text-slate-800">Prescribe Medication</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRxModal(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePrescribeMedication} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                    Medicine Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Donepezil"
                    value={rxForm.medicineName}
                    onChange={(e) => setRxForm({ ...rxForm, medicineName: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                    Dosage *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5 mg"
                    value={rxForm.dosage}
                    onChange={(e) => setRxForm({ ...rxForm, dosage: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                    Frequency *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Once daily"
                    value={rxForm.frequency}
                    onChange={(e) => setRxForm({ ...rxForm, frequency: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 30 days"
                    value={rxForm.duration}
                    onChange={(e) => setRxForm({ ...rxForm, duration: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={rxForm.startDate}
                    onChange={(e) => setRxForm({ ...rxForm, startDate: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={rxForm.endDate}
                    onChange={(e) => setRxForm({ ...rxForm, endDate: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                  Patient & Caregiver Instructions
                </label>
                <input
                  type="text"
                  placeholder="e.g. Take after dinner with a glass of water."
                  value={rxForm.instructions}
                  onChange={(e) => setRxForm({ ...rxForm, instructions: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                  Doctor Clinical Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Clinical notes on tolerance, reason for dose, monitoring points..."
                  value={rxForm.doctorNotes}
                  onChange={(e) => setRxForm({ ...rxForm, doctorNotes: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-600"
                />
              </div>

              {rxMessage.text && (
                <div className={`p-3 rounded-xl text-xs font-bold ${
                  rxMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                }`}>
                  {rxMessage.text}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRxModal(false)}
                  className="rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rxSubmitting}
                  className="rounded-2xl bg-indigo-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {rxSubmitting ? 'Prescribing...' : 'Prescribe & Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Medications;
