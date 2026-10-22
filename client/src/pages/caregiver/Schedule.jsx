import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Clock,
  CalendarDays,
  Pencil,
  Trash2,
  X,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ClipboardList,
  Pill,
  Users,
  Check,
} from 'lucide-react';

import axios from '../../services/axios';
import { useAuth } from '../../context/AuthContext';
import AIChat from '../../components/AIChat';

function Schedule() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Active Tab: 'schedule' or 'medicines'
  const [activeTab, setActiveTab] = useState('schedule');

  // Patients list for caregiver
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');

  // Daily Schedule State
  const [schedule, setSchedule] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState(null);
  const [scheduleFormData, setScheduleFormData] = useState({
    time: '',
    activity: '',
    notes: '',
  });

  // Medicines State
  const [medicines, setMedicines] = useState([]);
  const [loadingMedicines, setLoadingMedicines] = useState(true);
  const [savingMedicine, setSavingMedicine] = useState(false);
  const [showMedicineForm, setShowMedicineForm] = useState(false);
  const [editingMedicineId, setEditingMedicineId] = useState(null);
  const [medicineFormData, setMedicineFormData] = useState({
    name: '',
    dosage: '',
    time: '',
    instructions: '',
    status: 'pending',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // =========================================================
  // LOAD CAREGIVER PATIENTS
  // =========================================================
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await axios.get('/caregiver/patients');
        const list = Array.isArray(res.data) ? res.data : [];
        setPatients(list);
        if (list.length > 0 && !selectedPatientId) {
          setSelectedPatientId(list[0]._id);
        }
      } catch (err) {
        console.error('Failed to load caregiver patients:', err);
      }
    };

    fetchPatients();
  }, []);

  // =========================================================
  // LOAD SCHEDULE & MEDICINES FOR SELECTED PATIENT
  // =========================================================
  const fetchScheduleAndMeds = async () => {
    try {
      setLoadingSchedule(true);
      setLoadingMedicines(true);
      setError('');

      const patientQuery = selectedPatientId ? `?patientId=${selectedPatientId}` : '';

      const [schedRes, medRes] = await Promise.allSettled([
        axios.get(`/caregiver/schedules${patientQuery}`),
        axios.get(`/caregiver/medicines${patientQuery}`),
      ]);

      if (schedRes.status === 'fulfilled') {
        setSchedule(Array.isArray(schedRes.value.data) ? schedRes.value.data : []);
      }
      if (medRes.status === 'fulfilled') {
        setMedicines(Array.isArray(medRes.value.data) ? medRes.value.data : []);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Unable to load patient schedule or medicines.');
    } finally {
      setLoadingSchedule(false);
      setLoadingMedicines(false);
    }
  };

  useEffect(() => {
    fetchScheduleAndMeds();
  }, [selectedPatientId]);

  // =========================================================
  // SCHEDULE CRUD
  // =========================================================
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!scheduleFormData.time || !scheduleFormData.activity.trim()) {
      setError('Please enter both time and activity for the schedule.');
      return;
    }

    try {
      setSavingSchedule(true);
      const payload = {
        time: scheduleFormData.time,
        activity: scheduleFormData.activity.trim(),
        notes: scheduleFormData.notes.trim(),
        patientId: selectedPatientId || undefined,
      };

      if (editingScheduleId) {
        const res = await axios.put(`/caregiver/schedules/${editingScheduleId}`, payload);
        setSchedule((prev) =>
          prev.map((item) => (item._id === editingScheduleId ? res.data : item))
        );
        setSuccess('Schedule updated successfully.');
      } else {
        const res = await axios.post('/caregiver/schedules', payload);
        setSchedule((prev) => [...prev, res.data]);
        setSuccess('Schedule added successfully.');
      }

      setScheduleFormData({ time: '', activity: '', notes: '' });
      setEditingScheduleId(null);
      setShowScheduleForm(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save schedule.');
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleEditSchedule = (item) => {
    setScheduleFormData({
      time: item.time,
      activity: item.activity,
      notes: item.notes || '',
    });
    setEditingScheduleId(item._id);
    setShowScheduleForm(true);
  };

  const handleDeleteSchedule = async (id) => {
    if (!window.confirm('Are you sure you want to delete this schedule item?')) return;
    try {
      await axios.delete(`/caregiver/schedules/${id}`);
      setSchedule((prev) => prev.filter((item) => item._id !== id));
      setSuccess('Schedule item deleted.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete schedule item.');
    }
  };

  // =========================================================
  // MEDICINE CRUD
  // =========================================================
  const handleMedicineSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!medicineFormData.name.trim() || !medicineFormData.dosage.trim() || !medicineFormData.time.trim()) {
      setError('Medicine name, dosage, and time are required.');
      return;
    }

    try {
      setSavingMedicine(true);
      const payload = {
        name: medicineFormData.name.trim(),
        dosage: medicineFormData.dosage.trim(),
        time: medicineFormData.time.trim(),
        instructions: medicineFormData.instructions.trim(),
        status: medicineFormData.status,
        patientId: selectedPatientId || undefined,
      };

      if (editingMedicineId) {
        const res = await axios.put(`/caregiver/medicines/${editingMedicineId}`, payload);
        setMedicines((prev) =>
          prev.map((item) => (item._id === editingMedicineId ? res.data : item))
        );
        setSuccess('Medicine updated successfully.');
      } else {
        const res = await axios.post('/caregiver/medicines', payload);
        setMedicines((prev) => [...prev, res.data]);
        setSuccess('Medicine scheduled successfully.');
      }

      setMedicineFormData({ name: '', dosage: '', time: '', instructions: '', status: 'pending' });
      setEditingMedicineId(null);
      setShowMedicineForm(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save medication.');
    } finally {
      setSavingMedicine(false);
    }
  };

  const handleEditMedicine = (med) => {
    setMedicineFormData({
      name: med.name,
      dosage: med.dosage,
      time: med.time,
      instructions: med.instructions || '',
      status: med.status || 'pending',
    });
    setEditingMedicineId(med._id);
    setShowMedicineForm(true);
  };

  const handleDeleteMedicine = async (id) => {
    if (!window.confirm('Are you sure you want to remove this medication?')) return;
    try {
      await axios.delete(`/caregiver/medicines/${id}`);
      setMedicines((prev) => prev.filter((item) => item._id !== id));
      setSuccess('Medication removed successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove medication.');
    }
  };

  const handleToggleMedicine = async (med) => {
    try {
      const res = await axios.patch(`/caregiver/medicines/${med._id}/toggle`);
      setMedicines((prev) =>
        prev.map((item) => (item._id === med._id ? res.data : item))
      );
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const currentPatient = patients.find((p) => p._id === selectedPatientId);

  return (
    <div className="min-h-screen bg-[#f3f9fb] text-slate-900 pb-16">
      
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-teal-100 bg-white/95 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/caregiver/dashboard')}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 transition hover:bg-teal-50 hover:text-teal-700"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-900">
                  Care Management
                </h1>
                <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-[10px] font-black uppercase text-teal-700">
                  Schedule & Medications
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Organize routines and medication plans for your loved one
              </p>
            </div>
          </div>

          {/* PATIENT SELECTOR */}
          {patients.length > 0 && (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1.5">
              <Users size={16} className="text-teal-600 shrink-0" />
              <span className="text-xs font-bold text-slate-500 hidden sm:inline">Patient:</span>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="bg-transparent text-xs font-black text-slate-800 outline-none cursor-pointer"
              >
                {patients.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} (Age {p.age})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">

        {/* FEEDBACK NOTICES */}
        {error && (
          <div className="flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-xs font-bold text-red-700 border border-red-200">
            <AlertCircle size={17} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-xs font-bold text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={17} className="shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* TAB SWITCHER & ACTION BUTTON */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-4 border border-slate-200 shadow-sm">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('schedule')}
              className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-extrabold transition ${
                activeTab === 'schedule'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-200'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <CalendarDays size={16} />
              <span>Daily Routine ({schedule.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('medicines')}
              className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-extrabold transition ${
                activeTab === 'medicines'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-200'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Pill size={16} />
              <span>Medications ({medicines.length})</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              if (activeTab === 'schedule') {
                setScheduleFormData({ time: '', activity: '', notes: '' });
                setEditingScheduleId(null);
                setShowScheduleForm(true);
              } else {
                setMedicineFormData({ name: '', dosage: '', time: '', instructions: '', status: 'pending' });
                setEditingMedicineId(null);
                setShowMedicineForm(true);
              }
            }}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 px-5 py-3 text-xs font-extrabold text-white shadow-md transition hover:from-teal-700 hover:to-cyan-700"
          >
            <Plus size={16} />
            <span>{activeTab === 'schedule' ? 'Add Schedule Activity' : 'Add Medication'}</span>
          </button>
        </div>

        {/* =====================================================
            VIEW 1: DAILY SCHEDULE
        ====================================================== */}
        {activeTab === 'schedule' && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <CalendarDays size={18} className="text-teal-600" />
                <span>Daily Schedule Timeline</span>
              </h2>
              <span className="text-xs font-semibold text-slate-400">
                Synchronized with Patient Dashboard
              </span>
            </div>

            {loadingSchedule ? (
              <div className="py-12 text-center text-slate-400">
                <Loader2 size={24} className="animate-spin mx-auto mb-2 text-teal-600" />
                <p className="text-xs font-bold">Loading schedule...</p>
              </div>
            ) : schedule.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <CalendarDays size={40} className="mx-auto mb-2 opacity-30 text-teal-600" />
                <p className="text-sm font-bold text-slate-700">No scheduled activities yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  Click "+ Add Schedule Activity" to define routine activities for {currentPatient?.name || 'the patient'}.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {schedule.map((item) => (
                  <div key={item._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 font-black text-xs">
                        <Clock size={17} />
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-xs text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                            {item.time}
                          </span>
                          <h3 className="font-extrabold text-sm text-slate-900">
                            {item.activity}
                          </h3>
                        </div>
                        {item.notes && (
                          <p className="text-xs text-slate-500 mt-1">{item.notes}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleEditSchedule(item)}
                        className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-teal-700 transition"
                        title="Edit schedule"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSchedule(item._id)}
                        className="rounded-xl p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                        title="Delete schedule"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =====================================================
            VIEW 2: MEDICINE MANAGEMENT
        ====================================================== */}
        {activeTab === 'medicines' && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Pill size={18} className="text-teal-600" />
                <span>Prescription & Medication Plan</span>
              </h2>
              <span className="text-xs font-semibold text-slate-400">
                Visible to {currentPatient?.name || 'Patient'} in real-time
              </span>
            </div>

            {loadingMedicines ? (
              <div className="py-12 text-center text-slate-400">
                <Loader2 size={24} className="animate-spin mx-auto mb-2 text-teal-600" />
                <p className="text-xs font-bold">Loading medications...</p>
              </div>
            ) : medicines.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Pill size={40} className="mx-auto mb-2 opacity-30 text-teal-600" />
                <p className="text-sm font-bold text-slate-700">No medications scheduled</p>
                <p className="text-xs text-slate-400 mt-1">
                  Add prescriptions with dosage, times, and instructions so the patient sees them on their dashboard.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {medicines.map((med) => {
                  const isDone = med.status === 'done';
                  return (
                    <div key={med._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-4">
                        <button
                          type="button"
                          onClick={() => handleToggleMedicine(med)}
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition ${
                            isDone
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-teal-400'
                          }`}
                          title={isDone ? 'Mark as Pending' : 'Mark as Done'}
                        >
                          {isDone ? <Check size={20} strokeWidth={3} /> : <Pill size={18} />}
                        </button>

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-sm text-slate-900">
                              {med.name}
                            </h3>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {isDone ? 'Taken' : 'Pending'}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-500 mt-1">
                            Dosage: <span className="text-slate-800">{med.dosage}</span> • Time:{' '}
                            <span className="text-teal-700 font-bold">{med.time}</span>
                          </p>
                          {med.instructions && (
                            <p className="text-xs text-slate-400 mt-0.5 italic">
                              Instructions: "{med.instructions}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleEditMedicine(med)}
                          className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-teal-700 transition"
                          title="Edit medication"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMedicine(med._id)}
                          className="rounded-xl p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                          title="Remove medication"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </main>

      {/* =====================================================
          MODAL 1: ADD / EDIT SCHEDULE ACTIVITY
      ====================================================== */}
      {showScheduleForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-lg text-slate-900">
                {editingScheduleId ? 'Edit Schedule Item' : 'Add Routine Activity'}
              </h3>
              <button
                type="button"
                onClick={() => setShowScheduleForm(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                  Time (e.g. 08:30 AM)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 09:00 AM"
                  value={scheduleFormData.time}
                  onChange={(e) => setScheduleFormData({ ...scheduleFormData, time: e.target.value })}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold outline-none focus:border-teal-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                  Activity
                </label>
                <input
                  type="text"
                  placeholder="e.g. Morning Breakfast & Memory Cards"
                  value={scheduleFormData.activity}
                  onChange={(e) => setScheduleFormData({ ...scheduleFormData, activity: e.target.value })}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold outline-none focus:border-teal-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Keep lighting gentle and room quiet"
                  value={scheduleFormData.notes}
                  onChange={(e) => setScheduleFormData({ ...scheduleFormData, notes: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold outline-none focus:border-teal-500 focus:bg-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleForm(false)}
                  className="rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSchedule}
                  className="flex items-center gap-2 rounded-2xl bg-teal-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-teal-700 disabled:opacity-50"
                >
                  {savingSchedule && <Loader2 size={14} className="animate-spin" />}
                  <span>Save Activity</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          MODAL 2: ADD / EDIT MEDICATION
      ====================================================== */}
      {showMedicineForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-lg text-slate-900">
                {editingMedicineId ? 'Edit Medication' : 'Add Medication'}
              </h3>
              <button
                type="button"
                onClick={() => setShowMedicineForm(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleMedicineSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                  Medicine Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Donepezil"
                  value={medicineFormData.name}
                  onChange={(e) => setMedicineFormData({ ...medicineFormData, name: e.target.value })}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold outline-none focus:border-teal-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                    Dosage
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 5 mg or 1 tablet"
                    value={medicineFormData.dosage}
                    onChange={(e) => setMedicineFormData({ ...medicineFormData, dosage: e.target.value })}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold outline-none focus:border-teal-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                    Time
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 09:00 AM"
                    value={medicineFormData.time}
                    onChange={(e) => setMedicineFormData({ ...medicineFormData, time: e.target.value })}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold outline-none focus:border-teal-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                  Instructions / Frequency
                </label>
                <input
                  type="text"
                  placeholder="e.g. Take after breakfast with water"
                  value={medicineFormData.instructions}
                  onChange={(e) => setMedicineFormData({ ...medicineFormData, instructions: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold outline-none focus:border-teal-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                  Status
                </label>
                <select
                  value={medicineFormData.status}
                  onChange={(e) => setMedicineFormData({ ...medicineFormData, status: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold outline-none focus:border-teal-500 focus:bg-white cursor-pointer"
                >
                  <option value="pending">Pending</option>
                  <option value="done">Done / Taken</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMedicineForm(false)}
                  className="rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingMedicine}
                  className="flex items-center gap-2 rounded-2xl bg-teal-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-teal-700 disabled:opacity-50"
                >
                  {savingMedicine && <Loader2 size={14} className="animate-spin" />}
                  <span>Save Medication</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Embedded Caregiver Assistant */}
      <AIChat
        patientId={selectedPatientId}
        patientName={currentPatient?.name}
      />

    </div>
  );
}

export default Schedule;