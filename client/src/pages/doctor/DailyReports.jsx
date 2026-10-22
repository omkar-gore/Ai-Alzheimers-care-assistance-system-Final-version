import React, { useState } from 'react';
import { useDoctor } from '../../context/DoctorContext';
import PatientContextHeader from '../../components/doctor/PatientContextHeader';
import {
  CalendarDays,
  ChevronRight,
  X,
  Target,
  Pill,
  Smile,
  Brain,
  ListChecks,
} from 'lucide-react';

const DailyReports = () => {
  const { selectedPatient, patientData } = useDoctor();

  const [selectedReport, setSelectedReport] = useState(null);

  const dailyReports = patientData?.dailyReports || [];

  return (
    <div className="space-y-6">

      {/* PATIENT CONTEXT HEADER */}
      <PatientContextHeader
        title="Daily Patient Activity Reports"
        subtitle="Rule-based aggregated daily reports evaluating tasks, medications, caregiver observations, and screening performance."
      />

      {/* DAILY REPORTS LIST */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-black text-sm uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <CalendarDays size={18} className="text-indigo-600" /> Recorded Daily Activity History
          </h3>
          <span className="text-xs font-bold text-slate-400">
            {dailyReports.length} Reports Logged
          </span>
        </div>

        {dailyReports.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <CalendarDays size={36} className="mx-auto mb-2 opacity-30 text-indigo-600" />
            <p className="text-sm font-bold text-slate-600">No daily activity reports available yet.</p>
            <p className="text-xs text-slate-400 mt-1">
              Daily reports are generated automatically from patient routine and caregiver logs.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {dailyReports.map((report) => {
              const score = report.overallActivityScore || 0;
              return (
                <div
                  key={report._id}
                  onClick={() => setSelectedReport(report)}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/30 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">{report.date}</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                        score >= 75
                          ? 'bg-emerald-100 text-emerald-800'
                          : score >= 50
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        Overall Activity: {score}/100
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-600">
                      <span>💊 Meds: {report.medicationAdherence}%</span>
                      <span>🎯 Tasks: {report.taskCompletion}% ({report.tasksCompleted}/{report.tasksAssigned})</span>
                      <span>😊 Mood: {report.mood || 'Not recorded'}</span>
                      {report.screeningScore && (
                        <span>🧠 Screening: {report.screeningScore}/100</span>
                      )}
                    </div>
                  </div>

                  <span className="text-xs font-bold text-indigo-600 flex items-center gap-1 self-start sm:self-center">
                    <span>View Breakdown</span>
                    <ChevronRight size={14} />
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* DETAIL MODAL FOR SELECTED DAILY REPORT */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CalendarDays size={18} className="text-indigo-600" />
                <h3 className="font-black text-lg text-slate-800">
                  Daily Activity Report: {selectedReport.date}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-indigo-900">Overall Activity Score</p>
                  <p className="text-3xl font-black text-indigo-700 mt-0.5">
                    {selectedReport.overallActivityScore}/100
                  </p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-indigo-700 shadow-xs">
                  Composite Evaluation
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <p className="font-black text-slate-800 flex items-center gap-1.5">
                    <Target size={14} className="text-indigo-600" /> Routine Care Tasks
                  </p>
                  <p className="text-slate-600">
                    Tasks Completed: {selectedReport.tasksCompleted} / {selectedReport.tasksAssigned} ({selectedReport.taskCompletion}%)
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <p className="font-black text-slate-800 flex items-center gap-1.5">
                    <Pill size={14} className="text-indigo-600" /> Medication Adherence
                  </p>
                  <p className="text-slate-600">
                    Adherence: {selectedReport.medicationAdherence}% ({selectedReport.medicinesTaken} / {selectedReport.medicinesTotal} logged)
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <p className="font-black text-slate-800 flex items-center gap-1.5">
                    <Smile size={14} className="text-indigo-600" /> Caregiver Daily Observation
                  </p>
                  <p className="text-slate-600">
                    Mood: {selectedReport.mood || 'Not recorded'} • Sleep: {selectedReport.sleep || 'Not recorded'}
                  </p>
                  {selectedReport.caregiverNotes && (
                    <p className="text-slate-500 italic mt-0.5">Notes: "{selectedReport.caregiverNotes}"</p>
                  )}
                </div>

                {selectedReport.screeningCompleted && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <p className="font-black text-slate-800 flex items-center gap-1.5">
                      <Brain size={14} className="text-indigo-600" /> Cognitive Screening Assessment
                    </p>
                    <p className="text-indigo-600 font-extrabold">
                      Screening Score: {selectedReport.screeningScore}/100
                    </p>
                  </div>
                )}

                {selectedReport.activityHighlights && selectedReport.activityHighlights.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                    <p className="font-black text-slate-800">Activity Highlights</p>
                    <ul className="list-disc pl-4 space-y-1 text-slate-600">
                      {selectedReport.activityHighlights.map((hl, i) => (
                        <li key={i}>{hl}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="rounded-2xl bg-indigo-600 px-5 py-2.5 text-xs font-extrabold text-white hover:bg-indigo-700 transition"
                >
                  Close Summary
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DailyReports;
