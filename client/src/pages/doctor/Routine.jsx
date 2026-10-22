import React from 'react';
import { useDoctor } from '../../context/DoctorContext';
import PatientContextHeader from '../../components/doctor/PatientContextHeader';
import {
  Clock,
  Target,
  Heart,
  CalendarDays,
  CheckCircle2,
} from 'lucide-react';

const Routine = () => {
  const { selectedPatient, patientData } = useDoctor();

  const schedules = patientData?.schedules || [];
  const tasks = patientData?.tasks || [];
  const memories = patientData?.memories || [];

  return (
    <div className="space-y-6">

      {/* PATIENT CONTEXT HEADER */}
      <PatientContextHeader
        title="Patient Daily Routine, Care Tasks & Memory Book"
        subtitle="Review scheduled daily activities, routine task compliance, and familiar family contacts."
      />

      {/* DAILY ROUTINE TIMELINE */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-black text-sm uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <CalendarDays size={18} className="text-cyan-600" /> Daily Routine Schedule
          </h3>
          <span className="text-xs font-bold text-slate-400">
            {schedules.length} Routine Items
          </span>
        </div>

        {schedules.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No daily routine defined for this patient.</p>
        ) : (
          <div className="space-y-3">
            {schedules.map((sched) => (
              <div key={sched._id} className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 font-black text-xs">
                  <Clock size={16} />
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-xs text-indigo-600">{sched.time}</span>
                    <span className="font-bold text-sm text-slate-800">{sched.activity}</span>
                  </div>
                  {sched.notes && (
                    <p className="text-xs text-slate-400 mt-0.5">{sched.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CARE TASKS */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-black text-sm uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Target size={18} className="text-violet-600" /> Care Tasks & Adherence
          </h3>
          <span className="text-xs font-bold text-slate-400">
            {tasks.length} Assigned Tasks
          </span>
        </div>

        {tasks.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No care tasks currently assigned.</p>
        ) : (
          <div className="space-y-2.5">
            {tasks.map((task) => {
              const completed = task.status === 'completed';
              return (
                <div
                  key={task._id}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border transition ${
                    completed ? 'bg-emerald-50/60 border-emerald-100' : 'bg-slate-50 border-slate-100'
                  }`}
                >
                  <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                    completed ? 'bg-emerald-100 text-emerald-700' : 'bg-white text-slate-300'
                  }`}>
                    <CheckCircle2 size={16} />
                  </span>
                  <div className="flex-1">
                    <p className={`text-sm font-bold ${completed ? 'line-through text-emerald-800' : 'text-slate-800'}`}>
                      {task.title}
                    </p>
                    {task.dueTime && (
                      <p className="text-xs text-slate-400">Due: {task.dueTime}</p>
                    )}
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    completed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {task.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PATIENT MEMORY BOOK */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-black text-sm uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Heart size={18} className="text-rose-500" /> Patient Memory Book Contacts
          </h3>
          <span className="text-xs font-bold text-slate-400">
            {memories.length} Family & Friends Entries
          </span>
        </div>

        {memories.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No memory entries registered yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {memories.map((mem) => (
              <div key={mem._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 font-black text-lg">
                  {mem.photo ? (
                    <img src={`http://localhost:5000${mem.photo}`} alt={mem.name} className="h-full w-full object-cover rounded-2xl" />
                  ) : (
                    mem.name?.charAt(0)
                  )}
                </div>
                <div>
                  <p className="font-extrabold text-sm text-slate-900">{mem.name}</p>
                  <p className="text-xs font-bold text-rose-600">{mem.relationship}</p>
                  {mem.description && (
                    <p className="text-xs text-slate-500 mt-1">{mem.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Routine;
