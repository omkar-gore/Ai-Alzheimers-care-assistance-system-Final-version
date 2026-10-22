import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Clock, Play, ArrowRight, X, AlertCircle } from 'lucide-react';
import { FLUENCY_CATEGORIES, normalizeString } from '../../../utils/screeningScoring';

const FLUENCY_DURATION_SEC = 60;

const LanguageFluencyActivity = ({ onComplete, initialWords = [] }) => {
  // Pick one fluency category (stable for the session)
  const [category] = useState(() => FLUENCY_CATEGORIES[0]);
  const [stage, setStage] = useState('ready'); // 'ready' | 'running' | 'timesUp'
  const [timeLeft, setTimeLeft] = useState(FLUENCY_DURATION_SEC);
  const [currentWord, setCurrentWord] = useState('');
  const [wordList, setWordList] = useState(initialWords);
  const [duplicateWarning, setDuplicateWarning] = useState('');

  const wordListRef = useRef(initialWords);
  wordListRef.current = wordList;

  // 60-second countdown
  useEffect(() => {
    if (stage !== 'running') return;

    if (timeLeft <= 0) {
      setStage('timesUp');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [stage, timeLeft]);

  const handleStart = () => {
    setStage('running');
    setTimeLeft(FLUENCY_DURATION_SEC);
  };

  const handleAddWord = (e) => {
    if (e) e.preventDefault();
    const trimmed = currentWord.trim();
    if (!trimmed) return;

    const normalized = normalizeString(trimmed);
    const isDuplicate = wordList.some((w) => normalizeString(w) === normalized);

    if (isDuplicate) {
      setDuplicateWarning(`"${trimmed}" was already added.`);
      return;
    }

    const updated = [...wordList, trimmed];
    setWordList(updated);
    wordListRef.current = updated;
    setCurrentWord('');
    setDuplicateWarning('');
  };

  const handleRemoveWord = (index) => {
    const updated = wordList.filter((_, idx) => idx !== index);
    setWordList(updated);
    wordListRef.current = updated;
  };

  const handleComplete = () => {
    // Collect any unsubmitted text in the input
    let finalWords = [...wordListRef.current];
    if (currentWord.trim()) {
      const normalized = normalizeString(currentWord.trim());
      if (!finalWords.some((w) => normalizeString(w) === normalized)) {
        finalWords.push(currentWord.trim());
      }
    }

    onComplete({
      fluencyWords: finalWords,
    });
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80">
      <div className="mb-6 pb-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-sky-100 text-sky-800 mb-2">
            Activity E • Language
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Word Fluency & Categorical Retrieval
          </h2>
        </div>
        {stage === 'running' && (
          <div
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-lg transition ${
              timeLeft <= 10
                ? 'bg-rose-100 text-rose-700 animate-pulse'
                : 'bg-sky-50 text-sky-800'
            }`}
          >
            <Clock className="w-5 h-5" />
            <span>{timeLeft}s</span>
          </div>
        )}
      </div>

      {/* Instruction block */}
      <div className="bg-sky-50/80 border border-sky-200/80 rounded-2xl p-5 text-sky-950 text-base sm:text-lg mb-6">
        <p className="font-bold flex items-center gap-2 text-sky-900">
          <MessageSquare className="w-5 h-5 text-sky-700 shrink-0" />
          Task Topic:
        </p>
        <p className="mt-1 font-semibold text-xl text-sky-950">
          &quot;{category.topic}&quot;
        </p>
        <p className="mt-1 text-slate-700">
          {category.prompt} Type one word at a time and press <strong>Add</strong> or <strong>Enter</strong>.
        </p>
      </div>

      {/* STAGE: READY */}
      {stage === 'ready' && (
        <div className="text-center py-10 space-y-6">
          <div className="inline-flex p-6 rounded-3xl bg-sky-50 text-sky-600 mb-2">
            <MessageSquare className="w-16 h-16" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800">
            60-Second Verbal / Word Fluency
          </h3>
          <p className="text-slate-600 max-w-lg mx-auto text-base">
            When you press Start, a 60-second timer will begin. Enter as many items belonging to the category (e.g., Apple, Carrot, Mango, Onion) as you can think of.
          </p>
          <button
            type="button"
            onClick={handleStart}
            className="px-10 py-5 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl font-extrabold text-xl shadow-lg hover:shadow-xl transition inline-flex items-center gap-3"
          >
            <Play className="w-6 h-6 fill-current" />
            <span>Start 60-Second Timer</span>
          </button>
        </div>
      )}

      {/* STAGE: RUNNING */}
      {stage === 'running' && (
        <div className="space-y-6">
          <form onSubmit={handleAddWord} className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                autoFocus
                value={currentWord}
                onChange={(e) => {
                  setCurrentWord(e.target.value);
                  setDuplicateWarning('');
                }}
                placeholder="Type a fruit or vegetable and hit Enter..."
                className="flex-1 px-5 py-4 text-xl font-medium border-2 border-slate-300 rounded-2xl focus:border-sky-600 focus:outline-none transition"
              />
              <button
                type="submit"
                className="px-8 py-4 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl font-bold text-lg transition shrink-0"
              >
                Add Word
              </button>
            </div>
            {duplicateWarning && (
              <p className="text-sm font-semibold text-amber-600 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {duplicateWarning}
              </p>
            )}
          </form>

          {/* List of entered words */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 min-h-[120px]">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                Words entered: <span className="text-sky-700 font-extrabold">{wordList.length}</span>
              </h4>
              <span className="text-xs text-slate-400">
                Spelling variations are accepted
              </span>
            </div>

            {wordList.length === 0 ? (
              <p className="text-slate-400 italic text-base">
                Start typing words above...
              </p>
            ) : (
              <div className="flex flex-wrap gap-2.5 max-h-56 overflow-y-auto">
                {wordList.map((word, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 bg-white border border-slate-300 px-3.5 py-1.5 rounded-xl text-base font-bold text-slate-800 shadow-sm"
                  >
                    <span>{word}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveWord(idx)}
                      className="text-slate-400 hover:text-rose-600 transition"
                      aria-label="Remove word"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <span className="text-sm text-slate-500">
              Take your time. You can also click &quot;Finish Early&quot; if you have named all you can think of.
            </span>
            <button
              type="button"
              onClick={() => setStage('timesUp')}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition"
            >
              Finish Early
            </button>
          </div>
        </div>
      )}

      {/* STAGE: TIMES UP */}
      {stage === 'timesUp' && (
        <div className="text-center py-8 space-y-6">
          <div className="inline-flex p-6 rounded-3xl bg-sky-100 text-sky-700">
            <Clock className="w-16 h-16" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">
              Time Complete!
            </h3>
            <p className="mt-2 text-slate-600 text-base">
              You entered <strong>{wordList.length}</strong> unique items for this category. All answers have been safely saved.
            </p>
          </div>

          <div className="pt-4">
            <button
              type="button"
              onClick={handleComplete}
              className="px-10 py-4 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl font-bold text-lg shadow-md hover:shadow-lg transition inline-flex items-center gap-2"
            >
              <span>Continue to Next Activity</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageFluencyActivity;
