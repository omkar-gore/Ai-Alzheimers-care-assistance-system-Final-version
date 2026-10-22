import React, { useMemo, useState } from 'react';
import { Activity, CheckCircle2, Clock3, Dumbbell, HeartPulse, Play, RotateCcw, Wind } from 'lucide-react';
import PatientLayout from './PatientLayout';

const exercises = [
  { id: 1, title: 'Gentle Walking', duration: '10–15 min', level: 'Easy', icon: Activity, description: 'A comfortable walking session at your own pace.', tip: 'Keep your posture relaxed and choose a safe, familiar place.' },
  { id: 2, title: 'Neck & Shoulder Stretch', duration: '5 min', level: 'Easy', icon: Wind, description: 'Slow stretches for the neck and shoulder area.', tip: 'Move gently and stop if a movement feels uncomfortable.' },
  { id: 3, title: 'Arm Movement', duration: '5–8 min', level: 'Easy', icon: Dumbbell, description: 'Simple arm movements to add gentle activity to your day.', tip: 'Keep movements controlled and comfortable.' },
  { id: 4, title: 'Seated Leg Movement', duration: '5–8 min', level: 'Easy', icon: HeartPulse, description: 'Simple seated movements for a short activity break.', tip: 'Use a stable chair and keep both feet supported when needed.' },
];

const Exercise = () => {
  const [completed, setCompleted] = useState(() => {
    try { return JSON.parse(localStorage.getItem('caremate-exercises') || '[]'); } catch { return []; }
  });
  const [activeId, setActiveId] = useState(null);

  const completedCount = completed.length;
  const progress = useMemo(() => Math.round((completedCount / exercises.length) * 100), [completedCount]);

  const toggleComplete = (id) => {
    const next = completed.includes(id) ? completed.filter((item) => item !== id) : [...completed, id];
    setCompleted(next);
    localStorage.setItem('caremate-exercises', JSON.stringify(next));
    setActiveId(null);
  };

  const reset = () => {
    setCompleted([]);
    localStorage.removeItem('caremate-exercises');
  };

  return (
    <PatientLayout title="Exercise" subtitle="Choose a gentle activity and build movement into your day.">
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0e3966] via-[#1267b8] to-[#16a98c] p-6 text-white shadow-xl shadow-blue-200/50 sm:p-8">
          <div className="absolute -right-14 -top-20 h-60 w-60 rounded-full bg-white/10" />
          <div className="relative z-10 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10"><Dumbbell size={24} /></div>
              <p className="text-xs font-black uppercase tracking-[1.5px] text-white/65">Daily movement</p>
              <h2 className="mt-1 text-3xl font-black tracking-tight">Move at your own pace.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80">Pick one activity that feels comfortable today. You can mark it complete when you finish.</p>
            </div>
            <div className="min-w-[170px] rounded-2xl bg-white/10 p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between"><span className="text-xs font-bold text-white/70">Today</span><span className="text-sm font-black">{progress}%</span></div>
              <div className="mt-3 h-2.5 rounded-full bg-white/15"><div className="h-full rounded-full bg-white transition-all" style={{ width: `${progress}%` }} /></div>
              <p className="mt-2 text-[10px] font-semibold text-white/60">{completedCount} of {exercises.length} activities</p>
            </div>
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h3 className="text-xl font-black text-slate-800">Suggested activities</h3><p className="mt-1 text-xs text-slate-500">Keep it comfortable and stop if something does not feel right.</p></div>
          {completedCount > 0 && <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-500 hover:bg-slate-50"><RotateCcw size={14} /> Reset today</button>}
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {exercises.map(({ id, title, duration, level, icon: Icon, description, tip }) => {
            const done = completed.includes(id);
            const active = activeId === id;
            return (
              <article key={id} className={`rounded-[24px] border bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-6 ${done ? 'border-emerald-200' : 'border-blue-100'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${done ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}><Icon size={22} /></div>
                  {done ? <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-black uppercase text-emerald-600"><CheckCircle2 size={13} /> Completed</span> : <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-black uppercase text-slate-500">{level}</span>}
                </div>
                <h4 className="mt-5 text-lg font-black text-slate-800">{title}</h4>
                <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
                <div className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-400"><Clock3 size={14} /> {duration}</div>
                {active && <div className="mt-4 rounded-2xl bg-blue-50 p-4 text-xs font-semibold leading-5 text-blue-700"><strong>Helpful tip:</strong> {tip}</div>}
                <div className="mt-5 flex gap-2">
                  <button type="button" onClick={() => setActiveId(active ? null : id)} className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-extrabold text-slate-600 hover:bg-slate-50">{active ? 'Hide tip' : 'View tip'}</button>
                  <button type="button" onClick={() => toggleComplete(id)} className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold text-white shadow-sm ${done ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                    {done ? <><CheckCircle2 size={15} /> Done</> : <><Play size={14} /> Mark done</>}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-xs leading-5 text-amber-800">
          <strong>Safety reminder:</strong> Choose activities that are appropriate for your comfort and ability. If you have been given specific exercise instructions by a healthcare professional, follow those instructions.
        </div>
      </div>
    </PatientLayout>
  );
};

export default Exercise;
