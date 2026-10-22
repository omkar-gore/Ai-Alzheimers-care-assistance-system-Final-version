import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, ArrowLeft, History, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const ScreeningHeader = ({ title = 'Early Cognitive Screening', showBack = true }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isScreeningUser = user?.role === 'screeningUser';

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-4">
          {showBack && (
            <button
              type="button"
              onClick={() => navigate('/')}
              className="p-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition flex items-center gap-1.5 font-bold text-sm"
              title="Return to CareMate Home"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back to CareMate</span>
            </button>
          )}

          <Link to="/cognitive-screening" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-slate-900 tracking-tight">CareMate</span>
                <span className="hidden md:inline px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-100 text-blue-800 uppercase tracking-wide">
                  Screening Tool
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold hidden sm:block">
                Early Cognitive & Routine Assessment
              </p>
            </div>
          </Link>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          {isScreeningUser ? (
            <div className="flex items-center gap-2">
              <Link
                to="/cognitive-screening/history"
                className="px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-sm transition flex items-center gap-2"
              >
                <History className="w-4 h-4" />
                <span>My History</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/cognitive-screening');
                }}
                className="p-2.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                title="Log out of screening account"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/cognitive-screening/history"
              className="px-4 py-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-slate-50 font-bold text-sm transition flex items-center gap-1.5"
            >
              <History className="w-4 h-4" />
              <span>Screening History</span>
            </Link>
          )}

          <div className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Anonymous & Non-Diagnostic</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ScreeningHeader;
