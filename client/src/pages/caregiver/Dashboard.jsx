import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from '../../services/axios';
import AIChat from '../../components/AIChat';

import {
  Home,
  CalendarDays,
  MessageCircle,
  FileText,
  UserCircle,
  Bell,
  Heart,
  Activity,
  CheckCircle2,
  Pill,
  Clock3,
  AlertCircle,
  TrendingUp,
  Users,
  LogOut,
  Menu,
  X,
  CreditCard,
} from 'lucide-react';

const CaregiverDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [dateTime, setDateTime] = useState(new Date());
  const [quote, setQuote] = useState('');
  const [patientStatus, setPatientStatus] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --------------------------------------------------
  // UPDATE DATE AND TIME
  // --------------------------------------------------
  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // --------------------------------------------------
  // LOAD CAREGIVER DASHBOARD DATA
  // --------------------------------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        setQuote(
          '“Caring for others is an act of love that makes the world brighter.”'
        );

        const [scheduleRes, medRes, taskRes, apptRes, patientRes] = await Promise.allSettled([
          axios.get('/caregiver/schedules'),
          axios.get('/caregiver/medicines'),
          axios.get('/caregiver/tasks'),
          axios.get('/caregiver/appointments'),
          axios.get('/caregiver/patients'),
        ]);

        if (scheduleRes.status === 'fulfilled' && Array.isArray(scheduleRes.value.data)) {
          setSchedule(scheduleRes.value.data);
        }
        if (medRes.status === 'fulfilled' && Array.isArray(medRes.value.data)) {
          setMedicines(medRes.value.data);
        }
        if (taskRes.status === 'fulfilled' && Array.isArray(taskRes.value.data)) {
          setTasks(taskRes.value.data);
        }
        if (apptRes.status === 'fulfilled' && Array.isArray(apptRes.value.data)) {
          setAlerts(apptRes.value.data);
        }
        if (patientRes.status === 'fulfilled' && Array.isArray(patientRes.value.data) && patientRes.value.data.length > 0) {
          setPatientStatus(patientRes.value.data[0]);
        }
      } catch (error) {
        console.error('Error loading caregiver dashboard data:', error);
      }
    };

    fetchData();
  }, []);

  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------
  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/auth/caregiver/login', { replace: true });
  };

  // --------------------------------------------------
  // NAVIGATION
  // --------------------------------------------------
  const handleNavigation = (path) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  // --------------------------------------------------
  // DATE / TIME
  // --------------------------------------------------
  const hour = dateTime.getHours();

  const greeting =
    hour < 12
      ? 'Good Morning'
      : hour < 18
      ? 'Good Afternoon'
      : 'Good Evening';

  const dayName = dateTime.toLocaleDateString('en-US', {
    weekday: 'long',
  });

  const dateStr = dateTime.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const timeStr = dateTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  // --------------------------------------------------
  // CAREGIVER NAVIGATION ITEMS
  // --------------------------------------------------
  const navigationItems = [
    {
      name: 'Dashboard',
      icon: Home,
      path: '/caregiver/dashboard',
      active: true,
    },
    {
      name: 'Daily Schedule',
      icon: CalendarDays,
      path: '/caregiver/schedule',
      active: false,
    },
    {
      name: 'Appointments',
      icon: CalendarDays,
      path: '/caregiver/appointments',
      active: false,
    },
    {
      name: 'Chat',
      icon: MessageCircle,
      path: '/caregiver/chat',
      active: false,
    },
    {
      name: 'Reports',
      icon: FileText,
      path: '/caregiver/reports',
      active: false,
    },
    {
      name: 'Payments',
      icon: CreditCard,
      path: '/caregiver/payments',
      active: false,
    },
    {
      name: 'Profile',
      icon: UserCircle,
      path: '/caregiver/profile',
      active: false,
    },
  ];

  // --------------------------------------------------
  // QUICK STATS
  // --------------------------------------------------
  const stats = [
    {
      title: 'Patient Status',
      value: patientStatus ? 'Active' : '—',
      subtitle: patientStatus
        ? 'Patient status available'
        : 'No update yet',
      icon: Heart,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: "Today's Schedule",
      value: schedule.length,
      subtitle:
        schedule.length === 1
          ? 'scheduled activity'
          : 'scheduled activities',
      icon: CalendarDays,
      iconBg: 'bg-cyan-50',
      iconColor: 'text-cyan-600',
    },
    {
      title: 'Tasks',
      value: tasks.length,
      subtitle:
        tasks.length === 1
          ? 'task for today'
          : 'tasks for today',
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      title: 'Medicines',
      value: medicines.length,
      subtitle:
        medicines.length === 1
          ? 'medicine scheduled'
          : 'medicines scheduled',
      icon: Pill,
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-600',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* ==================================================
          MOBILE MENU BUTTON
      ================================================== */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="fixed top-5 left-5 z-50 flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-md lg:hidden"
      >
        {mobileMenuOpen ? (
          <X size={22} className="text-slate-700" />
        ) : (
          <Menu size={22} className="text-slate-700" />
        )}
      </button>

      {/* ==================================================
          SIDEBAR
      ================================================== */}
      <aside
        className={`
          fixed left-0 top-0 z-40 h-screen w-[280px]
          border-r border-slate-200 bg-white
          transition-transform duration-300
          lg:translate-x-0
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex h-full flex-col">

          {/* LOGO */}
          <div className="px-7 pt-8 pb-6">
            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg">
                <Heart
                  size={25}
                  className="fill-white text-white"
                />
              </div>

              <div>
                <h1 className="text-[22px] font-extrabold tracking-tight text-slate-900">
                  CareMate
                </h1>

                <p className="text-[10px] font-bold tracking-[0.18em] text-slate-400">
                  CONNECTED CARE
                </p>
              </div>

            </div>
          </div>

          {/* CAREGIVER PROFILE */}
          <div className="px-5">
            <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 p-4 shadow-lg">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20 text-lg font-bold text-white">
                  {user?.name?.charAt(0)?.toUpperCase() || 'C'}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">
                    {user?.name || 'Caregiver'}
                  </p>

                  <p className="text-xs text-blue-100">
                    Caregiver Portal
                  </p>
                </div>

              </div>

            </div>
          </div>

          {/* SECTION TITLE */}
          <div className="px-7 pt-8 pb-3">
            <p className="text-xs font-bold tracking-wider text-slate-400">
              YOUR CARE
            </p>
          </div>

          {/* NAVIGATION */}
          <nav className="flex-1 overflow-y-auto px-5">

            <div className="space-y-2">

              {navigationItems.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.path)}
                    className={`
                      group flex w-full items-center gap-4 rounded-2xl px-4 py-3.5
                      text-left transition-all
                      ${
                        item.active
                          ? 'bg-blue-50 text-blue-600 shadow-sm'
                          : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'
                      }
                    `}
                  >

                    <div
                      className={`
                        flex h-10 w-10 items-center justify-center rounded-xl
                        ${
                          item.active
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600'
                        }
                      `}
                    >
                      <Icon size={20} />
                    </div>

                    <span className="flex-1 text-sm font-semibold">
                      {item.name}
                    </span>

                    {item.active && (
                      <span className="text-lg">
                        ›
                      </span>
                    )}

                  </button>
                );
              })}

            </div>

          </nav>

          {/* SIDEBAR BOTTOM */}
          <div className="border-t border-slate-100 p-5">

            <button
              onClick={handleLogout}
              className="group flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left text-slate-500 transition hover:bg-red-50 hover:text-red-600"
            >

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 group-hover:bg-red-50 group-hover:text-red-600">
                <LogOut size={19} />
              </div>

              <span className="text-sm font-semibold">
                Logout
              </span>

            </button>

          </div>

        </div>
      </aside>

      {/* ==================================================
          MOBILE OVERLAY
      ================================================== */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-30 bg-slate-900/20 lg:hidden"
        />
      )}

      {/* ==================================================
          MAIN CONTENT
      ================================================== */}
      <main className="min-h-screen lg:ml-[280px]">

        {/* ==================================================
            TOP HEADER
        ================================================== */}
        <header className="flex h-[110px] items-center justify-between border-b border-slate-200 bg-white px-6 sm:px-8 lg:px-10">

          <div className="ml-14 lg:ml-0">

            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              CAREGIVER CARE SPACE
            </p>

            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Dashboard
            </h2>

            <p className="mt-1 hidden text-sm text-slate-500 sm:block">
              Your simple view of today's patient care and routine.
            </p>

          </div>

          <div className="flex items-center gap-3">

            {/* NOTIFICATION */}
            <button
              onClick={() => {
                // Notification module can be connected later.
              }}
              className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50"
            >
              <Bell size={21} />

              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-cyan-500" />
            </button>

            {/* PROFILE */}
            <button
              onClick={() => handleNavigation('/caregiver/profile')}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm transition hover:bg-slate-50 sm:px-4"
            >

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-600">
                {user?.name?.charAt(0)?.toUpperCase() || 'C'}
              </div>

              <div className="hidden text-left sm:block">
                <p className="max-w-[130px] truncate text-sm font-bold text-slate-800">
                  {user?.name || 'Caregiver'}
                </p>

                <p className="text-xs text-slate-400">
                  Caregiver
                </p>
              </div>

            </button>

          </div>

        </header>

        {/* ==================================================
            PAGE BODY
        ================================================== */}
        <div className="px-5 py-7 sm:px-8 lg:px-10">

          {/* ==================================================
              WELCOME HERO
          ================================================== */}
          <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-blue-600 via-blue-600 to-cyan-500 p-7 text-white shadow-lg sm:p-9">

            {/* Decorative circles */}
            <div className="absolute -right-10 -top-20 h-64 w-64 rounded-full bg-white/10" />
            <div className="absolute -bottom-28 right-32 h-52 w-52 rounded-full bg-cyan-300/10" />

            <div className="relative z-10 max-w-3xl">

              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-bold tracking-wide backdrop-blur-sm">
                <Heart size={15} className="fill-white" />
                CONNECTED CARE
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-[42px]">
                {greeting}, {user?.name || 'Caregiver'}! 👋
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-50 sm:text-base">
                Here is your care overview for today. Keep your patient's
                routine simple, safe and comfortable.
              </p>

              {/* DATE + TIME */}
              <div className="mt-7 flex flex-wrap gap-3">

                <div className="rounded-2xl bg-white/15 px-5 py-3 backdrop-blur-sm">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-blue-100">
                    Today
                  </p>

                  <p className="mt-1 text-sm font-bold">
                    {dayName}, {dateStr}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/15 px-5 py-3 backdrop-blur-sm">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-blue-100">
                    Current Time
                  </p>

                  <p className="mt-1 text-sm font-bold">
                    {timeStr}
                  </p>
                </div>

              </div>

            </div>

          </section>

          {/* ==================================================
              QUICK STATS
          ================================================== */}
          <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.title}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >

                  <div className="flex items-start justify-between">

                    <div>
                      <p className="text-xs font-semibold text-slate-400">
                        {stat.title}
                      </p>

                      <p className="mt-2 text-2xl font-extrabold text-slate-900">
                        {stat.value}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {stat.subtitle}
                      </p>
                    </div>

                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.iconBg} ${stat.iconColor}`}
                    >
                      <Icon size={21} />
                    </div>

                  </div>

                </div>
              );
            })}

          </section>

          {/* ==================================================
              MOTIVATIONAL QUOTE
          ================================================== */}
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-start gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Heart size={21} className="fill-blue-100" />
              </div>

              <div>

                <h3 className="text-sm font-bold text-blue-700">
                  Daily Motivational Quote
                </h3>

                <p className="mt-2 text-sm italic leading-6 text-slate-600">
                  {quote}
                </p>

              </div>

            </div>

          </section>

          {/* ==================================================
              CARE OVERVIEW
          ================================================== */}
          <section className="mt-7">

            <div className="mb-4">
              <h2 className="text-xl font-extrabold text-slate-900">
                Patient Care Overview
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Monitor your patient's daily care activities.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

              {/* PATIENT STATUS */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex items-center justify-between">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Heart size={21} />
                  </div>

                  <span className="rounded-full bg-slate-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Patient
                  </span>

                </div>

                <h3 className="mt-5 text-base font-bold text-slate-900">
                  Patient Status
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {patientStatus
                    ? 'Patient status information is available.'
                    : 'No patient status update available yet.'}
                </p>

                <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-slate-400">
                  <Activity size={15} />
                  Monitoring status
                </div>

              </div>

              {/* TODAY'S SCHEDULE */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex items-center justify-between">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                    <CalendarDays size={21} />
                  </div>

                  <button
                    onClick={() =>
                      handleNavigation('/caregiver/schedule')
                    }
                    className="rounded-full bg-cyan-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-cyan-600 transition hover:bg-cyan-100"
                  >
                    Manage
                  </button>

                </div>

                <h3 className="mt-5 text-base font-bold text-slate-900">
                  Today's Schedule
                </h3>

                {schedule.length === 0 ? (
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    No schedule available for today.
                  </p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {schedule.slice(0, 3).map((item, index) => (
                      <div
                        key={item?._id || index}
                        className="flex items-center gap-2 text-sm text-slate-600"
                      >
                        <Clock3
                          size={15}
                          className="shrink-0 text-cyan-600"
                        />

                        <span className="font-semibold">
                          {item?.time || '--:--'}
                        </span>

                        <span className="truncate">
                          {item?.activity || 'Scheduled activity'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-slate-400">
                  <CalendarDays size={15} />
                  {schedule.length} scheduled
                </div>

              </div>

              {/* TASKS */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex items-center justify-between">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <CheckCircle2 size={21} />
                  </div>

                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                    Tasks
                  </span>

                </div>

                <h3 className="mt-5 text-base font-bold text-slate-900">
                  Today's Tasks
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {tasks.length === 0
                    ? 'No tasks available for today.'
                    : `${tasks.length} task${tasks.length > 1 ? 's' : ''} scheduled for today.`}
                </p>

                <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-slate-400">
                  <CheckCircle2 size={15} />
                  Daily care tasks
                </div>

              </div>

              {/* MEDICINE STATUS */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex items-center justify-between">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <Pill size={21} />
                  </div>

                  <span className="rounded-full bg-violet-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-violet-600">
                    Medicines
                  </span>

                </div>

                <h3 className="mt-5 text-base font-bold text-slate-900">
                  Medicine Status
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {medicines.length === 0
                    ? 'No medicine information available.'
                    : `${medicines.length} medicine${medicines.length > 1 ? 's' : ''} scheduled.`}
                </p>

                <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-slate-400">
                  <Pill size={15} />
                  Medication tracking
                </div>

              </div>

              {/* PATIENT PROGRESS */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex items-center justify-between">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <TrendingUp size={21} />
                  </div>

                  <span className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-600">
                    Progress
                  </span>

                </div>

                <h3 className="mt-5 text-base font-bold text-slate-900">
                  Patient Progress
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Patient progress information will appear here as care
                  activities are recorded.
                </p>

                <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-slate-400">
                  <TrendingUp size={15} />
                  Progress tracking
                </div>

              </div>

              {/* ALERTS */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex items-center justify-between">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
                    <AlertCircle size={21} />
                  </div>

                  <span className="rounded-full bg-red-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-red-500">
                    Alerts
                  </span>

                </div>

                <h3 className="mt-5 text-base font-bold text-slate-900">
                  Alerts
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {alerts.length === 0
                    ? 'No new alerts at the moment.'
                    : `${alerts.length} alert${alerts.length > 1 ? 's' : ''} require attention.`}
                </p>

                <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-slate-400">
                  <Bell size={15} />
                  Care notifications
                </div>

              </div>

              {/* PAYMENTS & BILLING */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex items-center justify-between">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <CreditCard size={21} />
                  </div>

                  <button
                    onClick={() => handleNavigation('/caregiver/payments')}
                    className="rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-indigo-600 transition hover:bg-indigo-100"
                  >
                    View
                  </button>

                </div>

                <h3 className="mt-5 text-base font-bold text-slate-900">
                  Payments & UPI
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Review doctor consultation invoices, scan UPI QR codes, and view receipts.
                </p>

                <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-indigo-600">
                  <CreditCard size={15} />
                  Digital UPI billing
                </div>

              </div>

            </div>

          </section>

          {/* ==================================================
              CARE REMINDER
          ================================================== */}
          <section className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">

            <div className="flex items-start gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                <Users size={20} />
              </div>

              <div>

                <h3 className="text-sm font-bold text-blue-800">
                  Caregiver Reminder
                </h3>

                <p className="mt-1 text-sm leading-6 text-blue-700/70">
                  Keep the patient's daily routine consistent and provide
                  support with patience and care.
                </p>

              </div>

            </div>

          </section>

          {/* Bottom spacing */}
          <div className="h-8" />

        </div>

      </main>

      {/* Role-aware Caregiver AI Assistant */}
      <AIChat
        patientId={patientStatus?._id}
        patientName={patientStatus?.name}
      />
    </div>
  );
};

export default CaregiverDashboard;