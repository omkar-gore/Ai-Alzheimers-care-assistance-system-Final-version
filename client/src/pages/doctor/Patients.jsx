import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDoctor } from '../../context/DoctorContext';
import {
  Users,
  Search,
  Plus,
  UserCheck,
  UserMinus,
  Phone,
  Mail,
  Pill,
  Target,
  ArrowRight,
  Loader2,
  X,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

const Patients = () => {
  const {
    patients,
    selectedPatientId,
    selectPatient,
    loadingPatients,
    assignPatient,
    unassignPatient,
  } = useDoctor();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignInput, setAssignInput] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState('');
  const [assignSuccess, setAssignSuccess] = useState('');

  const handleSelectPatient = (patientId) => {
    selectPatient(patientId);
  };

  const handleViewClinicalOverview = (patientId) => {
    selectPatient(patientId);
    navigate('/doctor/dashboard');
  };

  const handleUnassign = async (patientId, patientName) => {
    if (!window.confirm(`Are you sure you want to remove ${patientName} from your assigned clinical panel?`)) return;
    try {
      await unassignPatient(patientId);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to unassign patient');
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assignInput.trim()) return;

    setAssignLoading(true);
    setAssignError('');
    setAssignSuccess('');

    try {
      const isEmail = assignInput.includes('@');
      const payload = isEmail
        ? { patientEmail: assignInput.trim() }
        : { patientId: assignInput.trim() };

      const res = await assignPatient(payload);
      setAssignSuccess(res.message || 'Patient successfully assigned!');
      setAssignInput('');
      setTimeout(() => {
        setShowAssignModal(false);
        setAssignSuccess('');
      }, 1500);
    } catch (err) {
      setAssignError(err.response?.data?.message || 'Failed to assign patient. Please verify ID or email.');
    } finally {
      setAssignLoading(false);
    }
  };

  const filteredPatients = patients.filter((p) =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p._id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Users size={22} className="text-indigo-600" /> Assigned Patient Panel
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage your clinical panel. Select a patient to view and track their appointments, medications, and caregiver reports.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAssignModal(true)}
          className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-xs font-black text-white shadow-md hover:bg-indigo-700 self-start sm:self-auto transition"
        >
          <Plus size={16} />
          <span>Assign New Patient</span>
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search assigned patients by name, email, or MongoDB ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-xs font-semibold text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 shadow-sm"
        />
      </div>

      {/* PATIENTS ROSTER */}
      {loadingPatients ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center text-slate-400 shadow-sm">
          <Loader2 size={32} className="animate-spin mx-auto mb-2 text-indigo-600" />
          <p className="text-sm font-bold text-slate-700">Loading patient panel...</p>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center text-slate-400 shadow-sm space-y-3">
          <Users size={48} className="mx-auto opacity-30 text-indigo-600" />
          <h3 className="text-lg font-black text-slate-700">No Patients Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? 'No patients match your search query.'
              : 'You do not have any patients assigned to your clinical panel yet.'}
          </p>
          <button
            type="button"
            onClick={() => setShowAssignModal(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-xs font-black text-white hover:bg-indigo-700"
          >
            <Plus size={15} />
            <span>Assign First Patient</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPatients.map((patient) => {
            const isSelected = patient._id === selectedPatientId;
            return (
              <div
                key={patient._id}
                className={`rounded-3xl border p-6 transition flex flex-col justify-between gap-4 ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20 shadow-md'
                    : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl font-black text-xl shadow-sm ${
                          isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {patient.name?.charAt(0)?.toUpperCase() || 'P'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-base text-slate-900 truncate">
                            {patient.name}
                          </h3>
                          {isSelected && (
                            <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[9px] font-black uppercase text-white">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-slate-500">
                          Age {patient.age || 'N/A'} • Gender: {patient.gender || 'Not specified'}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          ID: {patient._id}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleUnassign(patient._id, patient.name)}
                      className="rounded-xl border border-rose-200 bg-rose-50 p-2 text-rose-600 hover:bg-rose-100 transition shrink-0"
                      title="Unassign patient from your panel"
                    >
                      <UserMinus size={15} />
                    </button>
                  </div>

                  {/* CONTACT INFO & CAREGIVER */}
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                    <div className="flex flex-wrap items-center gap-3">
                      {patient.phone && (
                        <span className="flex items-center gap-1 text-[11px]">
                          <Phone size={12} className="text-slate-400" /> {patient.phone}
                        </span>
                      )}
                      {patient.email && (
                        <span className="flex items-center gap-1 text-[11px]">
                          <Mail size={12} className="text-slate-400" /> {patient.email}
                        </span>
                      )}
                    </div>

                    {patient.profile?.caregiver && (
                      <p className="text-[11px] text-teal-800 font-semibold bg-teal-50 px-2.5 py-1 rounded-xl border border-teal-100 inline-block">
                        Caregiver: {patient.profile.caregiver.name} ({patient.profile.caregiver.phone || 'Contact'})
                      </p>
                    )}
                  </div>

                  {/* METRIC BADGES */}
                  <div className="flex items-center gap-2 mt-3">
                    <span className="flex items-center gap-1 rounded-xl bg-slate-50 border border-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700">
                      <Pill size={12} className="text-indigo-600" />
                      {patient.activeMedsCount || 0} Medications
                    </span>
                    <span className="flex items-center gap-1 rounded-xl bg-slate-50 border border-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700">
                      <Target size={12} className="text-amber-600" />
                      {patient.pendingTasksCount || 0} Pending Tasks
                    </span>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectPatient(patient._id)}
                    className={`flex-1 rounded-2xl py-2 px-3 text-xs font-extrabold transition ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected ? '✓ Selected as Active' : 'Select Patient'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleViewClinicalOverview(patient._id)}
                    className="flex items-center gap-1 rounded-2xl border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-black text-indigo-700 hover:bg-indigo-100 transition"
                  >
                    <span>Overview</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ASSIGN PATIENT MODAL */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-indigo-600" />
                <h3 className="font-black text-lg text-slate-800">Assign New Patient</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="mt-4 space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Enter the registered Patient's Email address or 24-character MongoDB User ID to add them to your clinical panel.
              </p>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                  Patient Email or User ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. patienta@demo.com"
                  value={assignInput}
                  onChange={(e) => setAssignInput(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {assignError && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-600">
                  <AlertCircle size={15} />
                  <span>{assignError}</span>
                </div>
              )}

              {assignSuccess && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-600">
                  <CheckCircle2 size={15} />
                  <span>{assignSuccess}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignLoading || !assignInput.trim()}
                  className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {assignLoading && <Loader2 size={14} className="animate-spin" />}
                  <span>Assign to Panel</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Patients;
