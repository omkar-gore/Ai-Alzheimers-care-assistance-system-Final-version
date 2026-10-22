import React, { useMemo, useState } from 'react';
import { CalendarDays, ChevronRight, Droplets, Info, RotateCcw } from 'lucide-react';
import PatientLayout from './PatientLayout';

const toLocalDate = (value) => {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const formatDate = (date) => date?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

const PeriodTracker = () => {
  const [lastPeriod, setLastPeriod] = useState('');
  const [cycleLength, setCycleLength] = useState(28);
  const [duration, setDuration] = useState(5);

  const nextPeriod = useMemo(() => {
    const date = toLocalDate(lastPeriod);
    if (!date || !Number.isFinite(cycleLength)) return null;
    const next = new Date(date);
    next.setDate(next.getDate() + Number(cycleLength));
    return next;
  }, [lastPeriod, cycleLength]);

  const estimatedEnd = useMemo(() => {
    if (!nextPeriod || !Number.isFinite(duration)) return null;
    const end = new Date(nextPeriod);
    end.setDate(end.getDate() + Math.max(Number(duration) - 1, 0));
    return end;
  }, [nextPeriod, duration]);

  const reset = () => {
    setLastPeriod('');
    setCycleLength(28);
    setDuration(5);
  };

  return (
    <PatientLayout title="Period Tracker" subtitle="Record your dates and view a simple cycle estimate.">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#1976f3] to-[#16a98c] p-6 text-white shadow-xl shadow-blue-200/50 sm:p-8">
          <div className="absolute -right-16 -top-20 h-60 w-60 rounded-full bg-white/10" />
          <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10"><Droplets size={24} /></div>
              <p className="text-xs font-black uppercase tracking-[1.5px] text-white/65">Personal tracking</p>
              <h2 className="mt-1 text-3xl font-black tracking-tight">Know your dates at a glance.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80">Enter your recent period date and cycle details to get a basic calendar estimate.</p>
            </div>
            <CalendarDays size={72} className="hidden text-white/15 md:block" />
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <section className="rounded-[26px] border border-blue-100 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6"><p className="text-xs font-black uppercase tracking-[1.3px] text-blue-600">Cycle details</p><h3 className="mt-1 text-xl font-black text-slate-800">Enter your information</h3></div>
            <div className="space-y-5">
              <Field label="Last period date"><input type="date" value={lastPeriod} onChange={(e) => setLastPeriod(e.target.value)} className="input" /></Field>
              <Field label="Cycle length (days)" hint="Common default: 28 days"><input type="number" min="20" max="45" value={cycleLength} onChange={(e) => setCycleLength(Number(e.target.value))} className="input" /></Field>
              <Field label="Period duration (days)"><input type="number" min="1" max="10" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="input" /></Field>
              <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-extrabold text-slate-500 hover:bg-slate-50"><RotateCcw size={14} /> Reset</button>
            </div>
          </section>

          <section className="rounded-[26px] border border-blue-100 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600"><CalendarDays size={21} /></span><div><p className="text-xs font-black uppercase tracking-[1.3px] text-cyan-600">Estimate</p><h3 className="mt-1 text-xl font-black text-slate-800">Your next date</h3></div></div>
            {nextPeriod ? (
              <>
                <div className="rounded-[22px] bg-gradient-to-br from-blue-50 to-cyan-50 p-6">
                  <p className="text-xs font-bold text-slate-500">Next expected period</p>
                  <p className="mt-2 text-2xl font-black text-blue-700">{formatDate(nextPeriod)}</p>
                  {estimatedEnd && <p className="mt-2 text-xs font-semibold text-slate-500">Estimated end: {formatDate(estimatedEnd)}</p>}
                </div>
                <div className="mt-4 flex items-start gap-3 rounded-2xl border border-blue-100 bg-white p-4"><Info size={17} className="mt-0.5 shrink-0 text-blue-500" /><p className="text-xs leading-5 text-slate-500">This is a calendar estimate based only on the information you entered. Cycles can vary.</p></div>
              </>
            ) : (
              <div className="flex min-h-52 flex-col items-center justify-center rounded-[22px] border border-dashed border-slate-200 bg-slate-50 p-6 text-center"><CalendarDays size={32} className="text-slate-300" /><p className="mt-3 text-sm font-extrabold text-slate-600">Add your last period date</p><p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">Your estimate will appear here after you enter a date.</p></div>
            )}
          </section>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-xs leading-5 text-amber-800">
          <strong>Important:</strong> This tracker is for general tracking only and does not replace medical advice. If your periods are unusually painful, very heavy, irregular, or concerning to you, speak with a qualified healthcare professional.
        </div>
      </div>
      <style>{`.input{width:100%;border-radius:1rem;border:1px solid #e2e8f0;background:#f8fafc;padding:.85rem 1rem;font-size:.875rem;font-weight:600;color:#334155;outline:none;transition:.2s}.input:hover{border-color:#bfdbfe;background:#fff}.input:focus{border-color:#60a5fa;background:#fff;box-shadow:0 0 0 4px #dbeafe}.input::-webkit-calendar-picker-indicator{cursor:pointer}`}</style>
    </PatientLayout>
  );
};

const Field = ({ label, hint, children }) => <div><div className="mb-2 flex items-center justify-between gap-3"><label className="text-sm font-extrabold text-slate-700">{label}</label>{hint && <span className="text-[10px] font-semibold text-slate-400">{hint}</span>}</div>{children}</div>;

export default PeriodTracker;
