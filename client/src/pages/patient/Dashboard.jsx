import React, { useEffect, useMemo, useState } from 'react';
import axios from '../../services/axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Heart,
  LogOut,
  Pill,
  Sparkles,
  Target,
} from 'lucide-react';
import PatientLayout from './PatientLayout';
import AIChat from '../../components/AIChat';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [time, setTime] = useState(new Date());
  const [medicines, setMedicines] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [medRes, schedRes, taskRes] = await Promise.all([
          axios.get('/medicines'),
          axios.get('/schedules'),
          axios.get('/tasks'),
        ]);

        setMedicines(
          Array.isArray(medRes.data)
            ? medRes.data
            : []
        );

        setSchedule(
          Array.isArray(schedRes.data)
            ? schedRes.data
            : []
        );

        setTasks(
          Array.isArray(taskRes.data)
            ? taskRes.data
            : []
        );
      } catch (error) {
        console.error(
          'Error fetching patient data',
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const greeting =
    time.getHours() < 12
      ? 'Good morning'
      : time.getHours() < 18
        ? 'Good afternoon'
        : 'Good evening';

  const dateLabel = time.toLocaleDateString(
    'en-US',
    {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }
  );

  const timeLabel = time.toLocaleTimeString(
    'en-US',
    {
      hour: 'numeric',
      minute: '2-digit',
    }
  );

  const completedTasks = useMemo(
    () =>
      tasks.filter(
        (task) => task.status === 'completed'
      ).length,
    [tasks]
  );

  const taskProgress = tasks.length
    ? Math.round(
        (completedTasks / tasks.length) * 100
      )
    : 0;

  const pendingMedicines = medicines.filter(
    (med) => med.status !== 'done'
  ).length;

  const markTaskComplete = async (taskId) => {
    try {
      await axios.post(
        `/tasks/${taskId}/complete`
      );

      setTasks((prev) =>
        prev.map((task) =>
          task._id === taskId
            ? {
                ...task,
                status: 'completed',
                completedAt: new Date(),
              }
            : task
        )
      );
    } catch (error) {
      console.error(
        'Error marking task complete',
        error
      );
    }
  };

  const toggleMedicineComplete = async (medId) => {
    try {
      const res = await axios.post(`/medicines/${medId}/toggle`);
      setMedicines((prev) =>
        prev.map((med) => (med._id === medId ? res.data : med))
      );
    } catch (error) {
      console.error('Error toggling medicine status', error);
    }
  };

  /*
   * LOGOUT
   *
   * The application does not have a /login route.
   * The correct patient login route is:
   * /auth/patient/login
   */
  const handleLogout = () => {
    logout();
    navigate('/auth/patient/login', {
      replace: true,
    });
  };

  const stats = [
    {
      label: 'Medicines',
      value: medicines.length,
      note: pendingMedicines
        ? `${pendingMedicines} pending`
        : 'All checked',
      icon: Pill,
      iconClass:
        'bg-blue-50 text-blue-600',
    },
    {
      label: 'Today’s routine',
      value: schedule.length,
      note: 'scheduled activities',
      icon: CalendarDays,
      iconClass:
        'bg-cyan-50 text-cyan-600',
    },
    {
      label: 'Tasks done',
      value: completedTasks,
      note: `${taskProgress}% complete`,
      icon: CheckCircle2,
      iconClass:
        'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Daily progress',
      value: `${taskProgress}%`,
      note: 'keep going',
      icon: Target,
      iconClass:
        'bg-violet-50 text-violet-600',
    },
  ];

  if (loading) {
    return (
      <PatientLayout
        title="Dashboard"
        subtitle="Your simple view of today’s care and routine."
      >
        <div className="flex min-h-[55vh] items-center justify-center">
          <div className="rounded-3xl border border-blue-100 bg-white px-8 py-7 text-center shadow-xl shadow-blue-100/50">
            <div className="mx-auto mb-4 h-11 w-11 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

            <p className="font-bold text-slate-700">
              Preparing your care dashboard...
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Please wait a moment.
            </p>
          </div>
        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout
      title="Dashboard"
      subtitle="Your simple view of today’s care and routine."
    >
      <div className="space-y-6">

        {/* =====================================================
            WELCOME HERO
        ====================================================== */}

        <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#0e5fd7] via-[#1976f3] to-[#16b8a6] p-6 text-white shadow-xl shadow-blue-200/60 sm:p-8">

          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10" />

          <div className="absolute -bottom-24 right-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

          <div className="relative z-10 max-w-4xl">

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider backdrop-blur">
              <Heart
                size={14}
                fill="currentColor"
              />

              Connected care
            </div>

            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
              {greeting},{' '}
              {user?.name?.split(' ')[0] ||
                'there'}! 👋
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">
              Here is your care plan for today.
              Take things one step at a time and
              keep your routine simple.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">

              <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/65">
                  Today
                </p>

                <p className="mt-1 text-sm font-extrabold">
                  {dateLabel}
                </p>
              </div>

              <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/65">
                  Current time
                </p>

                <p className="mt-1 text-sm font-extrabold">
                  {timeLabel}
                </p>
              </div>

              {/* Profile button */}

              <button
                type="button"
                onClick={() =>
                  navigate('/patient/profile')
                }
                className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-extrabold text-blue-700 shadow-sm transition hover:bg-blue-50"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-black">
                  {user?.name
                    ?.charAt(0)
                    ?.toUpperCase() || 'P'}
                </span>

                My Profile
              </button>

              {/* Logout button */}

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-4 py-3 text-sm font-extrabold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                <LogOut size={17} />

                Logout
              </button>

            </div>
          </div>
        </section>


        {/* =====================================================
            STATS
        ====================================================== */}

        <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">

          {stats.map(
            ({
              label,
              value,
              note,
              icon: Icon,
              iconClass,
            }) => (
              <div
                key={label}
                className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">

                  <div>
                    <p className="text-xs font-bold text-slate-400">
                      {label}
                    </p>

                    <p className="mt-2 text-2xl font-black text-slate-800">
                      {value}
                    </p>

                    <p className="mt-1 text-[11px] font-semibold text-slate-400">
                      {note}
                    </p>
                  </div>

                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
                  >
                    <Icon size={19} />
                  </span>

                </div>
              </div>
            )
          )}

        </section>


        {/* =====================================================
            MEDICINES + PROGRESS
        ====================================================== */}

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">

          {/* Medicines */}

          <section className="rounded-[26px] border border-blue-100 bg-white p-5 shadow-sm sm:p-6">

            <div className="mb-5 flex items-center justify-between gap-3">

              <div>
                <p className="text-xs font-black uppercase tracking-[1.3px] text-blue-600">
                  Care plan
                </p>

                <h3 className="mt-1 text-xl font-black text-slate-800">
                  Today’s medicines
                </h3>
              </div>

              <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-extrabold text-blue-600">
                {medicines.length} items
              </span>

            </div>

            {medicines.length === 0 ? (
              <EmptyState
                icon={Pill}
                title="No medicines scheduled"
                text="There are no medicines in your current schedule."
              />
            ) : (
              <div className="space-y-3">

                {medicines.map(
                  ({
                    _id,
                    name,
                    dosage,
                    time: medTime,
                    instructions,
                    status,
                  }) => (
                    <div
                      key={_id}
                      className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-blue-100 hover:bg-blue-50/50"
                    >

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                        <Pill size={20} />
                      </div>

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-2">

                          <p className="font-extrabold text-slate-800">
                            {name}
                          </p>

                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${
                              status === 'done'
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-amber-50 text-amber-600'
                            }`}
                          >
                            {status === 'done'
                              ? 'Done'
                              : 'Pending'}
                          </span>

                        </div>

                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          {dosage ||
                            'Dosage not specified'}{' '}
                          •{' '}
                          {medTime ||
                            'Time not specified'}
                        </p>

                        {instructions && (
                          <p className="mt-1 text-[11px] text-slate-400">
                            {instructions}
                          </p>
                        )}

                      </div>

                      <button
                        type="button"
                        onClick={() => toggleMedicineComplete(_id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                          status === 'done'
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                        }`}
                        title={status === 'done' ? 'Mark as Pending' : 'Take Medicine'}
                      >
                        {status === 'done' ? (
                          <>
                            <CheckCircle2 size={16} />
                            <span>Taken</span>
                          </>
                        ) : (
                          <>
                            <Pill size={15} />
                            <span>Take</span>
                          </>
                        )}
                      </button>

                    </div>
                  )
                )}

              </div>
            )}

          </section>


          {/* Progress */}

          <section className="rounded-[26px] border border-blue-100 bg-white p-5 shadow-sm sm:p-6">

            <div className="mb-5 flex items-center gap-3">

              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Activity size={21} />
              </span>

              <div>
                <p className="text-xs font-black uppercase tracking-[1.3px] text-emerald-600">
                  Daily progress
                </p>

                <h3 className="mt-1 text-xl font-black text-slate-800">
                  Small steps matter
                </h3>
              </div>

            </div>

            <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-blue-50 p-5">

              <div className="flex items-end justify-between">

                <div>
                  <p className="text-4xl font-black text-slate-800">
                    {taskProgress}%
                  </p>

                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    of today’s tasks completed
                  </p>
                </div>

                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm">
                  <Target size={23} />
                </span>

              </div>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-white">

                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-700"
                  style={{
                    width: `${taskProgress}%`,
                  }}
                />

              </div>

              <p className="mt-3 text-xs font-semibold text-slate-500">
                {completedTasks} of {tasks.length}{' '}
                tasks completed
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                navigate('/patient/mind-games')
              }
              className="mt-4 flex w-full items-center justify-between rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm font-extrabold text-blue-600 transition hover:bg-blue-50"
            >
              Take a short mind game
              <ArrowRight size={17} />
            </button>

          </section>

        </div>


        {/* =====================================================
            ROUTINE + TASKS
        ====================================================== */}

        <div className="grid gap-6 xl:grid-cols-2">

          {/* Routine */}

          <section className="rounded-[26px] border border-blue-100 bg-white p-5 shadow-sm sm:p-6">

            <div className="mb-5 flex items-center justify-between">

              <div>
                <p className="text-xs font-black uppercase tracking-[1.3px] text-cyan-600">
                  Your day
                </p>

                <h3 className="mt-1 text-xl font-black text-slate-800">
                  Today’s routine
                </h3>
              </div>

              <CalendarDays
                size={21}
                className="text-cyan-500"
              />

            </div>

            {schedule.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="No activities scheduled"
                text="Your daily schedule will appear here."
              />
            ) : (
              <div className="relative space-y-3 before:absolute before:bottom-4 before:left-[21px] before:top-4 before:w-px before:bg-blue-100">

                {schedule.map(
                  ({
                    _id,
                    time: scheduleTime,
                    activity,
                  }) => (
                    <div
                      key={_id}
                      className="relative flex gap-4"
                    >

                      <span className="relative z-10 mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-4 border-white bg-blue-50 text-blue-600 shadow-sm">
                        <Clock3 size={17} />
                      </span>

                      <div className="flex-1 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5">

                        <p className="text-xs font-black text-blue-600">
                          {scheduleTime}
                        </p>

                        <p className="mt-1 text-sm font-bold text-slate-700">
                          {activity}
                        </p>

                      </div>

                    </div>
                  )
                )}

              </div>
            )}

          </section>


          {/* Tasks */}

          <section className="rounded-[26px] border border-blue-100 bg-white p-5 shadow-sm sm:p-6">

            <div className="mb-5 flex items-center justify-between">

              <div>
                <p className="text-xs font-black uppercase tracking-[1.3px] text-violet-600">
                  To do
                </p>

                <h3 className="mt-1 text-xl font-black text-slate-800">
                  Today’s tasks
                </h3>
              </div>

              <span className="rounded-full bg-violet-50 px-3 py-1 text-[11px] font-extrabold text-violet-600">
                {completedTasks}/{tasks.length}
              </span>

            </div>

            {tasks.length === 0 ? (
              <EmptyState
                icon={Target}
                title="No tasks for today"
                text="Your caregiver can add daily tasks to your care plan."
              />
            ) : (
              <div className="space-y-2.5">

                {tasks.map(
                  ({ _id, title, status }) => {
                    const completed =
                      status === 'completed';

                    return (
                      <div
                        key={_id}
                        className={`flex items-center gap-3 rounded-2xl border p-3.5 ${
                          completed
                            ? 'border-emerald-100 bg-emerald-50/60'
                            : 'border-slate-100 bg-slate-50/60'
                        }`}
                      >

                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                            completed
                              ? 'bg-emerald-100 text-emerald-600'
                              : 'bg-white text-slate-300 shadow-sm'
                          }`}
                        >
                          {completed ? (
                            <Check size={18} />
                          ) : (
                            <Target size={17} />
                          )}
                        </span>

                        <p
                          className={`flex-1 text-sm font-bold ${
                            completed
                              ? 'text-emerald-700 line-through'
                              : 'text-slate-700'
                          }`}
                        >
                          {title}
                        </p>

                        {!completed && (
                          <button
                            type="button"
                            onClick={() =>
                              markTaskComplete(_id)
                            }
                            className="rounded-xl bg-blue-600 px-3 py-2 text-[10px] font-black text-white shadow-sm transition hover:bg-blue-700"
                          >
                            Done
                          </button>
                        )}

                      </div>
                    );
                  }
                )}

              </div>
            )}

          </section>

        </div>


        {/* =====================================================
            QUICK ACTIONS
        ====================================================== */}

        <section>

          <div className="mb-4 flex items-end justify-between">

            <div>
              <p className="text-xs font-black uppercase tracking-[1.3px] text-blue-600">
                Explore
              </p>

              <h3 className="mt-1 text-xl font-black text-slate-800">
                Your care tools
              </h3>
            </div>

          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

            <QuickCard
              icon={Heart}
              title="Memory Book"
              text="Keep familiar faces and relationships close."
              tone="blue"
              onClick={() =>
                navigate('/patient/memory-book')
              }
            />

            <QuickCard
              icon={Sparkles}
              title="Mind Games"
              text="Try a short, simple memory activity."
              tone="violet"
              onClick={() =>
                navigate('/patient/mind-games')
              }
            />

            <QuickCard
              icon={Activity}
              title="Exercise"
              text="Follow gentle movement activities."
              tone="teal"
              onClick={() =>
                navigate('/patient/exercise')
              }
            />

            <QuickCard
              icon={CalendarDays}
              title="Period Tracker"
              text="Record dates and view your estimate."
              tone="amber"
              onClick={() =>
                navigate('/patient/period-tracker')
              }
            />

            <QuickCard
              icon={Heart}
              title="My Profile"
              text="View and manage your personal information."
              tone="blue"
              onClick={() =>
                navigate('/patient/profile')
              }
            />

          </div>

        </section>


        {/* =====================================================
            LOGOUT
        ====================================================== */}

        <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-sm font-black text-slate-800">
                Finished for now?
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                You can safely log out of your CareMate
                account and come back later.
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50"
            >
              <LogOut size={17} />
              Logout
            </button>

          </div>

        </section>

      </div>

      {/* Role-aware Patient AI Assistant */}
      <AIChat />
    </PatientLayout>
  );
};


const EmptyState = ({
  icon: Icon,
  title,
  text,
}) => (
  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center">

    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
      <Icon size={21} />
    </span>

    <p className="mt-3 text-sm font-extrabold text-slate-700">
      {title}
    </p>

    <p className="mt-1 text-xs leading-5 text-slate-400">
      {text}
    </p>

  </div>
);


const QuickCard = ({
  icon: Icon,
  title,
  text,
  tone,
  onClick,
}) => {
  const tones = {
    blue:
      'bg-blue-50 text-blue-600 hover:border-blue-200',
    violet:
      'bg-violet-50 text-violet-600 hover:border-violet-200',
    teal:
      'bg-teal-50 text-teal-600 hover:border-teal-200',
    amber:
      'bg-amber-50 text-amber-600 hover:border-amber-200',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-[22px] border border-blue-100 bg-white p-5 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
    >

      <span
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${tones[tone]}`}
      >
        <Icon size={20} />
      </span>

      <div className="mt-4 flex items-center justify-between gap-2">

        <h4 className="font-extrabold text-slate-800">
          {title}
        </h4>

        <ArrowRight
          size={16}
          className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-500"
        />

      </div>

      <p className="mt-1.5 text-xs leading-5 text-slate-500">
        {text}
      </p>

    </button>
  );
};

export default Dashboard;