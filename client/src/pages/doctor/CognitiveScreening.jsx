import React from 'react';
import { useDoctor } from '../../context/DoctorContext';
import PatientContextHeader from '../../components/doctor/PatientContextHeader';
import {
  Brain,
  Shield,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const CognitiveScreening = () => {
  const { selectedPatient, patientData } = useDoctor();

  const screenings = patientData?.screenings || [];
  const comparison = patientData?.screeningComparison || null;

  return (
    <div className="space-y-6">

      {/* PATIENT CONTEXT HEADER */}
      <PatientContextHeader
        title="Early Cognitive Screening History & Domain Breakdown"
        subtitle="Historical non-diagnostic cognitive screening performance records and domain changes."
      />

      {/* MANDATORY EDUCATIONAL & MEDICAL DISCLAIMER (PARTS 11 & 18) */}
      <div className="rounded-3xl border border-amber-200 bg-amber-50/80 p-5 text-amber-950 text-xs flex items-start gap-3 shadow-xs">
        <Shield className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-extrabold uppercase tracking-wide">
            Important Clinical Interpretation Notice:
          </p>
          <p className="leading-relaxed">
            This screening is not a medical diagnosis. It only identifies cognitive patterns that may warrant further evaluation by a qualified healthcare professional. Changes between assessments may reflect fatigue, stress, mood, or practice effects and do not represent a clinical measure of disease progression.
          </p>
        </div>
      </div>

      {/* COMPARISON WITH PREVIOUS SCREENING (IF > 1 SCREENING RECORD) */}
      {comparison && (
        <div className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-black text-sm uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <TrendingUp size={16} className="text-indigo-600" /> Assessment Comparison (Latest vs Previous)
            </h3>
            <span className="text-xs font-bold text-slate-400">
              Evaluated Across Consecutive Sessions
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 font-bold block">Latest Overall Score</span>
              <span className="text-2xl font-black text-indigo-600">
                {comparison.latestScore}/100
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block">Previous Overall Score</span>
              <span className="text-2xl font-black text-slate-700">
                {comparison.previousScore}/100
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block">Observed Score Variation</span>
              <span className={`text-2xl font-black ${
                comparison.overallChange > 0
                  ? 'text-emerald-600'
                  : comparison.overallChange < 0
                  ? 'text-amber-600'
                  : 'text-slate-600'
              }`}>
                {comparison.formattedOverallChange}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block">Current Risk Indication</span>
              <span className="text-xs font-black text-slate-800 mt-1 block">
                {comparison.latestRisk}
              </span>
            </div>
          </div>

          {/* DOMAIN COMPARISON DELTAS */}
          {comparison.domainComparisons && comparison.domainComparisons.length > 0 && (
            <div className="pt-2">
              <p className="text-xs font-bold text-slate-500 mb-2">Domain-by-Domain Variations:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {comparison.domainComparisons.map((dom, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white border border-slate-100 text-xs flex justify-between items-center shadow-2xs">
                    <span className="text-slate-600 font-medium">{dom.name}</span>
                    <span className={`font-black ${
                      dom.diff > 0 ? 'text-emerald-600' : dom.diff < 0 ? 'text-amber-600' : 'text-slate-400'
                    }`}>
                      {dom.formattedDiff}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CHRONOLOGICAL SCREENINGS LIST */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-black text-sm uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Brain size={18} className="text-indigo-600" /> Completed Cognitive Assessments
          </h3>
          <span className="text-xs font-bold text-slate-400">
            {screenings.length} Total Assessments
          </span>
        </div>

        {screenings.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <Brain size={36} className="mx-auto mb-2 opacity-30 text-indigo-600" />
            <p className="text-sm font-bold text-slate-600">No cognitive screening results available.</p>
            <p className="text-xs text-slate-400 mt-1">
              Screening records will appear here when the authenticated patient completes early cognitive screenings.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {screenings.map((scr) => (
              <div key={scr._id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                  <div>
                    <span className="font-black text-base text-slate-900">
                      Assessment Date: {new Date(scr.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-slate-500 ml-2">
                      Score: <strong className="text-indigo-600 font-extrabold">{scr.overallScore}/100</strong>
                    </span>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-black uppercase ${
                    scr.overallScore >= 75
                      ? 'bg-emerald-100 text-emerald-800'
                      : scr.overallScore >= 50
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {scr.riskIndicator}
                  </span>
                </div>

                {/* 8 DOMAIN SCORES */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-100">
                    <span className="text-slate-400 font-bold block text-[10px]">Memory</span>
                    <span className="font-black text-slate-800">{scr.memoryScore}%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-100">
                    <span className="text-slate-400 font-bold block text-[10px]">Delayed Recall</span>
                    <span className="font-black text-slate-800">{scr.delayedRecallScore}%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-100">
                    <span className="text-slate-400 font-bold block text-[10px]">Attention / Focus</span>
                    <span className="font-black text-slate-800">{scr.attentionScore}%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-100">
                    <span className="text-slate-400 font-bold block text-[10px]">Orientation</span>
                    <span className="font-black text-slate-800">{scr.orientationScore}%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-100">
                    <span className="text-slate-400 font-bold block text-[10px]">Language</span>
                    <span className="font-black text-slate-800">{scr.languageScore}%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-100">
                    <span className="text-slate-400 font-bold block text-[10px]">Reasoning</span>
                    <span className="font-black text-slate-800">{scr.reasoningScore}%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-100">
                    <span className="text-slate-400 font-bold block text-[10px]">Working Memory</span>
                    <span className="font-black text-slate-800">{scr.workingMemoryScore}%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-100">
                    <span className="text-slate-400 font-bold block text-[10px]">Daily Life Tasks</span>
                    <span className="font-black text-slate-800">{scr.dailyLifeScore}%</span>
                  </div>
                </div>

                {scr.strengths && scr.strengths.length > 0 && (
                  <p className="text-[11px] text-emerald-800 font-medium">
                    Notable Domain Strengths: {scr.strengths.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default CognitiveScreening;
