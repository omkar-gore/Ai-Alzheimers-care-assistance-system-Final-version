import React, { useState } from 'react';
import axios from '../../services/axios';
import { useAuth } from '../../context/AuthContext';
import { useDoctor } from '../../context/DoctorContext';
import PatientContextHeader from '../../components/doctor/PatientContextHeader';
import {
  FileText,
  Plus,
  X,
  Search,
  Filter,
} from 'lucide-react';

const DoctorNotes = () => {
  const { user } = useAuth();
  const { selectedPatientId, selectedPatient, patientData, refreshPatientData } = useDoctor();

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Note Modal
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [form, setForm] = useState({
    category: 'General Observation',
    note: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!form.note.trim() || !selectedPatientId) return;
    setSubmitting(true);
    try {
      await axios.post(`/doctor/patients/${selectedPatientId}/notes`, form);
      refreshPatientData();
      setShowNoteModal(false);
      setForm({ category: 'General Observation', note: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record clinical note');
    } finally {
      setSubmitting(false);
    }
  };

  const notesList = patientData?.doctorNotes || [];

  const filteredNotes = notesList.filter((n) => {
    const matchesCategory = categoryFilter === 'All' || n.category === categoryFilter;
    const matchesSearch = n.note?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">

      {/* PATIENT CONTEXT HEADER */}
      <PatientContextHeader
        title="Doctor Clinical Notes & Observations"
        subtitle="Permanent categorized clinical observations, impressions, and follow-up directives."
        actionButton={
          <button
            type="button"
            onClick={() => setShowNoteModal(true)}
            className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-xs font-black text-white shadow-md hover:bg-indigo-700 transition"
          >
            <Plus size={16} />
            <span>Add Clinical Note</span>
          </button>
        }
      />

      {/* SEARCH & CATEGORY FILTER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-slate-100 p-1 text-xs font-bold">
          {['All', 'General Observation', 'Cognitive Observation', 'Medication', 'Behaviour', 'Follow-up'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-xl px-3 py-1.5 transition ${
                categoryFilter === cat ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative sm:w-64">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 shadow-2xs"
          />
        </div>
      </div>

      {/* NOTES LIST */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-black text-sm uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <FileText size={16} className="text-indigo-600" /> Recorded Clinical Observations
          </h3>
          <span className="text-xs font-bold text-slate-400">
            {filteredNotes.length} of {notesList.length} Notes
          </span>
        </div>

        {filteredNotes.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <FileText size={36} className="mx-auto mb-2 opacity-30 text-indigo-600" />
            <p className="text-sm font-bold text-slate-600">No clinical notes recorded yet.</p>
            <p className="text-xs text-slate-400 mt-1">
              Click "Add Clinical Note" above to document your observations for this patient.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotes.map((note) => (
              <div key={note._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-black uppercase px-2 py-0.5">
                      {note.category}
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      Dr. {note.doctor?.name || user.name}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">
                    {new Date(note.date).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-800 leading-relaxed">{note.note}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ADD DOCTOR NOTE MODAL */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-indigo-600" />
                <h3 className="font-black text-lg text-slate-800">Add Clinical Note</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNoteModal(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddNote} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-600"
                >
                  <option value="General Observation">General Observation</option>
                  <option value="Cognitive Observation">Cognitive Observation</option>
                  <option value="Medication">Medication</option>
                  <option value="Behaviour">Behaviour</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                  Observation Note *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Record clinical impressions, cognitive status, or advice for this patient..."
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-2xl bg-indigo-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submitting ? 'Recording...' : 'Save Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default DoctorNotes;
