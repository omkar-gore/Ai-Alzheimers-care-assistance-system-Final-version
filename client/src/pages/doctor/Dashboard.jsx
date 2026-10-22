import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDoctor } from '../../context/DoctorContext';
import PatientContextHeader from '../../components/doctor/PatientContextHeader';
import {
  Stethoscope,
  Users,
  Calendar,
  Pill,
  ClipboardList,
  CalendarDays,
  Brain,
  TrendingUp,
  History,
  FileText,
  Target,
  Clock,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  CalendarCheck,
  Activity,
  CheckCircle2,
  ChevronRight,
  Loader2,
} from 'lucide-react';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const {
    patients,
    selectedPatient,
    patientData,
    loadingPatients,
    loadingDetails,
    error,
  } = useDoctor();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">

      {/* HERO CLINICAL WELCOME */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-800 to-blue-700 p-6 sm:p-8 text-white shadow-xl shadow-indigo-100">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md mb-3">
              <Stethoscope size={14} /> Clinical Overview
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              Welcome back, Dr. {user?.name || 'Practitioner'}
            </h1>
            <p className="mt-2 text-sm text-indigo-100 max-w-xl">
              Access patient clinical management, monitor daily routine activities, prescribe medications, and inspect non-diagnostic cognitive screening observations.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-md border border-white/15">
              <p className="text-[11px] font-bold text-indigo-200">Panel Patients</p>
              <p className="text-2xl font-black mt-1">{patients.length}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-md border border-white/15">
              <p className="text-[11px] font-bold text-indigo-200">Active Prescriptions</p>
              <p className="text-2xl font-black mt-1">
                {patientData?.stats?.activeMedicationsCount ?? '0'}
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-md border border-white/15">
              <p className="text-[11px] font-bold text-indigo-200">Upcoming Visits</p>
              <p className="text-2xl font-black mt-1">
                {patientData?.stats?.upcomingAppointmentsCount ?? '0'}
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-md border border-white/15">
              <p className="text-[11px] font-bold text-indigo-200">Activity Trend</p>
              <p className="text-xl font-black mt-1 text-emerald-300">
                {patientData?.stats?.activityTrend || 'Stable'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ACTIVE PATIENT CONTEXT BANNER */}
      <PatientContextHeader
        title="Patient Clinical Overview"
        subtitle="Quick clinical indicators and navigational cards for the selected patient."
        actionButton={
          <Link
            to="/doctor/patients"
            className="flex items-center gap-1.5 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-black text-indigo-700 hover:bg-indigo-100 transition"
          >
            <Users size={14} />
            <span>Manage All Patients ({patients.length})</span>
          </Link>
        }
      />

      {loadingDetails ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-400 shadow-sm">
          <Loader2 size={32} className="animate-spin mx-auto mb-2 text-indigo-600" />
          <p className="text-sm font-bold text-slate-700">Loading patient clinical metrics...</p>
        </div>
      ) : patientData ? (
        <>
          {/* QUICK SUMMARY CARDS WITH NAV BUTTONS (PART 5) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* 1. APPOINTMENTS CARD */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Calendar size={18} />
                  </span>
                  <span className="text-xs font-black text-slate-400">
                    {patientData.stats?.upcomingAppointmentsCount || 0} Scheduled
                  </span>
                </div>
                <h4 className="font-black text-base text-slate-900 mt-3">Appointments</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Schedule consultations, record clinical observations, and follow-up directives.
                </p>
              </div>
              <Link
                to="/doctor/appointments"
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl bg-slate-50 hover:bg-indigo-50 text-xs font-bold text-slate-700 hover:text-indigo-700 transition"
              >
                <span>View Appointments</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {/* 2. MEDICATIONS & PRESCRIPTIONS CARD */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Pill size={18} />
                  </span>
                  <span className="text-xs font-black text-slate-400">
                    {patientData.stats?.activeMedicationsCount || 0} Active
                  </span>
                </div>
                <h4 className="font-black text-base text-slate-900 mt-3">Medications & Prescriptions</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Prescribe drugs, manage doses, and track permanent historical prescription audit trails.
                </p>
              </div>
              <Link
                to="/doctor/medications"
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl bg-slate-50 hover:bg-indigo-50 text-xs font-bold text-slate-700 hover:text-indigo-700 transition"
              >
                <span>View Medications</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {/* 3. CAREGIVER REPORTS CARD */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                    <ClipboardList size={18} />
                  </span>
                  <span className="text-xs font-black text-slate-400">
                    {patientData.stats?.caregiverReportsCount || 0} Logs
                  </span>
                </div>
                <h4 className="font-black text-base text-slate-900 mt-3">Caregiver Reports</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Daily mood, sleep, appetite, adherence observations, and uploaded medical scans.
                </p>
              </div>
              <Link
                to="/doctor/caregiver-reports"
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl bg-slate-50 hover:bg-indigo-50 text-xs font-bold text-slate-700 hover:text-indigo-700 transition"
              >
                <span>View Reports</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {/* 4. DAILY ACTIVITY REPORTS CARD */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <CalendarDays size={18} />
                  </span>
                  <span className="text-xs font-black text-slate-400">
                    {patientData.dailyReports?.length || 0} Recorded
                  </span>
                </div>
                <h4 className="font-black text-base text-slate-900 mt-3">Daily Activity Reports</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Composite evaluation (0–100) aggregating routine tasks, medicines, and caregiver updates.
                </p>
              </div>
              <Link
                to="/doctor/daily-reports"
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl bg-slate-50 hover:bg-indigo-50 text-xs font-bold text-slate-700 hover:text-indigo-700 transition"
              >
                <span>View Daily Reports</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {/* 5. COGNITIVE SCREENING CARD */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                    <Brain size={18} />
                  </span>
                  <span className="text-xs font-black text-slate-400">
                    {patientData.screenings?.length || 0} Screenings
                  </span>
                </div>
                <h4 className="font-black text-base text-slate-900 mt-3">Cognitive Screening</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Non-diagnostic early risk indicator scores, domain breakdowns, and attempt comparisons.
                </p>
              </div>
              <Link
                to="/doctor/cognitive-screening"
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl bg-slate-50 hover:bg-indigo-50 text-xs font-bold text-slate-700 hover:text-indigo-700 transition"
              >
                <span>View Screening History</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {/* 6. PROGRESS & IMPROVEMENT CARD */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <TrendingUp size={18} />
                  </span>
                  <span className="text-xs font-black text-emerald-600">
                    {patientData.stats?.activityTrend || 'Stable'}
                  </span>
                </div>
                <h4 className="font-black text-base text-slate-900 mt-3">Progress & Improvement</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Observed activity performance charts, cognitive screening trends, and consistency graphs.
                </p>
              </div>
              <Link
                to="/doctor/progress"
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl bg-slate-50 hover:bg-indigo-50 text-xs font-bold text-slate-700 hover:text-indigo-700 transition"
              >
                <span>View Trends & Charts</span>
                <ChevronRight size={14} />
              </Link>
            </div>

          </div>

          {/* STATUS SUMMARY BAR */}
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-indigo-900 flex items-center gap-2">
                <Activity size={15} /> Clinical Status Evaluation
              </h4>
              <span className="text-[10px] font-bold text-indigo-600">Real-time status</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              <div className="rounded-xl bg-white p-2.5 border border-indigo-100">
                <span className="text-slate-400 font-semibold block text-[10px]">Activity Status</span>
                <span className="font-extrabold text-slate-800">{patientData.statusSummary?.activity}</span>
              </div>
              <div className="rounded-xl bg-white p-2.5 border border-indigo-100">
                <span className="text-slate-400 font-semibold block text-[10px]">Medication Regimen</span>
                <span className="font-extrabold text-slate-800">{patientData.statusSummary?.medication}</span>
              </div>
              <div className="rounded-xl bg-white p-2.5 border border-indigo-100">
                <span className="text-slate-400 font-semibold block text-[10px]">Appointments</span>
                <span className="font-extrabold text-slate-800">{patientData.statusSummary?.appointments}</span>
              </div>
              <div className="rounded-xl bg-white p-2.5 border border-indigo-100">
                <span className="text-slate-400 font-semibold block text-[10px]">Recent Screening</span>
                <span className="font-extrabold text-slate-800">{patientData.statusSummary?.recentScreening}</span>
              </div>
              <div className="rounded-xl bg-white p-2.5 border border-indigo-100">
                <span className="text-slate-400 font-semibold block text-[10px]">Caregiver Reports</span>
                <span className="font-extrabold text-slate-800">{patientData.statusSummary?.caregiverReports}</span>
              </div>
            </div>
          </div>

          {/* ATTENTION ITEMS / ALERTS */}
          {patientData.alerts && patientData.alerts.length > 0 && (
            <div className="rounded-3xl border border-amber-200 bg-amber-50/70 p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-900">
                <AlertTriangle size={18} className="text-amber-600 shrink-0" />
                <h3 className="text-sm font-black uppercase tracking-wider">
                  Attention Required / Recent Observations
                </h3>
              </div>
              <div className="space-y-2">
                {patientData.alerts.map((alert, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 rounded-xl bg-white p-3 border border-amber-100 text-xs">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800 font-black text-[10px] mt-0.5">
                      !
                    </span>
                    <div>
                      <p className="font-extrabold text-slate-800">{alert.title}</p>
                      <p className="text-slate-600 mt-0.5">{alert.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* WEEKLY SUMMARY & CARE INSIGHTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* WEEKLY SUMMARY */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-700">
                  <CalendarCheck size={18} />
                  <h3 className="font-black text-sm uppercase tracking-wider text-slate-800">
                    Weekly Patient Summary (Last 7 Days)
                  </h3>
                </div>
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-black text-indigo-700">
                  Trend: {patientData.weeklySummary?.trend || 'Stable'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-slate-400 font-bold">Avg Daily Activity</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">
                    {patientData.weeklySummary?.avgDailyActivity || 75}
                    <span className="text-xs font-semibold text-slate-400">/100</span>
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-slate-400 font-bold">Medication Adherence</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">
                    {patientData.weeklySummary?.medicationAdherence || 100}%
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-slate-400 font-bold">Tasks Completion</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">
                    {patientData.weeklySummary?.taskCompletionRate || 0}%
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-slate-400 font-bold">Caregiver Logs</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">
                    {patientData.weeklySummary?.caregiverReportsCount || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* PATIENT CARE INSIGHTS */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-indigo-700">
                <Sparkles size={18} />
                <h3 className="font-black text-sm uppercase tracking-wider text-slate-800">
                  Patient Care Insights
                </h3>
              </div>

              <div className="space-y-2.5">
                {patientData.careInsights && patientData.careInsights.length > 0 ? (
                  patientData.careInsights.map((insight, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                      <span className="h-2 w-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      <span>{insight}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">Baseline care recording in progress.</p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                  Suggested Doctor Attention
                </p>
                <div className="space-y-2">
                  {patientData.suggestedDoctorAttention && patientData.suggestedDoctorAttention.length > 0 ? (
                    patientData.suggestedDoctorAttention.map((sug, idx) => (
                      <div key={idx} className="flex items-start gap-2 rounded-xl bg-indigo-50/70 p-2.5 text-xs text-indigo-900 font-semibold border border-indigo-100">
                        <ArrowRight size={14} className="text-indigo-600 shrink-0 mt-0.5" />
                        <span>{sug}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">No immediate clinical flags detected.</p>
                  )}
                </div>
              </div>
            </div>

          </div>
        </>
      ) : null}

    </div>
  );
};

export default DoctorDashboard;
