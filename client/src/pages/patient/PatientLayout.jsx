import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Bell,
  Brain,
  CalendarDays,
  ChevronRight,
  Dumbbell,
  Heart,
  Home,
  LogOut,
  Menu,
  UserCircle,
  X,
  Sparkles,
} from 'lucide-react';
import AIChat from '../../components/AIChat';

const navItems = [
  {
    label: 'Dashboard',
    path: '/patient/dashboard',
    icon: Home,
  },
  {
    label: 'Memory Book',
    path: '/patient/memory-book',
    icon: Brain,
  },
  {
    label: 'Mind Games',
    path: '/patient/mind-games',
    icon: Sparkles,
  },
  {
    label: 'Exercise',
    path: '/patient/exercise',
    icon: Dumbbell,
  },
  {
    label: 'Appointments',
    path: '/patient/appointments',
    icon: CalendarDays,
  },
  {
    label: 'Period Tracker',
    path: '/patient/period-tracker',
    icon: CalendarDays,
  },
];

const PatientLayout = ({
  children,
  title,
  subtitle,
}) => {
  const { user, logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] =
    React.useState(false);

  const firstName =
    user?.name?.trim()?.split(' ')[0] || 'there';

  const go = (path) => {
    setMobileOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setMobileOpen(false);
    logout();
    navigate('/auth/patient/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#eef7ff] text-slate-800">

      {/* ==========================================
          BACKGROUND
      ========================================== */}

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-300/20 blur-3xl" />

        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-cyan-300/20 blur-3xl" />
      </div>


      {/* ==========================================
          DESKTOP SIDEBAR
      ========================================== */}

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] border-r border-blue-100 bg-white/95 px-5 py-6 shadow-[8px_0_30px_rgba(30,64,175,0.06)] backdrop-blur-xl lg:flex lg:flex-col">

        {/* Logo */}

        <button
          type="button"
          onClick={() =>
            go('/patient/dashboard')
          }
          className="mb-8 flex items-center gap-3 px-2 text-left"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1976f3] to-[#16b8a6] text-white shadow-lg shadow-blue-200">
            <Heart
              size={23}
              fill="currentColor"
            />
          </span>

          <span>
            <strong className="block text-xl font-black tracking-tight text-[#10213f]">
              Care
              <span className="text-[#1976f3]">
                Mate
              </span>
            </strong>

            <small className="block text-[9px] font-bold uppercase tracking-[1.5px] text-slate-400">
              Connected Care
            </small>
          </span>
        </button>


        {/* Patient card */}

        <div className="mb-6 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 p-4 text-white shadow-lg shadow-blue-200/60">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 text-lg font-extrabold backdrop-blur">
              {firstName
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="min-w-0">

              <p className="truncate text-sm font-extrabold">
                {user?.name || 'Patient'}
              </p>

              <p className="mt-0.5 text-[11px] font-medium text-white/75">
                Patient Portal
              </p>

            </div>

          </div>

        </div>


        {/* Navigation title */}

        <p className="mb-3 px-2 text-[10px] font-black uppercase tracking-[1.5px] text-slate-400">
          Your care
        </p>


        {/* Main navigation */}

        <nav className="space-y-1.5">

          {navItems.map(
            ({
              label,
              path,
              icon: Icon,
            }) => {

              const active =
                location.pathname === path;

              return (
                <button
                  key={path}
                  type="button"
                  onClick={() => go(path)}
                  className={`group flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-bold transition ${
                    active
                      ? 'bg-blue-50 text-[#1976f3] shadow-sm'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-[#1976f3]'
                  }`}
                >

                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                      active
                        ? 'bg-white shadow-sm'
                        : 'bg-slate-100 group-hover:bg-white'
                    }`}
                  >
                    <Icon size={18} />
                  </span>

                  <span className="flex-1 text-left">
                    {label}
                  </span>

                  {active && (
                    <ChevronRight
                      size={16}
                    />
                  )}

                </button>
              );
            }
          )}

        </nav>


        {/* ==========================================
            BOTTOM ACCOUNT ACTIONS
        ========================================== */}

        <div className="mt-auto space-y-2">

          {/* Appointments */}

          <button
            type="button"
            onClick={() =>
              go('/patient/appointments')
            }
            className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-bold text-slate-500 transition hover:bg-slate-50 hover:text-[#1976f3]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
              <CalendarDays size={18} />
            </span>

            Appointments
          </button>


          {/* Profile */}

          <button
            type="button"
            onClick={() =>
              go('/patient/profile')
            }
            className={`flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-bold transition ${
              location.pathname ===
              '/patient/profile'
                ? 'bg-blue-50 text-[#1976f3]'
                : 'text-slate-500 hover:bg-slate-50 hover:text-[#1976f3]'
            }`}
          >
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                location.pathname ===
                '/patient/profile'
                  ? 'bg-white shadow-sm'
                  : 'bg-slate-100'
              }`}
            >
              <UserCircle size={18} />
            </span>

            <span className="flex-1 text-left">
              My Profile
            </span>

            {location.pathname ===
              '/patient/profile' && (
              <ChevronRight size={16} />
            )}
          </button>


          {/* Logout */}

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-bold text-red-500 transition hover:bg-red-50"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50">
              <LogOut size={18} />
            </span>

            Logout
          </button>

        </div>

      </aside>


      {/* ==========================================
          MOBILE HEADER
      ========================================== */}

      <header className="sticky top-0 z-50 border-b border-blue-100 bg-white/95 shadow-sm backdrop-blur-xl lg:hidden">

        <div className="flex h-[72px] items-center justify-between px-4 sm:px-6">

          {/* Logo */}

          <button
            type="button"
            onClick={() =>
              go('/patient/dashboard')
            }
            className="flex items-center gap-2.5"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#1976f3] to-[#16b8a6] text-white shadow-md">
              <Heart
                size={21}
                fill="currentColor"
              />
            </span>

            <span className="text-lg font-black text-[#10213f]">
              Care
              <span className="text-[#1976f3]">
                Mate
              </span>
            </span>
          </button>


          {/* Mobile menu button */}

          <button
            type="button"
            onClick={() =>
              setMobileOpen((value) => !value)
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm"
            aria-label="Open patient menu"
          >
            {mobileOpen ? (
              <X size={20} />
            ) : (
              <Menu size={20} />
            )}
          </button>

        </div>


        {/* ==========================================
            MOBILE MENU
        ========================================== */}

        {mobileOpen && (
          <div className="border-t border-blue-50 bg-white px-4 pb-5 pt-3 shadow-lg">

            {/* Patient information */}

            <div className="mb-4 flex items-center gap-3 rounded-2xl bg-blue-50 p-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 font-extrabold text-white">
                {firstName
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="min-w-0">

                <p className="truncate text-sm font-extrabold text-slate-800">
                  {user?.name || 'Patient'}
                </p>

                <p className="text-xs text-slate-500">
                  Patient Portal
                </p>

              </div>

            </div>


            {/* Main navigation */}

            <div className="grid grid-cols-2 gap-2">

              {navItems.map(
                ({
                  label,
                  path,
                  icon: Icon,
                }) => {

                  const active =
                    location.pathname ===
                    path;

                  return (
                    <button
                      key={path}
                      type="button"
                      onClick={() => go(path)}
                      className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-bold transition ${
                        active
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600'
                      }`}
                    >
                      <Icon size={16} />

                      {label}
                    </button>
                  );
                }
              )}

            </div>


            {/* ======================================
                MOBILE ACCOUNT ACTIONS
            ======================================= */}

            <div className="mt-3 grid grid-cols-2 gap-2">

              {/* Appointments */}

              <button
                type="button"
                onClick={() =>
                  go('/patient/appointments')
                }
                className={`flex items-center gap-2 rounded-xl px-3 py-3 text-left text-xs font-bold transition ${
                  location.pathname ===
                  '/patient/appointments'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                <CalendarDays size={16} />

                Appointments
              </button>


              {/* Profile */}

              <button
                type="button"
                onClick={() =>
                  go('/patient/profile')
                }
                className={`flex items-center gap-2 rounded-xl px-3 py-3 text-left text-xs font-bold transition ${
                  location.pathname ===
                  '/patient/profile'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                <UserCircle size={16} />

                My Profile
              </button>

            </div>


            {/* Logout */}

            <button
              type="button"
              onClick={handleLogout}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-3 py-3 text-xs font-extrabold text-red-600 transition hover:bg-red-100"
            >
              <LogOut size={17} />

              Logout
            </button>

          </div>
        )}

      </header>


      {/* ==========================================
          MAIN CONTENT AREA
      ========================================== */}

      <div className="lg:pl-[260px]">

        {/* Desktop top bar */}

        <header className="hidden border-b border-blue-100 bg-white/80 px-8 py-5 backdrop-blur-xl lg:block">

          <div className="mx-auto flex max-w-[1400px] items-center justify-between">

            <div>

              <p className="text-xs font-black uppercase tracking-[1.5px] text-[#1976f3]">
                Patient care space
              </p>

              <h1 className="mt-1 text-2xl font-black tracking-tight text-[#10213f]">
                {title}
              </h1>

              {subtitle && (
                <p className="mt-1 text-sm text-slate-500">
                  {subtitle}
                </p>
              )}

            </div>


            <div className="flex items-center gap-3">

              {/* Notification button */}

              <button
                type="button"
                className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-blue-50 hover:text-blue-600"
                aria-label="Notifications"
              >
                <Bell size={18} />

                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-cyan-500 ring-2 ring-white" />
              </button>


              {/* User information */}

              <button
                type="button"
                onClick={() =>
                  go('/patient/profile')
                }
                className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-white px-3 py-2 shadow-sm transition hover:bg-blue-50"
              >

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 font-extrabold text-[#1976f3]">
                  {firstName
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="pr-2 text-left">

                  <p className="text-xs font-extrabold text-slate-800">
                    {user?.name || 'Patient'}
                  </p>

                  <p className="text-[10px] text-slate-400">
                    Patient
                  </p>

                </div>

              </button>

            </div>

          </div>

        </header>


        {/* Main */}

        <main className="mx-auto max-w-[1400px] px-4 py-5 pb-28 sm:px-6 lg:px-8 lg:py-8 lg:pb-10">

          {/* Mobile title */}

          <div className="mb-6 lg:hidden">

            <p className="text-xs font-black uppercase tracking-[1.5px] text-[#1976f3]">
              Patient care space
            </p>

            <h1 className="mt-1 text-2xl font-black tracking-tight text-[#10213f]">
              {title}
            </h1>

            {subtitle && (
              <p className="mt-1 text-sm text-slate-500">
                {subtitle}
              </p>
            )}

          </div>

          {children}

        </main>

      </div>


      {/* ==========================================
          MOBILE BOTTOM NAVIGATION
      ========================================== */}

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-blue-100 bg-white/95 px-2 py-2 shadow-[0_-8px_30px_rgba(30,64,175,0.08)] backdrop-blur-xl lg:hidden">

        <div className="mx-auto flex max-w-xl items-center justify-around">

          {[
            {
              label: 'Home',
              path: '/patient/dashboard',
              icon: Home,
            },
            {
              label: 'Memory',
              path: '/patient/memory-book',
              icon: Brain,
            },
            {
              label: 'Games',
              path: '/patient/mind-games',
              icon: Sparkles,
            },
            {
              label: 'Exercise',
              path: '/patient/exercise',
              icon: Dumbbell,
            },
            {
              label: 'Profile',
              path: '/patient/profile',
              icon: UserCircle,
            },
          ].map(
            ({
              label,
              path,
              icon: Icon,
            }) => {

              const active =
                location.pathname === path;

              return (
                <button
                  key={path}
                  type="button"
                  onClick={() => go(path)}
                  className={`flex min-w-[58px] flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-bold transition ${
                    active
                      ? 'bg-blue-50 text-[#1976f3]'
                      : 'text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={18} />

                  {label}
                </button>
              );
            }
          )}

        </div>

      </nav>

      {/* Floating Role-Aware Patient Assistant */}
      <AIChat />

    </div>
  );
};

export default PatientLayout;