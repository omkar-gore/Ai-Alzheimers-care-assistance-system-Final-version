import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Brain,
  History,
  TrendingUp,
  Calendar,
  AlertCircle,
  ArrowRight,
  Shield,
  LogIn,
  RotateCcw,
  CheckCircle2,
  Lock,
  Eye,
  X,
  ChevronRight,
  UserPlus,
} from 'lucide-react';
import ScreeningHeader from './components/ScreeningHeader';
import { getScreeningHistory } from '../../services/screeningService';
import {
  getRiskBadgeConfig,
  MEDICAL_DISCLAIMERS,
  calculateScreeningComparison,
} from '../../utils/screeningScoring';
import { useAuth } from '../../context/AuthContext';

const RESULT_STORAGE_KEY = 'caremate_screening_last_result';
const SESSION_HISTORY_STORAGE_KEY = 'caremate_screening_session_history';

const ScreeningHistoryPage = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const [history, setHistory] = useState([]);
  const [isSessionHistory, setIsSessionHistory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected record for detail modal
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Login form if user is not authenticated
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const isAuthenticated = !!user;

  useEffect(() => {
    loadHistory();
  }, [isAuthenticated]);

  const loadHistory = async () => {
    setLoading(true);
    setError('');

    if (isAuthenticated) {
      try {
        const data = await getScreeningHistory();
        setHistory(Array.isArray(data) ? data : []);
        setIsSessionHistory(false);
      } catch (err) {
        console.error('Error fetching screening history:', err);
        setError('Failed to load your screening history. Please verify your connection.');
      } finally {
        setLoading(false);
      }
    } else {
      // Anonymous user: check current browser session records
      try {
        const sessionHistRaw = sessionStorage.getItem(SESSION_HISTORY_STORAGE_KEY);
        const lastResultRaw = sessionStorage.getItem(RESULT_STORAGE_KEY);

        const sessionItems = sessionHistRaw ? JSON.parse(sessionHistRaw) : [];
        if (lastResultRaw) {
          const lastItem = JSON.parse(lastResultRaw);
          if (
            !sessionItems.some(
              (item) =>
                (item.screeningId && item.screeningId === lastItem.screeningId) ||
                item.createdAt === lastItem.createdAt
            )
          ) {
            sessionItems.unshift(lastItem);
          }
        }

        // Normalize session items to expected history format
        const normalizedItems = sessionItems.map((item, idx) => ({
          _id: item.screeningId || `session_${idx}`,
          overallScore: item.scores?.overallScore ?? item.overallScore ?? 0,
          memoryScore: item.scores?.memoryScore ?? item.memoryScore ?? 0,
          delayedRecallScore: item.scores?.delayedRecallScore ?? item.delayedRecallScore ?? 0,
          attentionScore: item.scores?.attentionScore ?? item.attentionScore ?? 0,
          orientationScore: item.scores?.orientationScore ?? item.orientationScore ?? 0,
          languageScore: item.scores?.languageScore ?? item.languageScore ?? 0,
          reasoningScore: item.scores?.reasoningScore ?? item.reasoningScore ?? 0,
          workingMemoryScore: item.scores?.workingMemoryScore ?? item.workingMemoryScore ?? 0,
          dailyLifeScore: item.scores?.dailyLifeScore ?? item.dailyLifeScore ?? 0,
          riskIndicator: item.riskIndicator || 'Lower Risk Indicators',
          strengths: item.strengths || [],
          areasToWatch: item.areasToWatch || [],
          age: item.demographics?.age ?? item.age ?? 'N/A',
          language: item.demographics?.language ?? item.language ?? 'English',
          educationLevel: item.demographics?.educationLevel ?? item.educationLevel ?? 'Not specified',
          createdAt: item.createdAt || new Date().toISOString(),
        }));

        setHistory(normalizedItems);
        setIsSessionHistory(normalizedItems.length > 0);
      } catch (e) {
        console.warn('Error reading session history:', e);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      await login(loginEmail, loginPassword);
    } catch (err) {
      setLoginError(
        err.response?.data?.message || 'Invalid email or password. Please try again.'
      );
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRetakeScreening = () => {
    sessionStorage.removeItem('caremate_screening_active_session');
    navigate('/cognitive-screening?retake=true');
  };

  // Compute comparison between latest (index 0) and immediate previous (index 1)
  const latestComparison =
    history.length >= 2 ? calculateScreeningComparison(history[0], history[1]) : null;

  // Compute comparison for selected record with the record chronologically prior to it
  const getSelectedRecordComparison = () => {
    if (!selectedRecord) return null;
    const currentIndex = history.findIndex((h) => h._id === selectedRecord._id);
    if (currentIndex >= 0 && currentIndex + 1 < history.length) {
      return calculateScreeningComparison(selectedRecord, history[currentIndex + 1]);
    }
    return null;
  };

  const selectedRecordComparison = getSelectedRecordComparison();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <ScreeningHeader />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        {/* Title & Action Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span className="inline-block px-3.5 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-blue-100 text-blue-800">
              Screening Profile
            </span>
            {isSessionHistory && (
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
                Current Browser Session
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Screening Performance Over Time
          </h1>
          <p className="text-slate-600 text-base max-w-2xl mx-auto">
            Review past cognitive assessments, compare scores between screenings, and observe trends across routine evaluations.
          </p>

          {/* Retake & Action Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              type="button"
              onClick={handleRetakeScreening}
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm sm:text-base shadow-md hover:shadow-lg transition flex items-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Retake Screening</span>
            </button>

            <Link
              to="/cognitive-screening/results"
              className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-300 rounded-2xl font-bold text-sm sm:text-base shadow-sm transition flex items-center gap-2"
            >
              <ArrowRight className="w-5 h-5 text-blue-600" />
              <span>Back to Latest Results</span>
            </Link>
          </div>
        </div>

        {/* Safety Disclaimer Banner */}
        <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-5 text-amber-950 text-sm leading-relaxed flex items-start gap-3 shadow-sm">
          <Shield className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Medical Safety Notice: </span>
            <span>{MEDICAL_DISCLAIMERS.SHORT}</span>
            <span className="block text-xs text-amber-800 mt-1">
              Changes between screenings can be influenced by sleep, stress, practice, attention, mood, and many other factors. Do NOT interpret improvement or decline as proof of Alzheimer&apos;s disease, dementia, or disease progression.
            </span>
          </div>
        </div>

        {/* ANONYMOUS SESSION NOTICE */}
        {isSessionHistory && !isAuthenticated && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-blue-950 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-base text-blue-900">
                Viewing Screenings from This Browser Session
              </h4>
              <p className="text-xs sm:text-sm text-blue-700 mt-0.5">
                These {history.length} assessment records are stored in your current session. Log in or create a screening account to save them permanently.
              </p>
            </div>
            <Link
              to="/cognitive-screening/results"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition shrink-0"
            >
              Create Screening Account
            </Link>
          </div>
        )}

        {/* LATEST VS PREVIOUS COMPARISON SECTION (Shown when 2 or more screenings exist) */}
        {latestComparison && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border-2 border-teal-200/90 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-700 block">
                    Score Comparison
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Latest vs Previous Screening
                  </h2>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Comparison of 2 most recent assessments
              </span>
            </div>

            {/* Score Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Previous Score
                </span>
                <span className="text-4xl font-black text-slate-700">
                  {latestComparison.previousScore}
                </span>
                <span className="text-sm text-slate-400 block mt-1">
                  {latestComparison.previousDate
                    ? new Date(latestComparison.previousDate).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Previous test'}
                </span>
              </div>

              <div className="bg-blue-50/70 p-5 rounded-2xl border border-blue-200 text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 block mb-1">
                  Latest Score
                </span>
                <span className="text-4xl font-black text-blue-900">
                  {latestComparison.latestScore}
                </span>
                <span className="text-sm text-blue-600 block mt-1">
                  {latestComparison.currentDate
                    ? new Date(latestComparison.currentDate).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Latest test'}
                </span>
              </div>

              <div
                className={`p-5 rounded-2xl border text-center ${
                  latestComparison.overallChange > 0
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : latestComparison.overallChange < 0
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <span className="text-xs font-bold uppercase tracking-wider block mb-1 opacity-80">
                  Overall Change
                </span>
                <span className="text-4xl font-black">
                  {latestComparison.formattedOverallChange}
                </span>
                <span className="text-sm block mt-1 opacity-80">
                  {latestComparison.overallChange > 0
                    ? 'Score increased'
                    : latestComparison.overallChange < 0
                    ? 'Score decreased'
                    : 'Score unchanged'}
                </span>
              </div>
            </div>

            {/* Domain-by-Domain Changes */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Domain-by-Domain Changes:
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                {latestComparison.domainComparisons.map((dom) => (
                  <div
                    key={dom.key}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-700 block text-xs">
                        {dom.label}
                      </span>
                      <span className="text-xs text-slate-400">
                        {dom.previous}% → {dom.current}%
                      </span>
                    </div>
                    <span
                      className={`font-black text-base px-2.5 py-0.5 rounded-lg ${
                        dom.diff > 0
                          ? 'bg-emerald-100 text-emerald-800'
                          : dom.diff < 0
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {dom.formattedDiff}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Safety Reminder */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-950 text-xs sm:text-sm flex items-start gap-3">
              <Shield className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Important Interpretation Context:</p>
                <p className="mt-0.5">
                  Changes between screenings can be influenced by sleep, stress, practice, attention, mood, and many other factors. This screening is not a medical diagnosis. Do NOT interpret improvement or decline as proof of Alzheimer&apos;s disease, dementia, or disease progression.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* LOADING OR EMPTY OR CONTENT */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500 font-bold text-base">Loading your screening history...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 text-center max-w-lg mx-auto space-y-4">
            <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
            <h3 className="text-lg font-bold text-rose-900">{error}</h3>
            <button
              type="button"
              onClick={loadHistory}
              className="px-6 py-2.5 bg-rose-600 text-white font-bold rounded-xl text-sm"
            >
              Try Again
            </button>
          </div>
        ) : history.length === 0 ? (
          /* NO RECORDS AND NOT AUTHENTICATED: Show Login or start screening */
          !isAuthenticated ? (
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm max-w-xl mx-auto space-y-6">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto">
                  <Lock className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-black text-slate-900">
                  Log In to View Your History
                </h2>
                <p className="text-sm text-slate-500">
                  Enter your screening account credentials to access your saved assessment records.
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:border-blue-600 focus:outline-none text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Your password"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:border-blue-600 focus:outline-none text-sm font-semibold"
                  />
                </div>

                {loginError && (
                  <p className="text-xs font-bold text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-200">
                    {loginError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-2xl text-base shadow-md transition"
                >
                  {loginLoading ? 'Logging In...' : 'Log In to Screening Profile'}
                </button>
              </form>

              <div className="text-center pt-2 border-t border-slate-100 space-y-2">
                <p className="text-xs text-slate-500">
                  Don&apos;t have an account?{' '}
                  <Link
                    to="/cognitive-screening"
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Take a screening now
                  </Link>{' '}
                  to create one!
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-lg mx-auto space-y-4 shadow-sm">
              <History className="w-14 h-14 text-slate-300 mx-auto" />
              <h3 className="text-2xl font-black text-slate-800">
                No Past Screenings Yet
              </h3>
              <p className="text-sm text-slate-500">
                You haven&apos;t recorded any cognitive screenings with this account yet.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleRetakeScreening}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-base shadow-md transition"
                >
                  <span>Start Your First Screening</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )
        ) : (
          <div className="space-y-10">
            {/* Simple Trend Visualization (SVG-based for complete zero-dependency resilience) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    Screening Performance Over Time
                  </h2>
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {history.length} Assessment{history.length > 1 ? 's' : ''} Logged
                </span>
              </div>

              {/* Trend Chart (rendered from chronological points, oldest to newest) */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 overflow-x-auto">
                <div className="min-w-[500px] h-48 flex items-end justify-between gap-4 px-6 pt-6 pb-2">
                  {[...history].reverse().map((item, idx) => {
                    const score = Number(item.overallScore) || 0;
                    const dateStr = new Date(item.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    });
                    const heightPercent = Math.max(15, Math.min(100, score));

                    return (
                      <div
                        key={item._id || idx}
                        onClick={() => setSelectedRecord(item)}
                        className="flex-1 flex flex-col items-center gap-2 group cursor-pointer"
                        title="Click to view details"
                      >
                        <span className="text-xs font-black text-slate-700 group-hover:text-blue-600 transition">
                          {score}
                        </span>
                        <div className="w-full max-w-[40px] bg-slate-200 rounded-t-xl h-36 flex items-end overflow-hidden group-hover:ring-2 group-hover:ring-blue-400 transition">
                          <div
                            className={`w-full rounded-t-xl transition-all duration-500 ${
                              score >= 75
                                ? 'bg-emerald-500'
                                : score >= 50
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ height: `${heightPercent}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-slate-400 group-hover:text-slate-700 transition">
                          {dateStr}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* List of Chronological Historical Screenings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    Chronological Screening Records
                  </h3>
                  <p className="text-xs text-slate-500">
                    Click any record to inspect individual domain scores and comparison details.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleRetakeScreening}
                  className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retake Screening</span>
                </button>
              </div>

              <div className="space-y-4">
                {history.map((record, index) => {
                  const badge = getRiskBadgeConfig(record.riskIndicator);
                  const date = new Date(record.createdAt).toLocaleDateString(undefined, {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });
                  const isLatest = index === 0;

                  return (
                    <div
                      key={record._id || index}
                      className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-5 hover:border-slate-300 transition"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-black text-xl">
                            {record.overallScore}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-black text-slate-900">
                                Score: {record.overallScore} / 100
                              </span>
                              {isLatest && (
                                <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-600 text-white uppercase">
                                  Latest
                                </span>
                              )}
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${badge.bg}`}
                              >
                                {record.riskIndicator}
                              </span>
                            </div>
                            <span className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3.5 h-3.5" />
                              {date}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
                            Age: {record.age} • Lang: {record.language}
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedRecord(record)}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold rounded-xl transition flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Details</span>
                          </button>
                        </div>
                      </div>

                      {/* Domain Scores Bar Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-slate-400 block font-semibold">Memory</span>
                          <span className="text-base font-extrabold text-slate-800">
                            {record.memoryScore}%
                          </span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-slate-400 block font-semibold">Delayed Recall</span>
                          <span className="text-base font-extrabold text-slate-800">
                            {record.delayedRecallScore}%
                          </span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-slate-400 block font-semibold">Attention</span>
                          <span className="text-base font-extrabold text-slate-800">
                            {record.attentionScore}%
                          </span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-slate-400 block font-semibold">Orientation</span>
                          <span className="text-base font-extrabold text-slate-800">
                            {record.orientationScore}%
                          </span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-slate-400 block font-semibold">Language</span>
                          <span className="text-base font-extrabold text-slate-800">
                            {record.languageScore}%
                          </span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-slate-400 block font-semibold">Reasoning</span>
                          <span className="text-base font-extrabold text-slate-800">
                            {record.reasoningScore}%
                          </span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-slate-400 block font-semibold">Working Memory</span>
                          <span className="text-base font-extrabold text-slate-800">
                            {record.workingMemoryScore}%
                          </span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-slate-400 block font-semibold">Everyday Life</span>
                          <span className="text-base font-extrabold text-slate-800">
                            {record.dailyLifeScore}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* SELECTED RECORD DETAILS MODAL */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-8 animate-scaleUp">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-black text-2xl">
                  {selectedRecord.overallScore}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    Screening Record Details
                  </h3>
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(selectedRecord.createdAt).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score & Risk Badge */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Overall Score
                </span>
                <span className="text-2xl font-black text-slate-900">
                  {selectedRecord.overallScore} / 100
                </span>
              </div>
              <div>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    getRiskBadgeConfig(selectedRecord.riskIndicator).bg
                  }`}
                >
                  {selectedRecord.riskIndicator}
                </span>
              </div>
            </div>

            {/* Comparison with immediately prior screening if available */}
            {selectedRecordComparison && (
              <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200/90 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800 block">
                  Change from Preceding Screening
                </span>
                <div className="flex items-baseline gap-4">
                  <div>
                    <span className="text-xs text-slate-500 block">Preceding Score</span>
                    <span className="text-lg font-black text-slate-700">
                      {selectedRecordComparison.previousScore}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">This Attempt</span>
                    <span className="text-lg font-black text-teal-900">
                      {selectedRecordComparison.latestScore}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">Difference</span>
                    <span
                      className={`text-lg font-black ${
                        selectedRecordComparison.overallChange > 0
                          ? 'text-emerald-700'
                          : selectedRecordComparison.overallChange < 0
                          ? 'text-amber-700'
                          : 'text-slate-700'
                      }`}
                    >
                      {selectedRecordComparison.formattedOverallChange}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 8 Domains breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Cognitive Domain Breakdown:
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { name: 'Immediate Memory', val: selectedRecord.memoryScore },
                  { name: 'Delayed Recall', val: selectedRecord.delayedRecallScore },
                  { name: 'Attention & Focus', val: selectedRecord.attentionScore },
                  { name: 'Orientation', val: selectedRecord.orientationScore },
                  { name: 'Language / Fluency', val: selectedRecord.languageScore },
                  { name: 'Pattern Reasoning', val: selectedRecord.reasoningScore },
                  { name: 'Working Memory', val: selectedRecord.workingMemoryScore },
                  { name: 'Everyday Routine', val: selectedRecord.dailyLifeScore },
                ].map((dom) => (
                  <div
                    key={dom.name}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                  >
                    <span className="text-xs font-bold text-slate-700">{dom.name}</span>
                    <span className="text-sm font-black text-slate-900">{dom.val}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Context Demographics */}
            <div className="p-3.5 rounded-xl bg-slate-50 text-xs text-slate-500 border border-slate-200">
              <strong>Demographics recorded:</strong> Age: {selectedRecord.age} • Language:{' '}
              {selectedRecord.language} • Education: {selectedRecord.educationLevel}
            </div>

            {/* Disclaimer */}
            <div className="text-xs text-slate-400 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
              * Non-diagnostic assessment for educational and demonstration purposes. Does not constitute a clinical diagnosis of Alzheimer&apos;s or dementia.
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScreeningHistoryPage;
