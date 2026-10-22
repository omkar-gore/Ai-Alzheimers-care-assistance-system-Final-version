import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Brain,
  Shield,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import ScreeningHeader from './components/ScreeningHeader';
import WordRecallActivity from './activities/WordRecallActivity';
import SequenceMemoryActivity from './activities/SequenceMemoryActivity';
import AttentionActivity from './activities/AttentionActivity';
import OrientationActivity from './activities/OrientationActivity';
import LanguageFluencyActivity from './activities/LanguageFluencyActivity';
import ReasoningActivity from './activities/ReasoningActivity';
import DailyLifeActivity from './activities/DailyLifeActivity';
import WorkingMemoryActivity from './activities/WorkingMemoryActivity';
import DelayedRecallActivity from './activities/DelayedRecallActivity';

import {
  WORD_POOLS,
  MEDICAL_DISCLAIMERS,
  calculateScreeningScore,
} from '../../utils/screeningScoring';
import { submitScreening } from '../../services/screeningService';

const SESSION_STORAGE_KEY = 'caremate_screening_active_session';
const RESULT_STORAGE_KEY = 'caremate_screening_last_result';
const PREVIOUS_RESULT_STORAGE_KEY = 'caremate_screening_previous_result';
const SESSION_HISTORY_STORAGE_KEY = 'caremate_screening_session_history';

// Screening flow steps
const STEPS = [
  { id: 'welcome', label: 'Welcome' },
  { id: 'basic_info', label: 'Basic Info' },
  { id: 'intro_consent', label: 'Introduction' },
  { id: 'word_recall', label: 'Immediate Memory' },
  { id: 'sequence_memory', label: 'Sequence Memory' },
  { id: 'attention', label: 'Attention Test' },
  { id: 'orientation', label: 'Orientation' },
  { id: 'language_fluency', label: 'Language Fluency' },
  { id: 'reasoning', label: 'Reasoning' },
  { id: 'daily_life', label: 'Everyday Cognitive' },
  { id: 'working_memory', label: 'Working Memory' },
  { id: 'delayed_recall', label: 'Delayed Recall' },
];

const createNewSession = (preservedDemographics = null) => {
  const randomPoolIndex = Math.floor(Math.random() * WORD_POOLS.length);
  return {
    stepIndex: 0,
    anonymousSessionId: 'anon_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
    demographics: preservedDemographics || {
      age: '',
      educationLevel: 'High School',
      language: 'English',
    },
    wordSet: WORD_POOLS[randomPoolIndex],
    answers: {
      immediateRecalledWords: [],
      sequenceResults: {},
      attentionMetrics: {},
      orientationAnswers: {},
      fluencyWords: [],
      reasoningAnswers: {},
      dailyLifeAnswers: {},
      workingMemoryResult: {},
      delayedRecalledWords: [],
    },
  };
};

const CognitiveScreeningPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Load or initialize session state
  const [sessionState, setSessionState] = useState(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }

    // Default fresh session
    return createNewSession();
  });

  // Handle explicit retake request via URL query parameter
  useEffect(() => {
    if (searchParams.get('retake') === 'true') {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      const fresh = createNewSession(
        sessionState.demographics.age ? sessionState.demographics : null
      );
      setSessionState(fresh);
      try {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(fresh));
      } catch (e) {
        console.warn('Storage error on retake:', e);
      }
      setSearchParams({}, { replace: true });
    }
  }, [searchParams]);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Persist session state on updates
  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionState));
    } catch (e) {
      console.warn('SessionStorage error:', e);
    }
  }, [sessionState]);

  const currentStep = STEPS[sessionState.stepIndex] || STEPS[0];

  const updateDemographics = (field, value) => {
    setSessionState((prev) => ({
      ...prev,
      demographics: {
        ...prev.demographics,
        [field]: value,
      },
    }));
  };

  const nextStep = () => {
    setSessionState((prev) => ({
      ...prev,
      stepIndex: Math.min(prev.stepIndex + 1, STEPS.length - 1),
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
    setSessionState((prev) => ({
      ...prev,
      stepIndex: Math.max(prev.stepIndex - 1, 0),
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Activity completion handler
  const handleActivityComplete = (activityData) => {
    setSessionState((prev) => {
      const updatedAnswers = {
        ...prev.answers,
        ...activityData,
      };

      // If completing the final activity (Delayed Recall), automatically trigger finish
      if (activityData.delayedRecalledWords !== undefined) {
        handleFinalSubmit({
          ...prev,
          answers: updatedAnswers,
        });
        return {
          ...prev,
          answers: updatedAnswers,
        };
      }

      return {
        ...prev,
        stepIndex: prev.stepIndex + 1,
        answers: updatedAnswers,
      };
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Final submission and score computation
  const handleFinalSubmit = async (latestState) => {
    const stateToProcess = latestState || sessionState;
    setSubmitting(true);
    setSubmitError('');

    const payload = {
      age: Number(stateToProcess.demographics.age) || 50,
      educationLevel: stateToProcess.demographics.educationLevel,
      language: stateToProcess.demographics.language,
      wordSet: stateToProcess.wordSet,
      immediateRecalledWords: stateToProcess.answers.immediateRecalledWords,
      sequenceResults: stateToProcess.answers.sequenceResults,
      attentionMetrics: stateToProcess.answers.attentionMetrics,
      orientationAnswers: stateToProcess.answers.orientationAnswers,
      fluencyWords: stateToProcess.answers.fluencyWords,
      reasoningAnswers: stateToProcess.answers.reasoningAnswers,
      dailyLifeAnswers: stateToProcess.answers.dailyLifeAnswers,
      workingMemoryResult: stateToProcess.answers.workingMemoryResult,
      delayedRecalledWords: stateToProcess.answers.delayedRecalledWords,
      anonymousSessionId: stateToProcess.anonymousSessionId,
    };

    // Calculate scores locally first for absolute instant reliability
    const localResult = calculateScreeningScore(payload);

    let finalResultData = {
      ...localResult,
      demographics: stateToProcess.demographics,
      createdAt: new Date().toISOString(),
    };

    try {
      const serverResponse = await submitScreening(payload);
      if (serverResponse && serverResponse.scores) {
        finalResultData = {
          ...finalResultData,
          screeningId: serverResponse.screeningId,
          scores: serverResponse.scores,
          riskIndicator: serverResponse.riskIndicator,
          strengths: serverResponse.strengths,
          areasToWatch: serverResponse.areasToWatch,
        };
      }
    } catch (err) {
      console.warn('Backend screening API call failed, using local scoring fallback:', err);
      // Fallback works smoothly with local scoring result
    } finally {
      // Save last result in sessionStorage and preserve previous result for comparison
      try {
        const existingLastResult = sessionStorage.getItem(RESULT_STORAGE_KEY);
        if (existingLastResult) {
          sessionStorage.setItem(PREVIOUS_RESULT_STORAGE_KEY, existingLastResult);
        }

        const sessionHistRaw = sessionStorage.getItem(SESSION_HISTORY_STORAGE_KEY);
        const sessionHist = sessionHistRaw ? JSON.parse(sessionHistRaw) : [];
        
        // Remove any prior entry matching this screeningId or timestamp, then prepend latest
        const filteredHist = sessionHist.filter(
          (item) =>
            !(item.screeningId && item.screeningId === finalResultData.screeningId) &&
            item.createdAt !== finalResultData.createdAt
        );
        filteredHist.unshift(finalResultData);

        // If there was an existingLastResult not in filteredHist, ensure it's also preserved
        if (existingLastResult) {
          const parsedExisting = JSON.parse(existingLastResult);
          if (
            !filteredHist.some(
              (item) =>
                (item.screeningId && item.screeningId === parsedExisting.screeningId) ||
                item.createdAt === parsedExisting.createdAt
            )
          ) {
            filteredHist.push(parsedExisting);
          }
        }

        sessionStorage.setItem(SESSION_HISTORY_STORAGE_KEY, JSON.stringify(filteredHist));
        sessionStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(finalResultData));
        // Clear active screening state so user can take a fresh one later
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      } catch (e) {
        console.error('Error saving result storage:', e);
      }

      setSubmitting(false);
      navigate('/cognitive-screening/results');
    }
  };

  // Compute progress for activities (excluding welcome, basic info, and intro)
  const isActivityStep = sessionState.stepIndex >= 3;
  const currentActivityNumber = sessionState.stepIndex - 2;
  const totalActivities = STEPS.length - 3; // 9 main activities
  const progressPercent = Math.round((sessionState.stepIndex / (STEPS.length - 1)) * 100);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <ScreeningHeader />

      {/* Progress & Breadcrumb Bar (Visible once past welcome) */}
      {sessionState.stepIndex > 0 && (
        <div className="bg-white border-b border-slate-200 sticky top-20 z-40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-500">
                {isActivityStep
                  ? `Activity ${currentActivityNumber} of ${totalActivities}`
                  : `Step ${sessionState.stepIndex} of ${STEPS.length - 1}`}
              </span>
              <span className="text-sm font-bold text-slate-800 hidden sm:inline">
                • {currentStep.label}
              </span>
            </div>

            <div className="flex items-center gap-3 w-40 sm:w-60">
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                <div
                  className="bg-gradient-to-r from-blue-600 to-teal-500 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs font-bold text-slate-600 min-w-[36px] text-right">
                {progressPercent}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* ==================================================== */}
        {/* STEP 0: ENTRY / WELCOME PAGE */}
        {/* ==================================================== */}
        {sessionState.stepIndex === 0 && (
          <div className="space-y-8 animate-fadeIn">
            {/* Hero Card */}
            <div className="bg-white rounded-3xl p-8 sm:p-14 shadow-sm border border-slate-200/90 text-center relative overflow-hidden">
              <div className="inline-flex p-4 rounded-3xl bg-blue-50 text-blue-600 mb-6 shadow-inner">
                <Brain className="w-14 h-14" />
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight max-w-2xl mx-auto leading-tight">
                Early Cognitive Screening
              </h1>

              <p className="mt-4 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
                Check your memory, attention, orientation, reasoning and everyday cognitive skills through a short interactive assessment.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={nextStep}
                  className="w-full sm:w-auto px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-extrabold text-lg sm:text-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition flex items-center justify-center gap-3"
                >
                  <span>Start Screening</span>
                  <ArrowRight className="w-6 h-6" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="w-full sm:w-auto px-8 py-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-lg transition flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back to CareMate</span>
                </button>
              </div>

              {/* Quick Perks */}
              <div className="mt-12 pt-8 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">No Account Required</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Take screening anonymously in just 8–10 minutes.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Structured Tasks</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Tested across 8 key cognitive and daily life domains.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Instant Transparent Insights</h3>
                    <p className="text-xs text-slate-500 mt-0.5">View strengths, focus areas, and next-step guidance.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mandatory Medical Safety Disclaimer */}
            <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-6 text-amber-950 flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-sm sm:text-base leading-relaxed">
                <p className="font-bold text-amber-900 mb-1">Important Medical Safety Notice:</p>
                <p>{MEDICAL_DISCLAIMERS.SHORT}</p>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP 1: BASIC INFORMATION */}
        {/* ==================================================== */}
        {sessionState.stepIndex === 1 && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80 space-y-8 animate-fadeIn">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                Step 1 of 2 Before Starting
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                Basic Background Information
              </h2>
              <p className="text-slate-500 text-sm sm:text-base mt-1">
                We only collect minimal demographic information to provide appropriate context for your results.
              </p>
            </div>

            {/* Explanatory disclaimer */}
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-5 text-blue-950 text-sm sm:text-base leading-relaxed">
              <p className="font-semibold text-blue-900 mb-1">Privacy Notice:</p>
              <p>
                The information you provide is used only to help interpret your screening performance. This tool does not provide a medical diagnosis. No email, password, or medical record is required.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!sessionState.demographics.age) {
                  alert('Please enter your age to continue.');
                  return;
                }
                nextStep();
              }}
              className="space-y-6"
            >
              {/* Age */}
              <div>
                <label className="block text-base font-bold text-slate-800 mb-2">
                  1. What is your age? <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="125"
                  required
                  value={sessionState.demographics.age}
                  onChange={(e) => updateDemographics('age', e.target.value)}
                  placeholder="e.g. 64"
                  className="w-full sm:w-48 px-5 py-3.5 text-xl font-bold border-2 border-slate-300 rounded-2xl focus:border-blue-600 focus:outline-none"
                />
              </div>

              {/* Education Level */}
              <div>
                <label className="block text-base font-bold text-slate-800 mb-2">
                  2. Highest level of education completed:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    'Primary / Middle School',
                    'High School',
                    'Some College / Vocational',
                    "Bachelor's Degree",
                    "Master's or Doctorate",
                  ].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => updateDemographics('educationLevel', level)}
                      className={`p-4 rounded-2xl text-left font-bold text-sm sm:text-base transition border-2 ${
                        sessionState.demographics.educationLevel === level
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferred Language */}
              <div>
                <label className="block text-base font-bold text-slate-800 mb-2">
                  3. Preferred language for screening tasks:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl">
                  {['English', 'Hindi', 'Spanish', 'Other'].map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => updateDemographics('language', lang)}
                      className={`py-3.5 px-4 rounded-2xl font-bold text-center text-sm sm:text-base transition border-2 ${
                        sessionState.demographics.language === lang
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3.5 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Back
                </button>

                <button
                  type="submit"
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-md hover:shadow-lg transition flex items-center gap-2"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP 2: SCREENING INTRODUCTION & MANDATORY CONSENT */}
        {/* ==================================================== */}
        {sessionState.stepIndex === 2 && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80 space-y-8 animate-fadeIn">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                Step 2 of 2 Before Starting
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                Screening Instructions & Guidelines
              </h2>
            </div>

            <div className="space-y-4 text-base sm:text-lg text-slate-700 leading-relaxed">
              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <CheckCircle2 className="w-6 h-6 text-teal-600 shrink-0 mt-0.5" />
                <p>
                  You will complete several short activities involving <strong>memory, attention, language, orientation, reasoning, and everyday cognitive skills</strong>.
                </p>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <CheckCircle2 className="w-6 h-6 text-teal-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Try to answer naturally without outside assistance</strong>, notes, or looking at a calendar.
                </p>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <Clock className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Some activities are timed.</strong> Answers are saved automatically as you complete each step.
                </p>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950">
                <AlertTriangle className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
                <p>
                  <strong>Your result is intended only as a screening indicator</strong> and should never be treated as a medical diagnosis or disease staging.
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={prevStep}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Back
              </button>

              <button
                type="button"
                onClick={nextStep}
                className="w-full sm:w-auto px-10 py-5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-black text-lg sm:text-xl shadow-lg hover:shadow-xl transition flex items-center justify-center gap-3"
              >
                <span>I understand and want to continue</span>
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP 3: WORD RECALL (IMMEDIATE) */}
        {/* ==================================================== */}
        {sessionState.stepIndex === 3 && (
          <WordRecallActivity
            wordSet={sessionState.wordSet}
            initialAnswers={sessionState.answers.immediateRecalledWords}
            onComplete={handleActivityComplete}
          />
        )}

        {/* ==================================================== */}
        {/* STEP 4: SEQUENCE MEMORY */}
        {/* ==================================================== */}
        {sessionState.stepIndex === 4 && (
          <SequenceMemoryActivity
            initialResults={sessionState.answers.sequenceResults}
            onComplete={handleActivityComplete}
          />
        )}

        {/* ==================================================== */}
        {/* STEP 5: ATTENTION */}
        {/* ==================================================== */}
        {sessionState.stepIndex === 5 && (
          <AttentionActivity
            onComplete={handleActivityComplete}
          />
        )}

        {/* ==================================================== */}
        {/* STEP 6: ORIENTATION */}
        {/* ==================================================== */}
        {sessionState.stepIndex === 6 && (
          <OrientationActivity
            initialAnswers={sessionState.answers.orientationAnswers}
            onComplete={handleActivityComplete}
          />
        )}

        {/* ==================================================== */}
        {/* STEP 7: LANGUAGE FLUENCY */}
        {/* ==================================================== */}
        {sessionState.stepIndex === 7 && (
          <LanguageFluencyActivity
            initialWords={sessionState.answers.fluencyWords}
            onComplete={handleActivityComplete}
          />
        )}

        {/* ==================================================== */}
        {/* STEP 8: REASONING */}
        {/* ==================================================== */}
        {sessionState.stepIndex === 8 && (
          <ReasoningActivity
            initialAnswers={sessionState.answers.reasoningAnswers}
            onComplete={handleActivityComplete}
          />
        )}

        {/* ==================================================== */}
        {/* STEP 9: DAILY ROUTINE & EVERYDAY COGNITIVE FUNCTION */}
        {/* ==================================================== */}
        {sessionState.stepIndex === 9 && (
          <DailyLifeActivity
            initialAnswers={sessionState.answers.dailyLifeAnswers}
            onComplete={handleActivityComplete}
          />
        )}

        {/* ==================================================== */}
        {/* STEP 10: WORKING MEMORY */}
        {/* ==================================================== */}
        {sessionState.stepIndex === 10 && (
          <WorkingMemoryActivity
            onComplete={handleActivityComplete}
          />
        )}

        {/* ==================================================== */}
        {/* STEP 11: DELAYED WORD RECALL */}
        {/* ==================================================== */}
        {sessionState.stepIndex === 11 && (
          <DelayedRecallActivity
            wordSet={sessionState.wordSet}
            initialAnswers={sessionState.answers.delayedRecalledWords}
            onComplete={handleActivityComplete}
          />
        )}

        {/* Submitting Loading Modal / Spinner */}
        {submitting && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl animate-scaleUp">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <h3 className="text-2xl font-black text-slate-800">
                Calculating Screening Results...
              </h3>
              <p className="text-slate-600 text-sm">
                Evaluating cognitive domains, daily routine responses, and generating risk indicators.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CognitiveScreeningPage;
