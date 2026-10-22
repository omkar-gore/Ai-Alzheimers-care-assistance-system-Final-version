import React from 'react';
import { useDoctor } from '../../context/DoctorContext';
import PatientContextHeader from '../../components/doctor/PatientContextHeader';
import {
  TrendingUp,
  Activity,
  Brain,
  CheckCheck,
  Shield,
} from 'lucide-react';

const Progress = () => {
  const { selectedPatient, patientData } = useDoctor();

  const dailyReports = patientData?.dailyReports || [];
  const screenings = patientData?.screenings || [];
  const weeklySummary = patientData?.weeklySummary || {};

  return (
    <div className="space-y-6">

      {/* PATIENT CONTEXT HEADER */}
      <PatientContextHeader
        title="Observed Performance Trends & Activity Tracking"
        subtitle="Longitudinal visual tracking of recorded routine activity scores and screening indicators."
      />

      {/* MANDATORY MEDICAL DISCLAIMER (PART 12) */}
      <div className="rounded-3xl border border-indigo-100 bg-white p-5 text-slate-600 text-xs flex items-start gap-3 shadow-xs">
        <Shield className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-extrabold text-slate-800 uppercase tracking-wide">
            Clinical Safety Notice:
          </p>
          <p className="mt-0.5">
            These trends represent recorded activity and screening performance and are not a clinical measure of disease progression. Variations over time reflect observed daily task adherence, routine participation, and educational assessment results.
          </p>
        </div>
      </div>

      {/* CHART 1: DAILY ACTIVITY TREND */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-sm uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Activity size={18} className="text-indigo-600" /> Daily Activity Trend (Composite Score 0–100)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Chronological score progression over recorded calendar days.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400">
            {dailyReports.length} Recorded Days
          </span>
        </div>

        {dailyReports.length === 0 ? (
          <p className="text-xs text-slate-400 py-10 text-center">No daily activity records to plot yet.</p>
        ) : (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 overflow-x-auto">
            <div className="min-w-[500px] h-52 flex items-end justify-between gap-3 px-4 pt-8 pb-3">
              {[...dailyReports].reverse().map((r, idx) => {
                const score = Number(r.overallActivityScore) || 0;
                const heightPct = Math.max(15, Math.min(100, score));
                return (
                  <div key={r._id || idx} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-xs font-black text-slate-700 group-hover:text-indigo-600 transition">
                      {score}
                    </span>
                    <div className="w-full max-w-[42px] bg-slate-200 rounded-t-xl h-36 flex items-end overflow-hidden group-hover:ring-2 group-hover:ring-indigo-400 transition">
                      <div
                        className={`w-full rounded-t-xl transition-all duration-500 ${
                          score >= 75 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-700 transition">
                      {r.date?.slice(5)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* CHARTS 2 & 3: COGNITIVE SCREENING TREND & ADHERENCE CONSISTENCY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* COGNITIVE PERFORMANCE TREND */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="font-black text-sm uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Brain size={18} className="text-indigo-600" /> Observed Cognitive Screening Performance
          </h3>

          {screenings.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No completed screenings to display.</p>
          ) : (
            <div className="space-y-3">
              {screenings.map((scr, idx) => (
                <div key={scr._id || idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="font-extrabold text-xs text-slate-900">
                      📅 {new Date(scr.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-[11px] text-slate-400">Risk Indication: {scr.riskIndicator}</p>
                  </div>
                  <span className="text-xl font-black text-indigo-600">
                    {scr.overallScore}/100
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MEDICATION & ROUTINE CONSISTENCY */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="font-black text-sm uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <CheckCheck size={18} className="text-emerald-600" /> Medication & Routine Consistency
          </h3>

          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex justify-between font-bold">
                <span>Medication Adherence (Past 7 Days)</span>
                <span className="text-indigo-600 font-extrabold">
                  {weeklySummary.medicationAdherence || 100}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${weeklySummary.medicationAdherence || 100}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex justify-between font-bold">
                <span>Daily Routine Tasks Completion</span>
                <span className="text-emerald-600 font-extrabold">
                  {weeklySummary.taskCompletionRate || 0}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${weeklySummary.taskCompletionRate || 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Progress;
