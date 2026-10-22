import React, { useState, useEffect } from 'react';
import { ArrowUpNarrowWide, Play, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

const WM_ROUNDS = [
  { round: 1, numbers: [7, 2, 5], targetAscending: [2, 5, 7], displayTime: 4 },
  { round: 2, numbers: [8, 3, 6, 1], targetAscending: [1, 3, 6, 8], displayTime: 5 },
  { round: 3, numbers: [9, 2, 4, 7, 1], targetAscending: [1, 2, 4, 7, 9], displayTime: 6 },
];

const WorkingMemoryActivity = ({ onComplete }) => {
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [stage, setStage] = useState('ready'); // 'ready' | 'showing' | 'input' | 'feedback'
  const [countdown, setCountdown] = useState(0);
  const [enteredNumbers, setEnteredNumbers] = useState([]);
  const [roundResults, setRoundResults] = useState([]);
  const [feedback, setFeedback] = useState(null);

  const currentRound = WM_ROUNDS[currentRoundIdx];

  useEffect(() => {
    if (stage !== 'showing') return;

    if (countdown <= 0) {
      setStage('input');
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [stage, countdown]);

  const handleStartRound = () => {
    setEnteredNumbers([]);
    setFeedback(null);
    setCountdown(currentRound.displayTime);
    setStage('showing');
  };

  const handleSelectNumber = (num) => {
    if (enteredNumbers.length < currentRound.numbers.length) {
      setEnteredNumbers([...enteredNumbers, num]);
    }
  };

  const handleRemoveNumber = (idx) => {
    setEnteredNumbers(enteredNumbers.filter((_, i) => i !== idx));
  };

  const handleClear = () => {
    setEnteredNumbers([]);
  };

  const handleSubmit = () => {
    const expectedStr = currentRound.targetAscending.join(',');
    const enteredStr = enteredNumbers.join(',');
    const isCorrect = expectedStr === enteredStr;

    const res = {
      round: currentRound.round,
      original: currentRound.numbers,
      expected: currentRound.targetAscending,
      entered: enteredNumbers,
      isCorrect,
    };

    const updated = [...roundResults, res];
    setRoundResults(updated);
    setFeedback(res);
    setStage('feedback');
  };

  const handleNextRound = () => {
    if (currentRoundIdx + 1 < WM_ROUNDS.length) {
      setCurrentRoundIdx(currentRoundIdx + 1);
      setEnteredNumbers([]);
      setFeedback(null);
      setStage('ready');
    } else {
      // Completed all rounds
      const correctCount = roundResults.filter((r) => r.isCorrect).length;
      const accuracy = Math.round((correctCount / WM_ROUNDS.length) * 100);

      onComplete({
        workingMemoryResult: {
          roundResults,
          correctCount,
          totalRounds: WM_ROUNDS.length,
          accuracy,
        },
      });
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80">
      <div className="mb-6 pb-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-rose-100 text-rose-800 mb-2">
            Activity H • Working Memory
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Working Memory & Reordering
          </h2>
        </div>
        <div className="bg-slate-100 px-4 py-2 rounded-2xl font-bold text-sm text-slate-700">
          Round {currentRound.round} of {WM_ROUNDS.length}
        </div>
      </div>

      <div className="bg-rose-50/80 border border-rose-200/80 rounded-2xl p-5 text-rose-950 text-base sm:text-lg mb-8">
        <p className="font-bold flex items-center gap-2 text-rose-900">
          <ArrowUpNarrowWide className="w-5 h-5 text-rose-700 shrink-0" />
          Instructions:
        </p>
        <p className="mt-1">
          A few numbers will appear in random order. Memorize them, and when they disappear, enter them in <strong>ascending order (from lowest to highest)</strong>.
        </p>
      </div>

      {/* STAGE: READY */}
      {stage === 'ready' && (
        <div className="text-center py-10 space-y-6">
          <div className="inline-flex p-6 rounded-3xl bg-rose-50 text-rose-600 mb-2">
            <ArrowUpNarrowWide className="w-16 h-16" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800">
            Round {currentRound.round}: {currentRound.numbers.length} Numbers
          </h3>
          <p className="text-slate-600 max-w-md mx-auto text-base">
            Take a moment to prepare. Press Start when you are ready to see the numbers.
          </p>
          <button
            type="button"
            onClick={handleStartRound}
            className="px-10 py-5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-extrabold text-xl shadow-lg hover:shadow-xl transition inline-flex items-center gap-3"
          >
            <Play className="w-6 h-6 fill-current" />
            <span>Show Numbers</span>
          </button>
        </div>
      )}

      {/* STAGE: SHOWING */}
      {stage === 'showing' && (
        <div className="text-center py-10 space-y-8">
          <div className="text-slate-500 font-bold tracking-wider text-sm uppercase">
            Remember and prepare to reorder ({countdown}s):
          </div>
          <div className="flex justify-center items-center gap-4 sm:gap-6 flex-wrap">
            {currentRound.numbers.map((num, idx) => (
              <div
                key={idx}
                className="w-16 h-20 sm:w-20 sm:h-24 bg-gradient-to-b from-rose-500 to-rose-700 text-white rounded-2xl flex items-center justify-center text-4xl sm:text-5xl font-black shadow-lg"
              >
                {num}
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-400">
            Goal: arrange from lowest to highest.
          </p>
        </div>
      )}

      {/* STAGE: INPUT */}
      {stage === 'input' && (
        <div className="space-y-6 py-4">
          <div className="text-center">
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Select numbers in ASCENDING order (lowest to highest):
            </span>

            {/* Answer Display */}
            <div className="min-h-[72px] max-w-md mx-auto bg-slate-50 border-2 border-slate-300 rounded-2xl flex items-center justify-center px-4 gap-2 shadow-inner">
              {enteredNumbers.map((num, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleRemoveNumber(i)}
                  className="px-4 py-2 bg-white border border-slate-300 rounded-xl font-bold text-2xl text-slate-800 shadow-sm hover:bg-rose-50 hover:text-rose-600 transition"
                  title="Click to remove"
                >
                  {num}
                </button>
              ))}
              {enteredNumbers.length === 0 && (
                <span className="text-slate-400 text-base">
                  Click numbers below in ascending order...
                </span>
              )}
            </div>
          </div>

          {/* Keypad */}
          <div className="max-w-xs mx-auto grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleSelectNumber(num)}
                className="h-16 text-2xl font-bold bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-800 rounded-2xl border border-slate-200 active:scale-95 transition flex items-center justify-center shadow-sm"
              >
                {num}
              </button>
            ))}
          </div>

          <div className="flex justify-center gap-3 pt-4">
            <button
              type="button"
              onClick={handleClear}
              className="px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-base transition"
            >
              Clear
            </button>
            <button
              type="button"
              disabled={enteredNumbers.length !== currentRound.numbers.length}
              onClick={handleSubmit}
              className="px-10 py-4 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-lg shadow-md transition"
            >
              Check Order
            </button>
          </div>
        </div>
      )}

      {/* STAGE: FEEDBACK */}
      {stage === 'feedback' && feedback && (
        <div className="text-center py-8 space-y-6">
          <div
            className={`inline-flex p-6 rounded-3xl ${
              feedback.isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}
          >
            {feedback.isCorrect ? (
              <CheckCircle2 className="w-16 h-16" />
            ) : (
              <XCircle className="w-16 h-16" />
            )}
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">
              {feedback.isCorrect ? 'Accurate Reordering!' : 'Good Effort!'}
            </h3>
            <p className="mt-2 text-slate-600 text-base">
              Original was: [{feedback.original.join(', ')}]<br />
              Ascending order was: <strong className="font-mono text-rose-700 text-lg">[{feedback.expected.join(', ')}]</strong><br />
              You entered: <strong className="font-mono text-slate-800 text-lg">[{feedback.entered.join(', ')}]</strong>
            </p>
          </div>

          <div className="pt-4">
            <button
              type="button"
              onClick={handleNextRound}
              className="px-10 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-lg shadow-md hover:shadow-lg transition inline-flex items-center gap-2"
            >
              <span>
                {currentRoundIdx + 1 < WM_ROUNDS.length
                  ? 'Proceed to Next Round'
                  : 'Complete Activity'}
              </span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkingMemoryActivity;
