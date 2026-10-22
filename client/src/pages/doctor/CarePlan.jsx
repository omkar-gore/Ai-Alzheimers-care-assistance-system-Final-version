import React, { useState } from 'react';
import axios from '../../services/axios';
import { useDoctor } from '../../context/DoctorContext';
import PatientContextHeader from '../../components/doctor/PatientContextHeader';
import {
  Target,
  Plus,
  CheckCircle2,
  Clock,
  X,
  Award,
} from 'lucide-react';

const CarePlan = () => {
  const { selectedPatientId, selectedPatient, patientData, refreshPatientData } = useDoctor();

  // Add Goal Modal
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalForm, setGoalForm] = useState({
    goal: '',
    description: '',
    category: 'Cognitive Stimulation',
    startDate: new Date().toISOString().split('T')[0],
    targetDate: '',
  });
  const [goalSubmitting, setGoalSubmitting] = useState(false);

  const handleAddCareGoal = async (e) => {
    e.preventDefault();
    if (!goalForm.goal.trim() || !selectedPatientId) return;
    setGoalSubmitting(true);
    try {
      await axios.post(`/doctor/patients/${selectedPatientId}/care-plans`, goalForm);
      refreshPatientData();
      setShowGoalModal(false);
      setGoalForm({
        goal: '',
        description: '',
        category: 'Cognitive Stimulation',
        startDate: new Date().toISOString().split('T')[0],
        targetDate: '',
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create care goal');
    } finally {
      setGoalSubmitting(false);
    }
  };

  const handleUpdateCareGoal = async (planId, status) => {
    try {
      await axios.put(`/doctor/care-plans/${planId}`, { status });
      refreshPatientData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update care goal');
    }
  };

  const carePlans = patientData?.carePlans || [];
  const activeGoals = carePlans.filter((cp) => cp.status === 'Active');
  const completedGoals = carePlans.filter((cp) => cp.status === 'Completed');

  return (
    <div className="space-y-6">

      {/* PATIENT CONTEXT HEADER */}
      <PatientContextHeader
        title="Patient Care Plan & Routine Goals"
        subtitle="Align daily cognitive activities, medication adherence, and caregiver directives with care goals."
        actionButton={
          <button
            type="button"
            onClick={() => setShowGoalModal(true)}
            className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-2.5 text-xs font-black text-white shadow-md hover:bg-emerald-700 transition"
          >
            <Plus size={16} />
            <span>Add Care Goal</span>
          </button>
        }
      />

      {/* ACTIVE CARE GOALS */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-black text-sm uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Target size={18} className="text-emerald-600" /> Active Care Plan Goals
          </h3>
          <span className="text-xs font-bold text-slate-400">
            {activeGoals.length} Active Goals
          </span>
        </div>

        {activeGoals.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <Target size={36} className="mx-auto mb-2 opacity-30 text-emerald-600" />
            <p className="text-sm font-bold text-slate-600">No active care goals defined.</p>
            <p className="text-xs text-slate-400 mt-1">
              Click "Add Care Goal" to establish routine and cognitive milestones.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeGoals.map((plan) => (
              <div
                key={plan._id}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                      {plan.category}
                    </span>
                    <h4 className="font-black text-sm text-slate-900">{plan.goal}</h4>
                  </div>
                  {plan.description && (
                    <p className="text-xs text-slate-600">{plan.description}</p>
                  )}
                  <p className="text-[11px] text-slate-400 font-medium">
                    Started: {plan.startDate} {plan.targetDate && `• Target Date: ${plan.targetDate}`}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleUpdateCareGoal(plan._id, 'Completed')}
                  className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition self-start sm:self-center shrink-0"
                >
                  Mark Completed
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* COMPLETED CARE GOALS */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-black text-sm uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-slate-600" /> Completed Care Goals Archive
          </h3>
          <span className="text-xs font-bold text-slate-400">
            {completedGoals.length} Completed
          </span>
        </div>

        {completedGoals.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No completed care goals archived yet.</p>
        ) : (
          <div className="space-y-3">
            {completedGoals.map((plan) => (
              <div key={plan._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900">{plan.goal}</span>
                    <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Completed
                    </span>
                  </div>
                  {plan.description && <p className="text-slate-500 mt-0.5">{plan.description}</p>}
                </div>
                <span className="text-slate-400 text-[11px] shrink-0">{plan.targetDate}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ADD CARE GOAL MODAL */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Target size={18} className="text-emerald-600" />
                <h3 className="font-black text-lg text-slate-800">Add Care Plan Goal</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGoalModal(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddCareGoal} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                  Goal Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Complete 3 cognitive games daily"
                  value={goalForm.goal}
                  onChange={(e) => setGoalForm({ ...goalForm, goal: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={goalForm.category}
                  onChange={(e) => setGoalForm({ ...goalForm, category: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-emerald-600"
                >
                  <option value="Cognitive Stimulation">Cognitive Stimulation</option>
                  <option value="Medication Adherence">Medication Adherence</option>
                  <option value="Physical Routine">Physical Routine</option>
                  <option value="Routine & Sleep">Routine & Sleep</option>
                  <option value="Clinical Follow-up">Clinical Follow-up</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                  Description / Alignment
                </label>
                <textarea
                  rows={2}
                  placeholder="Detailed goal rationale for caregiver coordination..."
                  value={goalForm.description}
                  onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={goalForm.startDate}
                    onChange={(e) => setGoalForm({ ...goalForm, startDate: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={goalForm.targetDate}
                    onChange={(e) => setGoalForm({ ...goalForm, targetDate: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={goalSubmitting}
                  className="rounded-2xl bg-emerald-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-emerald-700 disabled:opacity-50"
                >
                  {goalSubmitting ? 'Saving...' : 'Add Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CarePlan;
