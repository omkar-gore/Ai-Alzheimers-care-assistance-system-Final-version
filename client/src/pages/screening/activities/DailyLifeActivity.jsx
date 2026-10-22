import React, { useState } from 'react';
import { Home, Coffee, Calendar, ShieldCheck, ArrowRight, Check } from 'lucide-react';

const FORGETFULNESS_OPTIONS = ['Never', 'Rarely', 'Sometimes', 'Often', 'Almost every day'];
const DIFFICULTY_OPTIONS = ['No difficulty', 'Slight difficulty', 'Moderate difficulty', 'Significant difficulty'];
const INDEPENDENCE_OPTIONS = ['Yes, independently', 'Sometimes need help', 'Frequently need help', 'Usually need help'];
const TASK_MEMORY_OPTIONS = ['Always', 'Usually', 'Sometimes', 'Rarely'];

const DailyLifeActivity = ({ onComplete, initialAnswers = {} }) => {
  // State for all 6 self-reported daily memory inputs + 11 scored Likert questions
  const [formData, setFormData] = useState({
    // Daily Memory (self-reported)
    breakfast: initialAnswers.breakfast || '',
    wakingRoutine: initialAnswers.wakingRoutine || '',
    yesterdayActivity: initialAnswers.yesterdayActivity || '',
    lunch: initialAnswers.lunch || '',
    eveningActivity: initialAnswers.eveningActivity || '',
    wakeUpTime: initialAnswers.wakeUpTime || '',

    // Everyday Forgetfulness
    forgetKeys: initialAnswers.forgetKeys || 'Rarely',
    forgetAppointments: initialAnswers.forgetAppointments || 'Rarely',
    forgetNames: initialAnswers.forgetNames || 'Sometimes',
    repeatQuestions: initialAnswers.repeatQuestions || 'Never',

    // Familiar Activities
    recipeDifficulty: initialAnswers.recipeDifficulty || 'No difficulty',
    phoneDifficulty: initialAnswers.phoneDifficulty || 'No difficulty',
    moneyDifficulty: initialAnswers.moneyDifficulty || 'No difficulty',
    travelDifficulty: initialAnswers.travelDifficulty || 'No difficulty',
    forgetDailyActivities: initialAnswers.forgetDailyActivities || 'Rarely',

    // Independence
    manageIndependently: initialAnswers.manageIndependently || 'Yes, independently',
    rememberImportantTasks: initialAnswers.rememberImportantTasks || 'Usually',
  });

  const [activeTab, setActiveTab] = useState(0); // 0: Daily Routine, 1: Forgetfulness, 2: Familiar Tasks & Independence

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleNextTab = () => {
    if (activeTab < 2) {
      setActiveTab((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onComplete({ dailyLifeAnswers: formData });
    }
  };

  const handlePrevTab = () => {
    if (activeTab > 0) {
      setActiveTab((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80">
      <div className="mb-6 pb-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-amber-100 text-amber-800 mb-2">
            Activity G • Daily Living
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Daily Routine & Everyday Cognitive Assessment
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {['Routine', 'Forgetfulness', 'Independence'].map((label, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveTab(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === idx
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {idx + 1}. {label}
            </button>
          ))}
        </div>
      </div>

      {/* Safety Notice */}
      <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-5 text-amber-950 text-base mb-8">
        <p className="font-bold flex items-center gap-2 text-amber-900">
          <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0" />
          Safety & Assessment Context:
        </p>
        <p className="mt-1">
          This section explores everyday memory, familiar habits, and independence. Everyday forgetfulness is normal and can be influenced by stress, fatigue, or sleep. Answers are self-reported and never constitute a medical diagnosis.
        </p>
      </div>

      {/* SUB-SECTION 0: DAILY ROUTINE (Self-Reported) */}
      {activeTab === 0 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Coffee className="w-5 h-5 text-amber-600" />
              Part 1: Your Day & Daily Habits
            </h3>
            <p className="text-sm text-slate-500">
              Answer briefly in your own words. These provide context for everyday recall.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                What did you have for breakfast today?
              </label>
              <input
                type="text"
                value={formData.breakfast}
                onChange={(e) => handleChange('breakfast', e.target.value)}
                placeholder="e.g. Oatmeal, toast, tea..."
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:border-amber-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                What time do you usually wake up?
              </label>
              <input
                type="text"
                value={formData.wakeUpTime}
                onChange={(e) => handleChange('wakeUpTime', e.target.value)}
                placeholder="e.g. 6:30 AM"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:border-amber-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                What did you do right after waking up today?
              </label>
              <input
                type="text"
                value={formData.wakingRoutine}
                onChange={(e) => handleChange('wakingRoutine', e.target.value)}
                placeholder="e.g. Drank water, brushed teeth, went for a walk..."
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:border-amber-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                What did you have for lunch today (or plan to have)?
              </label>
              <input
                type="text"
                value={formData.lunch}
                onChange={(e) => handleChange('lunch', e.target.value)}
                placeholder="e.g. Rice, vegetables, soup..."
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:border-amber-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                What activity do you usually do in the evening?
              </label>
              <input
                type="text"
                value={formData.eveningActivity}
                onChange={(e) => handleChange('eveningActivity', e.target.value)}
                placeholder="e.g. Read, watch news, talk to family..."
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:border-amber-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                What was one memorable thing you did yesterday?
              </label>
              <input
                type="text"
                value={formData.yesterdayActivity}
                onChange={(e) => handleChange('yesterdayActivity', e.target.value)}
                placeholder="e.g. Met a friend, watered plants, grocery shopping..."
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:border-amber-600 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* SUB-SECTION 1: EVERYDAY FORGETFULNESS */}
      {activeTab === 1 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-600" />
              Part 2: Everyday Memory & Forgetfulness
            </h3>
            <p className="text-sm text-slate-500">
              Select the option that best reflects your recent experience over the past few weeks.
            </p>
          </div>

          {/* Question 1 */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <p className="text-base font-bold text-slate-800 mb-3">
              1. Do you sometimes forget where you kept your phone, keys, or wallet?
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {FORGETFULNESS_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleChange('forgetKeys', opt)}
                  className={`p-3 rounded-xl font-bold text-sm transition border ${
                    formData.forgetKeys === opt
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Question 2 */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <p className="text-base font-bold text-slate-800 mb-3">
              2. Do you forget appointments or important upcoming events?
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {FORGETFULNESS_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleChange('forgetAppointments', opt)}
                  className={`p-3 rounded-xl font-bold text-sm transition border ${
                    formData.forgetAppointments === opt
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Question 3 */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <p className="text-base font-bold text-slate-800 mb-3">
              3. Do you sometimes forget the names of familiar people?
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {FORGETFULNESS_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleChange('forgetNames', opt)}
                  className={`p-3 rounded-xl font-bold text-sm transition border ${
                    formData.forgetNames === opt
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Question 4 */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <p className="text-base font-bold text-slate-800 mb-3">
              4. Do you repeat the same question or story because you forgot that you already asked or said it?
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {FORGETFULNESS_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleChange('repeatQuestions', opt)}
                  className={`p-3 rounded-xl font-bold text-sm transition border ${
                    formData.repeatQuestions === opt
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-SECTION 2: FAMILIAR ACTIVITIES & INDEPENDENCE */}
      {activeTab === 2 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Home className="w-5 h-5 text-amber-600" />
              Part 3: Familiar Activities & Daily Independence
            </h3>
            <p className="text-sm text-slate-500">
              How easily can you carry out familiar everyday tasks?
            </p>
          </div>

          {/* Recipe */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <p className="text-base font-bold text-slate-800 mb-3">
              1. Do you have difficulty following a familiar recipe or familiar instructions?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              {DIFFICULTY_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleChange('recipeDifficulty', opt)}
                  className={`p-3 rounded-xl font-bold text-sm transition border ${
                    formData.recipeDifficulty === opt
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile phone */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <p className="text-base font-bold text-slate-800 mb-3">
              2. Do you have difficulty using your mobile phone for familiar tasks?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              {DIFFICULTY_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleChange('phoneDifficulty', opt)}
                  className={`p-3 rounded-xl font-bold text-sm transition border ${
                    formData.phoneDifficulty === opt
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Money / Payment */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <p className="text-base font-bold text-slate-800 mb-3">
              3. Do you have difficulty managing simple money or payment activities?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              {DIFFICULTY_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleChange('moneyDifficulty', opt)}
                  className={`p-3 rounded-xl font-bold text-sm transition border ${
                    formData.moneyDifficulty === opt
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Travel */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <p className="text-base font-bold text-slate-800 mb-3">
              4. Do you have difficulty travelling to familiar places?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              {DIFFICULTY_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleChange('travelDifficulty', opt)}
                  className={`p-3 rounded-xl font-bold text-sm transition border ${
                    formData.travelDifficulty === opt
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Independence */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <p className="text-base font-bold text-slate-800 mb-3">
              5. Can you manage your usual daily activities independently?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              {INDEPENDENCE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleChange('manageIndependently', opt)}
                  className={`p-3 rounded-xl font-bold text-sm transition border ${
                    formData.manageIndependently === opt
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Important Tasks */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <p className="text-base font-bold text-slate-800 mb-3">
              6. Can you remember important tasks that you need to complete during the day?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              {TASK_MEMORY_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleChange('rememberImportantTasks', opt)}
                  className={`p-3 rounded-xl font-bold text-sm transition border ${
                    formData.rememberImportantTasks === opt
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Nav Buttons */}
      <div className="flex items-center justify-between pt-8 border-t border-slate-100 mt-8">
        <button
          type="button"
          onClick={handlePrevTab}
          disabled={activeTab === 0}
          className="px-6 py-3.5 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition"
        >
          Previous Section
        </button>

        <button
          type="button"
          onClick={handleNextTab}
          className="px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-bold text-lg shadow-md hover:shadow-lg transition inline-flex items-center gap-2"
        >
          <span>{activeTab < 2 ? 'Next Section' : 'Save & Continue'}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default DailyLifeActivity;
