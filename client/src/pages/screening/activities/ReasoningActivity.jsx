import React, { useState } from 'react';
import { Lightbulb, CheckCircle2, ArrowRight } from 'lucide-react';
import { REASONING_QUESTIONS } from '../../../utils/screeningScoring';

const ReasoningActivity = ({ onComplete, initialAnswers = {} }) => {
  const [answers, setAnswers] = useState(initialAnswers);
  const [currentIdx, setCurrentIdx] = useState(0);

  const currentQ = REASONING_QUESTIONS[currentIdx];
  const isSelected = !!answers[currentQ.id];

  const handleSelectOption = (option) => {
    setAnswers({
      ...answers,
      [currentQ.id]: option,
    });
  };

  const handleNext = () => {
    if (currentIdx + 1 < REASONING_QUESTIONS.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      onComplete({ reasoningAnswers: answers });
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80">
      <div className="mb-6 pb-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-purple-100 text-purple-800 mb-2">
            Activity F • Reasoning
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Pattern & Logical Reasoning
          </h2>
        </div>
        <div className="bg-slate-100 px-4 py-2 rounded-2xl font-bold text-sm text-slate-700">
          Question {currentIdx + 1} of {REASONING_QUESTIONS.length}
        </div>
      </div>

      <div className="bg-purple-50/80 border border-purple-200/80 rounded-2xl p-5 text-purple-950 text-base sm:text-lg mb-8">
        <p className="font-bold flex items-center gap-2 text-purple-900">
          <Lightbulb className="w-5 h-5 text-purple-700 shrink-0" />
          Instructions:
        </p>
        <p className="mt-1">
          Look at the pattern or relationship below and choose the option that logically completes it.
        </p>
      </div>

      {/* Question Card */}
      <div className="bg-gradient-to-br from-slate-50 to-purple-50/30 border-2 border-slate-200 rounded-3xl p-6 sm:p-8 mb-8 text-center">
        <span className="text-xs font-bold text-purple-600 uppercase tracking-widest block mb-2">
          {currentQ.type.toUpperCase()} CHALLENGE
        </span>
        <h3 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-wide">
          {currentQ.question}
        </h3>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
        {currentQ.options.map((opt) => {
          const isChosen = answers[currentQ.id] === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => handleSelectOption(opt)}
              className={`p-5 rounded-2xl text-center font-extrabold text-xl sm:text-2xl transition border-2 flex items-center justify-between shadow-sm ${
                isChosen
                  ? 'bg-purple-600 text-white border-purple-600 shadow-md ring-4 ring-purple-100'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
              }`}
            >
              <span className="flex-1 text-center">{opt}</span>
              {isChosen && <CheckCircle2 className="w-6 h-6 shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-100">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentIdx === 0}
          className="px-6 py-3.5 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition"
        >
          Previous
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={!isSelected}
          className="px-8 py-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-lg shadow-md hover:shadow-lg transition inline-flex items-center gap-2"
        >
          <span>
            {currentIdx + 1 < REASONING_QUESTIONS.length
              ? 'Next Question'
              : 'Complete Activity'}
          </span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ReasoningActivity;
