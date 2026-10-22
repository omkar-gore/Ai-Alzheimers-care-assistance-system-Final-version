import React, { useState } from 'react';
import { History, CheckCircle2, ArrowRight, X, AlertCircle } from 'lucide-react';
import { normalizeString } from '../../../utils/screeningScoring';

const DelayedRecallActivity = ({ wordSet, onComplete, initialAnswers = [] }) => {
  const [currentInput, setCurrentInput] = useState('');
  const [recalledWords, setRecalledWords] = useState(initialAnswers);
  const [inputError, setInputError] = useState('');

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
    let finalWords = [...recalledWords];
    if (currentInput.trim()) {
      const trimmed = currentInput.trim();
      const normalized = normalizeString(trimmed);
      if (!finalWords.some((w) => normalizeString(w) === normalized)) {
        finalWords.push(trimmed);
      }
    }

    onComplete({ delayedRecalledWords: finalWords });
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80">
      <div className="mb-6 pb-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-violet-100 text-violet-800 mb-2">
            Final Activity • Delayed Recall
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Word Recall — Delayed Memory
          </h2>
        </div>
      </div>

      <div className="bg-violet-50/80 border border-violet-200/80 rounded-2xl p-5 text-violet-950 text-base sm:text-lg mb-8">
        <p className="font-bold flex items-center gap-2 text-violet-900">
          <History className="w-5 h-5 text-violet-700 shrink-0" />
          Instructions:
        </p>
        <p className="mt-1">
          Near the beginning of this screening (Activity A), you were shown a list of <strong>5 words</strong> to remember. Please enter as many of those original 5 words as you can recall now.
        </p>
      </div>

      <div className="space-y-6">
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
              placeholder="Type a word from earlier and press Add..."
              className="flex-1 px-5 py-4 text-xl font-medium border-2 border-slate-300 rounded-2xl focus:border-violet-600 focus:outline-none transition"
            />
            <button
              type="submit"
              className="px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-bold text-lg transition"
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

        {/* List of delayed words */}
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
            Delayed memory recall is normal to vary. Enter whatever you can remember.
          </p>
          <button
            type="button"
            onClick={handleFinish}
            className="w-full sm:w-auto px-10 py-4 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-bold text-lg shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
          >
            <span>Finish Screening & View Results</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DelayedRecallActivity;
