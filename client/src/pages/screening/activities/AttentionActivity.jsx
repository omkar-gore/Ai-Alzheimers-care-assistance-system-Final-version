import React, { useState, useEffect, useRef } from 'react';
import { Target, Play, CheckCircle2, ArrowRight } from 'lucide-react';

// Stream of characters for the attention trial (total 16 items, 5 target 'X's)
const ATTENTION_STREAM = [
  'A', 'M', 'X', 'B', 'K', 'X', 'P', 'T', 'X', 'L', 'S', 'X', 'D', 'R', 'X', 'C'
];
const TARGET_CHAR = 'X';
const ITEM_DURATION_MS = 1400; // comfortable, elderly-friendly pace

const AttentionActivity = ({ onComplete }) => {
  const [stage, setStage] = useState('ready'); // 'ready' | 'running' | 'completed'
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [currentChar, setCurrentChar] = useState('');
  const [hasClickedCurrent, setHasClickedCurrent] = useState(false);

  // Metrics
  const [hits, setHits] = useState(0);
  const [falseAlarms, setFalseAlarms] = useState(0);
  const [misses, setMisses] = useState(0);
  const [reactionTimes, setReactionTimes] = useState([]);

  const charStartTimeRef = useRef(0);
  const hasClickedCurrentRef = useRef(false);
  const hitsRef = useRef(0);
  const falseAlarmsRef = useRef(0);
  const missesRef = useRef(0);
  const rxTimesRef = useRef([]);

  const startTask = () => {
    setHits(0);
    setFalseAlarms(0);
    setMisses(0);
    setReactionTimes([]);
    hitsRef.current = 0;
    falseAlarmsRef.current = 0;
    missesRef.current = 0;
    rxTimesRef.current = [];

    setCurrentIndex(0);
    setStage('running');
  };

  useEffect(() => {
    if (stage !== 'running') return;

    if (currentIndex >= ATTENTION_STREAM.length) {
      // Finished all items
      setStage('completed');
      return;
    }

    const char = ATTENTION_STREAM[currentIndex];
    setCurrentChar(char);
    setHasClickedCurrent(false);
    hasClickedCurrentRef.current = false;
    charStartTimeRef.current = Date.now();

    const timer = setTimeout(() => {
      // Evaluate if current was a target and was missed
      if (char === TARGET_CHAR && !hasClickedCurrentRef.current) {
        missesRef.current += 1;
        setMisses(missesRef.current);
      }
      setCurrentIndex((prev) => prev + 1);
    }, ITEM_DURATION_MS);

    return () => clearTimeout(timer);
  }, [stage, currentIndex]);

  const handleTargetClick = () => {
    if (stage !== 'running' || hasClickedCurrentRef.current) return;

    hasClickedCurrentRef.current = true;
    setHasClickedCurrent(true);

    const now = Date.now();
    const rxTime = now - charStartTimeRef.current;

    if (currentChar === TARGET_CHAR) {
      hitsRef.current += 1;
      setHits(hitsRef.current);
      rxTimesRef.current.push(rxTime);
      setReactionTimes([...rxTimesRef.current]);
    } else {
      falseAlarmsRef.current += 1;
      setFalseAlarms(falseAlarmsRef.current);
    }
  };

  const handleProceed = () => {
    const totalTargets = ATTENTION_STREAM.filter((c) => c === TARGET_CHAR).length;
    const avgRx = rxTimesRef.current.length > 0
      ? Math.round(rxTimesRef.current.reduce((a, b) => a + b, 0) / rxTimesRef.current.length)
      : 0;

    onComplete({
      attentionMetrics: {
        hits: hitsRef.current,
        misses: missesRef.current,
        falseAlarms: falseAlarmsRef.current,
        totalTargets,
        avgReactionTimeMs: avgRx,
      },
    });
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80">
      <div className="mb-6 pb-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-teal-100 text-teal-800 mb-2">
            Activity C • Attention
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Sustained Attention Test
          </h2>
        </div>
        {stage === 'running' && (
          <div className="bg-slate-100 px-4 py-2 rounded-2xl font-bold text-sm text-slate-700">
            Letter {currentIndex + 1} of {ATTENTION_STREAM.length}
          </div>
        )}
      </div>

      {/* Instructions banner */}
      <div className="bg-teal-50/80 border border-teal-200/80 rounded-2xl p-5 text-teal-950 text-base sm:text-lg mb-6">
        <p className="font-bold flex items-center gap-2 text-teal-900">
          <Target className="w-5 h-5 text-teal-700 shrink-0" />
          Instructions:
        </p>
        <p className="mt-1">
          A stream of letters will appear one by one in the center of the screen. Tap the large button <strong>ONLY when you see the letter &quot;X&quot;</strong>. Do NOT tap for any other letter.
        </p>
      </div>

      {/* STAGE: READY */}
      {stage === 'ready' && (
        <div className="text-center py-10 space-y-6">
          <div className="inline-flex p-6 rounded-3xl bg-teal-50 text-teal-600 mb-2">
            <Target className="w-16 h-16" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800">
            Target Letter: <span className="text-4xl text-teal-700 font-black ml-2">X</span>
          </h3>
          <p className="text-slate-600 max-w-md mx-auto text-base">
            Stay attentive. Whenever letter &quot;X&quot; appears, tap the button immediately. If another letter appears, wait patiently without clicking.
          </p>
          <button
            type="button"
            onClick={startTask}
            className="px-10 py-5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-extrabold text-xl shadow-lg hover:shadow-xl transition inline-flex items-center gap-3"
          >
            <Play className="w-6 h-6 fill-current" />
            <span>Start Attention Task</span>
          </button>
        </div>
      )}

      {/* STAGE: RUNNING */}
      {stage === 'running' && (
        <div className="text-center py-8 space-y-8">
          <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">
            Watch carefully:
          </div>

          {/* Letter Presentation Box */}
          <div className="w-40 h-44 mx-auto bg-gradient-to-b from-slate-900 to-slate-800 text-white rounded-3xl flex items-center justify-center text-7xl sm:text-8xl font-black shadow-xl tracking-wider select-none">
            {currentChar}
          </div>

          {/* Big Accessible Tap Button */}
          <div className="max-w-md mx-auto">
            <button
              type="button"
              onClick={handleTargetClick}
              disabled={hasClickedCurrent}
              className={`w-full py-6 rounded-2xl font-black text-2xl shadow-lg transition active:scale-95 ${
                hasClickedCurrent
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-500/25 ring-4 ring-teal-200'
              }`}
            >
              {hasClickedCurrent ? '✓ Recorded' : 'TAP HERE FOR "X"'}
            </button>
          </div>

          <p className="text-sm text-slate-500">
            Remember: Only tap when you see letter &quot;X&quot;.
          </p>
        </div>
      )}

      {/* STAGE: COMPLETED */}
      {stage === 'completed' && (
        <div className="text-center py-8 space-y-6">
          <div className="inline-flex p-6 rounded-3xl bg-teal-100 text-teal-700">
            <CheckCircle2 className="w-16 h-16" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">
              Attention Activity Complete
            </h3>
            <p className="mt-2 text-slate-600 text-base">
              You correctly identified <strong>{hits}</strong> of{' '}
              <strong>{ATTENTION_STREAM.filter((c) => c === TARGET_CHAR).length}</strong> target letters.
            </p>
          </div>

          <div className="pt-4">
            <button
              type="button"
              onClick={handleProceed}
              className="px-10 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold text-lg shadow-md hover:shadow-lg transition inline-flex items-center gap-2"
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

export default AttentionActivity;
