import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { DoctorProvider, useDoctor } from '../../context/DoctorContext';
import { useAuth } from '../../context/AuthContext';
import DoctorSidebar from './DoctorSidebar';
import AIChat from '../AIChat';
import {
  Menu,
  Stethoscope,
  User,
  LogOut,
  Clock,
  ShieldCheck,
} from 'lucide-react';

const DoctorLayoutInner = () => {
  const { user, logout } = useAuth();
  const { selectedPatient } = useDoctor();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const dayName = dateTime.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = dateTime.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = dateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const handleLogout = () => {
    logout();
    navigate('/auth/doctor/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f3f7fc] text-slate-900 flex flex-col">
      
      {/* SIDEBAR */}
      <DoctorSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* RIGHT SIDE MAIN WRAPPER */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        
        {/* TOP HEADER */}
        <header className="sticky top-0 z-20 border-b border-indigo-100/80 bg-white/95 shadow-xs backdrop-blur-md">
          <div className="flex h-18 items-center justify-between px-4 sm:px-6 lg:px-8">
            
            {/* LEFT: HAMBURGER (MOBILE) + BRAND/PORTAL */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden rounded-xl p-2 text-slate-600 hover:bg-slate-100 transition"
                title="Open Navigation Menu"
              >
                <Menu size={22} />
              </button>

              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-slate-900">
                  Doctor <span className="text-indigo-600">Portal</span>
                </span>
                <span className="hidden sm:inline-flex rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-indigo-700 border border-indigo-100">
                  CareMate Clinical
                </span>
              </div>
            </div>

            {/* RIGHT: CLOCK, PROFILE & LOGOUT */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-slate-800">
                  Dr. {user?.name || 'Practitioner'}
                </p>
                <p className="text-[11px] font-semibold text-slate-400">
                  {dayName}, {dateStr} • {timeStr}
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate('/doctor/profile')}
                className="flex items-center gap-1.5 rounded-2xl border border-indigo-200 bg-indigo-50/70 px-3.5 py-2 text-xs font-extrabold text-indigo-700 shadow-xs transition hover:bg-indigo-100"
                title="Doctor Profile & Settings"
              >
                <User size={15} />
                <span className="hidden sm:inline">Profile</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-extrabold text-red-600 shadow-xs transition hover:bg-red-50 hover:border-red-200"
                title="Logout"
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>

          </div>
        </header>

        {/* MAIN ROUTED CONTENT */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          <Outlet />
        </main>

        {/* FLOATING ROLE-AWARE CLINICAL AI ASSISTANT */}
        <AIChat
          patientId={selectedPatient?._id}
          patientName={selectedPatient?.name}
        />

      </div>

    </div>
  );
};

const DoctorLayout = () => {
  return (
    <DoctorProvider>
      <DoctorLayoutInner />
    </DoctorProvider>
  );
};

export default DoctorLayout;
