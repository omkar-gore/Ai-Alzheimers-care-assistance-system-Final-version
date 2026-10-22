import React, { useState, useEffect } from 'react';
import { Hash, Play, CheckCircle2, XCircle, ArrowRight, RotateCcw } from 'lucide-react';

// Sequence levels (3, 4, 5, 6 digits)
const SEQUENCE_LEVELS = [
  { level: 1, digits: [4, 8, 2], label: 'Level 1 (3 Digits)', displayTime: 4 },
  { level: 2, digits: [6, 1, 9, 3], label: 'Level 2 (4 Digits)', displayTime: 5 },
  { level: 3, digits: [5, 2, 7, 4, 8], label: 'Level 3 (5 Digits)', displayTime: 6 },
  { level: 4, digits: [3, 9, 1, 6, 2, 5], label: 'Level 4 (6 Digits)', displayTime: 7 },
];

const SequenceMemoryActivity = ({ onComplete, initialResults = {} }) => {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [stage, setStage] = useState('ready'); // 'ready' | 'showing' | 'input' | 'feedback' | 'done'
  const [userInput, setUserInput] = useState('');
  const [showCountdown, setShowCountdown] = useState(0);
  const [levelResults, setLevelResults] = useState(initialResults.levelResults || []);
  const [feedback, setFeedback] = useState(null);

  const currentLevel = SEQUENCE_LEVELS[currentLevelIndex];

  // Countdown timer while showing the digits
  useEffect(() => {
    if (stage !== 'showing') return;

    if (showCountdown <= 0) {
      setStage('input');
      return;
    }

    const timer = setInterval(() => {
      setShowCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [stage, showCountdown]);

  const startLevel = () => {
    setUserInput('');
    setFeedback(null);
    setShowCountdown(currentLevel.displayTime);
    setStage('showing');
  };

  const handleDigitClick = (num) => {
    if (userInput.length < currentLevel.digits.length) {
      setUserInput((prev) => prev + String(num));
    }
  };

  const handleBackspace = () => {
    setUserInput((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setUserInput('');
  };

  const handleSubmitSequence = () => {
    const targetStr = currentLevel.digits.join('');
    const userStr = userInput.trim();
    const isCorrect = targetStr === userStr;

    const result = {
      level: currentLevel.level,
      digitsCount: currentLevel.digits.length,
      expected: targetStr,
      entered: userStr,
      isCorrect,
    };

    const updatedResults = [...levelResults, result];
    setLevelResults(updatedResults);
    setFeedback(result);
    setStage('feedback');
  };

  const handleNextLevel = () => {
    if (currentLevelIndex + 1 < SEQUENCE_LEVELS.length) {
      setCurrentLevelIndex(currentLevelIndex + 1);
      setUserInput('');
      setFeedback(null);
      setStage('ready');
    } else {
      // Completed all levels
      finishActivity(levelResults);
    }
  };

  const finishActivity = (resultsToSave) => {
    const finalResults = resultsToSave || levelResults;
    const correctCount = finalResults.filter((r) => r.isCorrect).length;
    const totalLevels = SEQUENCE_LEVELS.length;
    const longestSequence = finalResults.reduce(
      (max, r) => (r.isCorrect && r.digitsCount > max ? r.digitsCount : max),
      0
    );
    const accuracy = Math.round((correctCount / totalLevels) * 100);

    onComplete({
      sequenceResults: {
        levelResults: finalResults,
        correctCount,
        totalLevels,
        longestSequence,
        accuracy,
      },
    });
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80">
      <div className="mb-6 pb-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-indigo-100 text-indigo-800 mb-2">
            Activity B • Sequence Memory
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Number & Sequence Memory
          </h2>
        </div>
        <div className="bg-slate-100 px-4 py-2 rounded-2xl font-bold text-sm text-slate-700">
          Level {currentLevel.level} of {SEQUENCE_LEVELS.length}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-indigo-50/80 border border-indigo-200/80 rounded-2xl p-5 text-indigo-950 text-base sm:text-lg mb-6">
        <p className="font-bold flex items-center gap-2 text-indigo-900">
          <Hash className="w-5 h-5 text-indigo-700 shrink-0" />
          Instructions:
        </p>
        <p className="mt-1">
          A short sequence of numbers will appear on the screen. Remember them in order. Once they disappear, enter the sequence using the keypad or your keyboard.
        </p>
      </div>

      {/* STAGE: READY */}
      {stage === 'ready' && (
        <div className="text-center py-10 space-y-6">
          <div className="inline-flex p-6 rounded-3xl bg-indigo-50 text-indigo-600 mb-2">
            <Hash className="w-16 h-16" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800">
            {currentLevel.label}
          </h3>
          <p className="text-slate-600 max-w-md mx-auto text-base">
            You will see <strong>{currentLevel.digits.length} numbers</strong> for {currentLevel.displayTime} seconds. Press Start when you are focused and ready.
          </p>
          <button
            type="button"
            onClick={startLevel}
            className="px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-extrabold text-xl shadow-lg hover:shadow-xl transition inline-flex items-center gap-3"
          >
            <Play className="w-6 h-6 fill-current" />
            <span>Show Sequence</span>
          </button>
        </div>
      )}

      {/* STAGE: SHOWING */}
      {stage === 'showing' && (
        <div className="text-center py-10 space-y-8">
          <div className="text-slate-500 font-bold tracking-wider text-sm uppercase">
            Remember this sequence ({showCountdown}s remaining):
          </div>
          <div className="flex justify-center items-center gap-3 sm:gap-6 flex-wrap">
            {currentLevel.digits.map((digit, idx) => (
              <div
                key={idx}
                className="w-16 h-20 sm:w-20 sm:h-24 bg-gradient-to-b from-indigo-500 to-indigo-700 text-white rounded-2xl flex items-center justify-center text-4xl sm:text-5xl font-black shadow-lg animate-pulse"
              >
                {digit}
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-400">
            Keep your eyes on the sequence. It will hide soon.
          </p>
        </div>
      )}

      {/* STAGE: INPUT */}
      {stage === 'input' && (
        <div className="space-y-6 py-4">
          <div className="text-center">
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Enter the sequence in order:
            </span>
            <div className="min-h-[72px] max-w-md mx-auto bg-slate-50 border-2 border-slate-300 rounded-2xl flex items-center justify-center px-6 text-3xl font-mono font-bold tracking-widest text-slate-800 shadow-inner">
              {userInput.split('').map((char, i) => (
                <span key={i} className="mx-1 px-3 py-1 bg-white border border-slate-200 rounded-lg shadow-sm">
                  {char}
                </span>
              ))}
              {userInput.length === 0 && (
                <span className="text-slate-400 text-lg font-sans">
                  Tap numbers below or type...
                </span>
              )}
            </div>
          </div>

          {/* Number Pad for Elderly Accessibility */}
          <div className="max-w-xs mx-auto grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleDigitClick(num)}
                className="h-16 text-2xl font-bold bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-800 rounded-2xl border border-slate-200 active:scale-95 transition flex items-center justify-center shadow-sm"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="h-16 text-sm font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-2xl border border-rose-200 active:scale-95 transition flex items-center justify-center"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => handleDigitClick(0)}
              className="h-16 text-2xl font-bold bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-800 rounded-2xl border border-slate-200 active:scale-95 transition flex items-center justify-center shadow-sm"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="h-16 text-sm font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-2xl border border-amber-200 active:scale-95 transition flex items-center justify-center"
            >
              Backspace
            </button>
          </div>

          <div className="flex justify-center pt-4">
            <button
              type="button"
              disabled={userInput.length === 0}
              onClick={handleSubmitSequence}
              className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-lg shadow-md transition"
            >
              Check Answer
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
              {feedback.isCorrect ? 'Correct Sequence!' : 'Good Effort!'}
            </h3>
            <p className="mt-2 text-slate-600 text-base">
              The sequence was: <strong className="font-mono text-indigo-700 text-lg">{feedback.expected}</strong>
              <br />
              You entered: <strong className="font-mono text-slate-800 text-lg">{feedback.entered || '(empty)'}</strong>
            </p>
          </div>

          <div className="pt-4">
            <button
              type="button"
              onClick={handleNextLevel}
              className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg shadow-md hover:shadow-lg transition inline-flex items-center gap-2"
            >
              <span>
                {currentLevelIndex + 1 < SEQUENCE_LEVELS.length
                  ? 'Proceed to Next Level'
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

export default SequenceMemoryActivity;
