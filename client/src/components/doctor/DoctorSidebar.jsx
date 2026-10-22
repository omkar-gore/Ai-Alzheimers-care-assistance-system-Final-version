import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDoctor } from '../../context/DoctorContext';
import {
  Stethoscope,
  LayoutDashboard,
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
  User,
  Lock,
  LogOut,
  X,
  ChevronRight,
  CreditCard,
} from 'lucide-react';

const DoctorSidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { selectedPatient } = useDoctor();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth/doctor/login', { replace: true });
  };

  const navGroups = [
    {
      group: 'MAIN',
      items: [
        {
          label: 'Dashboard',
          to: '/doctor/dashboard',
          icon: LayoutDashboard,
          badge: null,
        },
        {
          label: 'Patients',
          to: '/doctor/patients',
          icon: Users,
          badge: null,
        },
      ],
    },
    {
      group: 'PATIENT CLINICAL MANAGEMENT',
      items: [
        {
          label: 'Appointments',
          to: '/doctor/appointments',
          icon: Calendar,
        },
        {
          label: 'Medications & Prescriptions',
          to: '/doctor/medications',
          icon: Pill,
        },
        {
          label: 'Caregiver Reports',
          to: '/doctor/caregiver-reports',
          icon: ClipboardList,
        },
        {
          label: 'Daily Activity Reports',
          to: '/doctor/daily-reports',
          icon: CalendarDays,
        },
        {
          label: 'Cognitive Screening',
          to: '/doctor/cognitive-screening',
          icon: Brain,
        },
        {
          label: 'Progress & Improvement',
          to: '/doctor/progress',
          icon: TrendingUp,
        },
        {
          label: 'Clinical Timeline',
          to: '/doctor/timeline',
          icon: History,
        },
        {
          label: 'Doctor Notes',
          to: '/doctor/notes',
          icon: FileText,
        },
        {
          label: 'Care Plan',
          to: '/doctor/care-plan',
          icon: Target,
        },
        {
          label: 'Routine & Tasks',
          to: '/doctor/routine',
          icon: Clock,
        },
        {
          label: 'Payments',
          to: '/doctor/payments',
          icon: CreditCard,
        },
      ],
    },
    {
      group: 'ACCOUNT',
      items: [
        {
          label: 'My Profile',
          to: '/doctor/profile',
          icon: User,
        },
        {
          label: 'Change Password',
          to: '/doctor/change-password',
          icon: Lock,
        },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      
      {/* SIDEBAR HEADER */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-700 to-blue-600 text-white shadow-md shadow-indigo-100">
            <Stethoscope size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                Care<span className="text-indigo-600">Mate</span>
              </span>
            </div>
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-indigo-700 border border-indigo-100">
              Doctor Portal
            </span>
          </div>
        </div>

        {/* Close Button on Mobile */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="md:hidden rounded-xl p-1.5 text-slate-400 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* CURRENT SELECTED PATIENT CHIP */}
      {selectedPatient && (
        <div className="px-5 py-3 bg-indigo-50/60 border-b border-indigo-100/60 flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider block">
              Active Patient
            </span>
            <p className="text-xs font-black text-slate-900 truncate">
              {selectedPatient.name}
            </p>
          </div>
          <NavLink
            to="/doctor/patients"
            onClick={onClose}
            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center shrink-0"
            title="Switch Patient"
          >
            <span>Switch</span>
            <ChevronRight size={12} />
          </NavLink>
        </div>
      )}

      {/* NAVIGATION LINKS */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {navGroups.map((grp) => (
          <div key={grp.group} className="space-y-1">
            <p className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
              {grp.group}
            </p>
            {grp.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 font-extrabold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon size={17} className="shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-extrabold text-indigo-700">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* LOGOUT & DOCTOR INFO AT BOTTOM */}
      <div className="p-4 border-t border-slate-100 space-y-2">
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 font-black text-xs">
            {user?.name?.charAt(0) || 'D'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black text-slate-800 truncate">
              Dr. {user?.name || 'Practitioner'}
            </p>
            <p className="text-[11px] text-slate-400 truncate">
              {user?.email || 'doctor@caremate.com'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-extrabold text-red-600 hover:bg-red-50 transition"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>

    </div>
  );

  return (
    <>
      {/* DESKTOP FIXED SIDEBAR */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30">
        {sidebarContent}
      </aside>

      {/* MOBILE DRAWER */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default DoctorSidebar;
