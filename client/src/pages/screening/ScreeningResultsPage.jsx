import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Brain,
  Shield,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  UserPlus,
  History,
  LogIn,
  RotateCcw,
  Sparkles,
  Stethoscope,
  Users,
  Heart,
  ChevronRight,
  Lock,
  TrendingUp,
} from 'lucide-react';
import ScreeningHeader from './components/ScreeningHeader';
import {
  MEDICAL_DISCLAIMERS,
  getRiskBadgeConfig,
  calculateScreeningComparison,
} from '../../utils/screeningScoring';
import {
  registerScreeningUser,
  getScreeningHistory,
} from '../../services/screeningService';
import { useAuth } from '../../context/AuthContext';

const RESULT_STORAGE_KEY = 'caremate_screening_last_result';
const PREVIOUS_RESULT_STORAGE_KEY = 'caremate_screening_previous_result';

const ScreeningResultsPage = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const [resultData, setResultData] = useState(() => {
    try {
      const saved = sessionStorage.getItem(RESULT_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [previousResult, setPreviousResult] = useState(() => {
    try {
      const savedPrev = sessionStorage.getItem(PREVIOUS_RESULT_STORAGE_KEY);
      return savedPrev ? JSON.parse(savedPrev) : null;
    } catch {
      return null;
    }
  });

  // Modal for Create Screening Account
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState(false);

  useEffect(() => {
    const fetchComparisonData = async () => {
      if (user && user.role === 'screeningUser') {
        try {
          const hist = await getScreeningHistory();
          if (Array.isArray(hist) && hist.length > 0) {
            if (!resultData) {
              setResultData(hist[0]);
              if (hist.length > 1) {
                setPreviousResult(hist[1]);
              }
            } else {
              const currentId = resultData.screeningId || resultData._id;
              const prior = hist.find(
                (item) =>
                  (currentId && item._id !== currentId) ||
                  (!currentId && item.createdAt !== resultData.createdAt)
              );
              if (prior) {
                setPreviousResult(prior);
              }
            }
          }
        } catch (e) {
          console.warn('Error fetching comparison history:', e);
        }
      }
    };

    fetchComparisonData();
  }, [user]);

  const handleRetakeScreening = () => {
    sessionStorage.removeItem('caremate_screening_active_session');
    navigate('/cognitive-screening?retake=true');
  };

  if (!resultData) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
        <ScreeningHeader />
        <main className="flex-1 max-w-xl mx-auto px-4 py-20 text-center">
          <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto">
              <Brain className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-800">
              No Active Screening Results Found
            </h2>
            <p className="text-slate-600 text-sm">
              You haven&apos;t completed a screening in this session yet, or your previous session has ended.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => navigate('/cognitive-screening')}
                className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition"
              >
                Start New Screening
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition"
              >
                Back to Home
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const {
    scores = {},
    riskIndicator = 'Lower Risk Indicators',
    strengths = [],
    areasToWatch = [],
    demographics = {},
    screeningId,
  } = resultData;

  const riskBadge = getRiskBadgeConfig(riskIndicator);
  const overallScore = Number(scores.overallScore) || 0;
  const comparison = calculateScreeningComparison(resultData, previousResult);

  // Category items breakdown
  const categoryCards = [
    {
      name: 'Memory (Immediate)',
      score: scores.memoryScore ?? 0,
      weight: '20%',
      desc: 'Short-term immediate recall of verbal items',
    },
    {
      name: 'Delayed Recall',
      score: scores.delayedRecallScore ?? 0,
      weight: '15%',
      desc: 'Retrieval of original items after intervening tasks',
    },
    {
      name: 'Attention & Focus',
      score: scores.attentionScore ?? 0,
      weight: '15%',
      desc: 'Sustained focus and target discrimination',
    },
    {
      name: 'Orientation',
      score: scores.orientationScore ?? 0,
      weight: '10%',
      desc: 'Awareness of day, month, year, and time',
    },
    {
      name: 'Language / Fluency',
      score: scores.languageScore ?? 0,
      weight: '10%',
      desc: 'Timed categorical retrieval and vocabulary',
    },
    {
      name: 'Pattern Reasoning',
      score: scores.reasoningScore ?? 0,
      weight: '10%',
      desc: 'Logical sequencing and abstract deduction',
    },
    {
      name: 'Working Memory',
      score: scores.workingMemoryScore ?? 0,
      weight: '10%',
      desc: 'Mental manipulation and ascending reordering',
    },
    {
      name: 'Daily Routine & Life',
      score: scores.dailyLifeScore ?? 0,
      weight: '10%',
      desc: 'Self-reported everyday habits and independence',
    },
  ];

  // Handle register screening account
  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterLoading(true);

    try {
      const res = await registerScreeningUser({
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
        age: demographics.age,
        screeningId: screeningId || undefined,
      });

      if (res.token && res.user) {
        localStorage.setItem('caremate-token', res.token);
        localStorage.setItem('caremate-user', JSON.stringify(res.user));
        setUser(res.user);
        setRegisterSuccess(true);
      }
    } catch (err) {
      setRegisterError(
        err.response?.data?.message || 'Could not create account. Please check details.'
      );
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <ScreeningHeader />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        {/* Header Title & Retake Actions */}
        <div className="text-center space-y-4">
          <span className="inline-block px-3.5 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-blue-100 text-blue-800">
            Assessment Complete
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Your Cognitive Screening Results
          </h1>
          <p className="text-slate-600 text-base max-w-2xl mx-auto">
            A comprehensive breakdown of your performance across cognitive domains, working memory, and everyday routine tasks.
          </p>

          {/* Retake & Previous Results Action Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleRetakeScreening}
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm sm:text-base shadow-md hover:shadow-lg transition flex items-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Retake Screening</span>
            </button>

            {previousResult ? (
              <a
                href="#comparison-section"
                className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-300 rounded-2xl font-bold text-sm sm:text-base shadow-sm transition flex items-center gap-2"
              >
                <TrendingUp className="w-5 h-5 text-teal-600" />
                <span>View Comparison With Previous</span>
              </a>
            ) : (
              <Link
                to="/cognitive-screening/history"
                className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 rounded-2xl font-bold text-sm sm:text-base shadow-sm transition flex items-center gap-2"
              >
                <History className="w-5 h-5 text-slate-500" />
                <span>View Previous Results</span>
              </Link>
            )}
          </div>
        </div>

        {/* Primary Score & Risk Indicator Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/90 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Left: Overall Score Radial / Block */}
          <div className="md:col-span-5 text-center p-6 bg-gradient-to-b from-slate-50 to-blue-50/40 rounded-3xl border border-slate-200 flex flex-col items-center justify-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Cognitive Screening Score
            </span>
            <div className="flex items-baseline justify-center gap-1.5 my-2">
              <span className="text-6xl sm:text-7xl font-black text-slate-900 tracking-tight">
                {overallScore}
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-slate-400">/ 100</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 max-w-[200px] overflow-hidden mt-3">
              <div
                className={`h-3 rounded-full ${riskBadge.bar}`}
                style={{ width: `${overallScore}%` }}
              />
            </div>
            <span className="text-xs text-slate-400 mt-2 font-medium">
              Demo Project Screening Model (0–100)
            </span>
          </div>

          {/* Right: Risk Indicator & Description */}
          <div className="md:col-span-7 space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Overall Screening Result
              </span>
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl font-black text-lg sm:text-xl shadow-sm border border-slate-200/60 mb-2">
                <span className={`w-3.5 h-3.5 rounded-full ${riskBadge.bar}`} />
                <span className="text-slate-900">{riskBadge.title}</span>
              </div>
            </div>

            <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal">
              {riskBadge.explanation}
            </p>

            <div className="text-xs sm:text-sm text-slate-500 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              {riskIndicator === 'Lower Risk Indicators'
                ? 'Your performance was consistent with healthy cognitive patterns across the tasks evaluated.'
                : riskIndicator === 'Some Cognitive Concerns'
                ? 'Your results show some areas that may benefit from further observation or routine cognitive habits.'
                : 'Performance across multiple areas fell below typical screening averages. Further evaluation may be beneficial.'}
            </div>
          </div>
        </div>

        {/* SCORE COMPARISON SECTION (When previous data exists) */}
        {comparison && (
          <div
            id="comparison-section"
            className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border-2 border-teal-200/90 space-y-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-700 block">
                    Retake &amp; Compare Results
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Performance Comparison with Previous Screening
                  </h2>
                </div>
              </div>

              <Link
                to="/cognitive-screening/history"
                className="text-sm font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1.5"
              >
                <History className="w-4 h-4" />
                <span>View Full History</span>
              </Link>
            </div>

            {/* Score Comparison Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Previous Score
                </span>
                <span className="text-4xl font-black text-slate-700">
                  {comparison.previousScore}
                </span>
                <span className="text-sm text-slate-400 block mt-1">
                  {comparison.previousDate
                    ? new Date(comparison.previousDate).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Previous attempt'}
                </span>
              </div>

              <div className="bg-blue-50/70 p-5 rounded-2xl border border-blue-200 text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 block mb-1">
                  Latest Score
                </span>
                <span className="text-4xl font-black text-blue-900">
                  {comparison.latestScore}
                </span>
                <span className="text-sm text-blue-600 block mt-1">
                  {comparison.currentDate
                    ? new Date(comparison.currentDate).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Latest attempt'}
                </span>
              </div>

              <div
                className={`p-5 rounded-2xl border text-center ${
                  comparison.overallChange > 0
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : comparison.overallChange < 0
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <span className="text-xs font-bold uppercase tracking-wider block mb-1 opacity-80">
                  Overall Change
                </span>
                <span className="text-4xl font-black">
                  {comparison.formattedOverallChange}
                </span>
                <span className="text-sm block mt-1 opacity-80">
                  {comparison.overallChange > 0
                    ? 'Score increased'
                    : comparison.overallChange < 0
                    ? 'Score decreased'
                    : 'No change'}
                </span>
              </div>
            </div>

            {/* Domain-by-Domain Changes */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Domain-by-Domain Changes:
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                {comparison.domainComparisons.map((dom) => (
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

            {/* Mandatory Safety Notice on Interpretation */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-950 text-xs sm:text-sm flex items-start gap-3">
              <Shield className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">
                  Important Interpretation Notice:
                </p>
                <p className="mt-0.5">
                  Changes between screenings can be influenced by sleep, stress, practice, attention, mood, and many other factors. This screening is not a medical diagnosis. Do NOT interpret improvement or decline as proof of Alzheimer&apos;s disease, dementia, or disease progression.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Mandatory Medical Disclaimer Box */}
        <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-6 text-amber-950 flex items-start gap-4 shadow-sm">
          <AlertTriangle className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-sm sm:text-base leading-relaxed space-y-1">
            <p className="font-bold text-amber-900">Important Medical Safety Disclaimer:</p>
            <p>{MEDICAL_DISCLAIMERS.SHORT}</p>
            <p className="text-xs text-amber-800 pt-1">
              {MEDICAL_DISCLAIMERS.FULL}
            </p>
          </div>
        </div>

        {/* 8 Detailed Cognitive Domain Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Cognitive Domain Performance Breakdown
            </h2>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              8 Domains Evaluated
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categoryCards.map((item, idx) => {
              const score = item.score;
              const isHigh = score >= 75;
              const isLow = score < 60;

              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-slate-300 transition"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
                      <span>{item.weight} weight</span>
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold ${
                          isHigh
                            ? 'bg-emerald-50 text-emerald-700'
                            : isLow
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {isHigh ? 'Strong' : isLow ? 'Watch' : 'Moderate'}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-base text-slate-800 mt-1">
                      {item.name}
                    </h3>

                    <p className="text-xs text-slate-500 mt-1 leading-snug line-clamp-2">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-baseline justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-500">Domain Score</span>
                      <span className="text-xl font-black text-slate-900">{score}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          score >= 75
                            ? 'bg-emerald-500'
                            : score >= 50
                            ? 'bg-blue-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Strengths & Areas to Pay Attention To */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Areas of Strength */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Areas of Strength</h3>
                <p className="text-xs text-slate-500">Domains where performance met or exceeded expectations</p>
              </div>
            </div>

            {strengths.length > 0 ? (
              <ul className="space-y-2.5 pt-2">
                {strengths.map((s, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2.5 text-base font-bold text-slate-800 bg-emerald-50/60 p-3 rounded-xl border border-emerald-100"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500 italic pt-2">
                No specific domain scored above the high threshold on this attempt. Routine cognitive exercises can help bolster everyday skills.
              </p>
            )}
          </div>

          {/* Areas to Pay Attention To */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Areas to Pay Attention To</h3>
                <p className="text-xs text-slate-500">Domains showing lower scores or greater variability</p>
              </div>
            </div>

            {areasToWatch.length > 0 ? (
              <ul className="space-y-2.5 pt-2">
                {areasToWatch.map((w, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2.5 text-base font-bold text-slate-800 bg-amber-50/60 p-3 rounded-xl border border-amber-100"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500 italic pt-2">
                No specific domain showed substantial deficit. Continue engaging in healthy cognitive, physical, and social habits.
              </p>
            )}
          </div>
        </div>

        {/* Recommended Next Steps */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-blue-600" />
            Recommended Next Steps
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">General Guidance</span>
              <p className="text-base font-bold text-slate-800">
                Consider discussing persistent memory or cognitive concerns with a qualified healthcare professional.
              </p>
              <p className="text-xs text-slate-600">
                A primary care physician or neurologist can conduct formal neuropsychological testing and review medical history.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700">Acute Notice</span>
              <p className="text-base font-bold text-slate-800">
                Emergency symptoms or sudden confusion require immediate medical attention.
              </p>
              <p className="text-xs text-slate-600">
                Acute changes in alertness, speech, or sudden memory loss are not part of routine screening and warrant urgent care.
              </p>
            </div>
          </div>
        </div>

        {/* Save History & Screening Account Section */}
        {!user || user.role !== 'screeningUser' ? (
          <div className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white rounded-3xl p-8 sm:p-12 shadow-lg space-y-6">
            <div className="max-w-2xl">
              <span className="text-xs font-black uppercase tracking-widest text-blue-300 bg-blue-800/60 px-3 py-1 rounded-full">
                Track Progress Over Time
              </span>
              <h2 className="text-2xl sm:text-3xl font-black mt-3">
                Want to save your screening history?
              </h2>
              <p className="text-blue-100 text-sm sm:text-base mt-2 leading-relaxed">
                Create a dedicated <strong>Screening Account</strong> to store this screening result, monitor score patterns across months, and view long-term performance graphs.
              </p>
              <p className="text-xs text-blue-200 mt-2 italic">
                * A Screening Account does not convert you into a clinical patient and does not assign doctors or caregivers.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                type="button"
                onClick={() => setShowRegisterModal(true)}
                className="px-8 py-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black rounded-2xl text-base shadow-md transition flex items-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                <span>Create Screening Account</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/cognitive-screening')}
                className="px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl text-base transition flex items-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Retake Screening</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-emerald-950">
                Screening Saved to Your Account
              </h3>
              <p className="text-sm text-emerald-800 mt-1">
                This result has been safely associated with your Screening User profile.
              </p>
            </div>
            <Link
              to="/cognitive-screening/history"
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition flex items-center gap-2 shrink-0"
            >
              <History className="w-5 h-5" />
              <span>View Screening History</span>
            </Link>
          </div>
        )}

        {/* Existing CareMate Portals Navigation */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4 text-center">
          <h3 className="text-lg font-bold text-slate-800">
            Already using CareMate?
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
            Existing Patients, Caregivers, and Doctors can log in to access their clinical and daily care dashboards.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              to="/auth/patient/login"
              className="px-5 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-sm transition flex items-center gap-1.5"
            >
              <Heart className="w-4 h-4" />
              <span>Patient Login</span>
            </Link>
            <Link
              to="/auth/caregiver/login"
              className="px-5 py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold text-sm transition flex items-center gap-1.5"
            >
              <Users className="w-4 h-4" />
              <span>Caregiver Login</span>
            </Link>
            <Link
              to="/auth/doctor/login"
              className="px-5 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-sm transition flex items-center gap-1.5"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Doctor Login</span>
            </Link>
          </div>
        </div>
      </main>

      {/* CREATE SCREENING ACCOUNT MODAL */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <UserPlus className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                Create Screening Account
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Save your screening scores and track performance over time.
              </p>
            </div>

            {registerSuccess ? (
              <div className="text-center space-y-4 py-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-slate-900">
                  Account Created Successfully!
                </h4>
                <p className="text-sm text-slate-600">
                  Your screening result has been linked to your new account.
                </p>
                <div className="pt-2">
                  <Link
                    to="/cognitive-screening/history"
                    className="w-full inline-flex justify-center px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition"
                  >
                    View My Screening History
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    placeholder="e.g. Eleanor Vance"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:border-blue-600 focus:outline-none text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
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
                    minLength="6"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    placeholder="At least 6 characters"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:border-blue-600 focus:outline-none text-sm font-semibold"
                  />
                </div>

                {registerError && (
                  <p className="text-xs font-bold text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-200">
                    {registerError}
                  </p>
                )}

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowRegisterModal(false)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={registerLoading}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition"
                  >
                    {registerLoading ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScreeningResultsPage;
