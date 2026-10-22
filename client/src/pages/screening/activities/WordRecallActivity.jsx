import React, { useState, useEffect } from 'react';
import { Eye, Clock, CheckCircle2, AlertCircle, ArrowRight, X } from 'lucide-react';
import { normalizeString } from '../../../utils/screeningScoring';

const WordRecallActivity = ({ wordSet, onComplete, initialAnswers = [] }) => {
  // Phase: 'memorize' | 'recall'
  const [phase, setPhase] = useState('memorize');
  const [memorizeTimer, setMemorizeTimer] = useState(15);
  const [currentInput, setCurrentInput] = useState('');
  const [recalledWords, setRecalledWords] = useState(initialAnswers);
  const [inputError, setInputError] = useState('');

  // Countdown timer for memorization phase
  useEffect(() => {
    if (phase !== 'memorize') return;

    if (memorizeTimer <= 0) {
      setPhase('recall');
      return;
    }

    const interval = setInterval(() => {
      setMemorizeTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, memorizeTimer]);

  const handleStartRecall = () => {
    setPhase('recall');
  };

  const handleAddWord = (e) => {
    if (e) e.preventDefault();
    const trimmed = currentInput.trim();
    if (!trimmed) return;

    const normalized = normalizeString(trimmed);
    const isAlreadyAdded = recalledWords.some((w) => normalizeString(w) === normalized);

    if (isAlreadyAdded) {
      setInputError(`"${trimmed}" is already on your list.`);
      return;
    }

    setRecalledWords([...recalledWords, trimmed]);
    setCurrentInput('');
    setInputError('');
  };

  const handleRemoveWord = (indexToRemove) => {
    setRecalledWords(recalledWords.filter((_, idx) => idx !== indexToRemove));
  };

  const handleFinish = () => {
    // If user has text in the input box, add it first
    let finalWords = [...recalledWords];
    if (currentInput.trim()) {
      const trimmed = currentInput.trim();
      const normalized = normalizeString(trimmed);
      if (!finalWords.some((w) => normalizeString(w) === normalized)) {
        finalWords.push(trimmed);
      }
    }
    onComplete({ immediateRecalledWords: finalWords });
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80">
      <div className="mb-6 pb-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-blue-100 text-blue-800 mb-2">
            Activity A • Memory
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Word Recall — Immediate Memory
          </h2>
        </div>
        {phase === 'memorize' && (
          <div className="flex items-center gap-2 bg-blue-50 text-blue-800 px-4 py-2 rounded-2xl font-bold text-sm">
            <Clock className="w-4 h-4 text-blue-600 animate-spin" />
            <span>Time to memorize: {memorizeTimer}s</span>
          </div>
        )}
      </div>

      {phase === 'memorize' ? (
        <div className="space-y-6">
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-5 text-amber-900 text-base sm:text-lg">
            <p className="font-semibold flex items-center gap-2">
              <Eye className="w-5 h-5 text-amber-700 shrink-0" />
              Instruction:
            </p>
            <p className="mt-1">
              Read and memorize these <strong>5 words</strong> carefully. You will be asked to recall them right away, and again later in the screening.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 py-4">
            {wordSet.map((word, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200/90 rounded-2xl p-5 text-center shadow-sm hover:border-blue-400 transition"
              >
                <span className="text-xs font-bold text-blue-500 uppercase tracking-wider block mb-1">
                  Word {idx + 1}
                </span>
                <span className="text-2xl sm:text-3xl font-black text-slate-800 tracking-wider">
                  {word}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <span className="text-sm text-slate-500 font-medium">
              Screen will advance automatically in {memorizeTimer}s, or you can proceed when ready.
            </span>
            <button
              type="button"
              onClick={handleStartRecall}
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
            >
              <span>I Have Memorized Them</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-blue-950 text-base sm:text-lg">
            <p className="font-bold flex items-center gap-2 text-blue-900">
              <CheckCircle2 className="w-5 h-5 text-blue-700 shrink-0" />
              Recall Phase:
            </p>
            <p className="mt-1">
              Please enter as many of the 5 words as you can remember. Type one word at a time and press <strong>Add</strong> or hit <strong>Enter</strong>.
            </p>
          </div>

          <form onSubmit={handleAddWord} className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                autoFocus
                value={currentInput}
                onChange={(e) => {
                  setCurrentInput(e.target.value);
                  setInputError('');
                }}
                placeholder="Type a word here (e.g. APPLE)..."
                className="flex-1 px-5 py-4 text-xl font-medium border-2 border-slate-300 rounded-2xl focus:border-blue-600 focus:outline-none transition"
              />
              <button
                type="submit"
                className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-lg transition"
              >
                Add Word
              </button>
            </div>
            {inputError && (
              <p className="text-sm font-semibold text-rose-600 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {inputError}
              </p>
            )}
          </form>

          {/* List of recalled words */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">
              Words you have recalled ({recalledWords.length} of 5):
            </h4>
            {recalledWords.length === 0 ? (
              <p className="text-slate-400 italic text-base">
                No words entered yet. Type words above to add them to your recall list.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2.5">
                {recalledWords.map((word, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 bg-white border border-slate-300 px-4 py-2 rounded-xl text-base font-bold text-slate-800 shadow-sm"
                  >
                    <span>{word.toUpperCase()}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveWord(idx)}
                      className="text-slate-400 hover:text-rose-600 rounded-full p-0.5 transition"
                      aria-label="Remove word"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Try your best. It is okay if you cannot recall all 5 words.
            </p>
            <button
              type="button"
              onClick={handleFinish}
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
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

export default WordRecallActivity;
