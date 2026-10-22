import React, { useState } from 'react';
import { Compass, Calendar, Clock, MapPin, ArrowRight } from 'lucide-react';

const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const PARTS_OF_DAY = [
  { value: 'morning', label: 'Morning (Before 12:00 PM)' },
  { value: 'afternoon', label: 'Afternoon (12:00 PM - 5:00 PM)' },
  { value: 'evening', label: 'Evening (5:00 PM - 9:00 PM)' },
  { value: 'night', label: 'Night (After 9:00 PM)' },
];

const OrientationActivity = ({ onComplete, initialAnswers = {} }) => {
  const [day, setDay] = useState(initialAnswers.day || '');
  const [month, setMonth] = useState(initialAnswers.month || '');
  const [year, setYear] = useState(initialAnswers.year || '');
  const [partOfDay, setPartOfDay] = useState(initialAnswers.partOfDay || '');
  const [locationName, setLocationName] = useState(initialAnswers.locationName || '');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!day || !month || !year || !partOfDay) {
      setErrorMsg('Please answer the date, month, year, and time of day questions.');
      return;
    }

    onComplete({
      orientationAnswers: {
        day,
        month,
        year: year.trim(),
        partOfDay,
        locationName: locationName.trim(),
      },
    });
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80">
      <div className="mb-6 pb-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-emerald-100 text-emerald-800 mb-2">
            Activity D • Orientation
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Orientation & Time Awareness
          </h2>
        </div>
      </div>

      <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-5 text-emerald-950 text-base sm:text-lg mb-8">
        <p className="font-bold flex items-center gap-2 text-emerald-900">
          <Compass className="w-5 h-5 text-emerald-700 shrink-0" />
          Instructions:
        </p>
        <p className="mt-1">
          Please answer the questions below about today&apos;s date, the current time of day, and where you are right now. Do not look at a calendar if you can avoid it.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Day of Week */}
        <div>
          <label className="block text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            1. What day of the week is today?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {DAYS_OF_WEEK.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDay(d)}
                className={`py-3.5 px-2 rounded-2xl font-bold text-base transition border-2 ${
                  day.toLowerCase() === d.toLowerCase()
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Month */}
        <div>
          <label className="block text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            2. What month is it right now?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {MONTHS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMonth(m)}
                className={`py-3 px-2 rounded-2xl font-bold text-base transition border-2 ${
                  month.toLowerCase() === m.toLowerCase()
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Year */}
        <div>
          <label className="block text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            3. What is the current year?
          </label>
          <input
            type="number"
            min="1900"
            max="2100"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="e.g. 2026"
            className="w-full sm:w-64 px-5 py-3.5 text-xl font-bold border-2 border-slate-300 rounded-2xl focus:border-emerald-600 focus:outline-none"
          />
        </div>

        {/* Part of Day */}
        <div>
          <label className="block text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            4. What part of the day is it right now?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
            {PARTS_OF_DAY.map((part) => (
              <button
                key={part.value}
                type="button"
                onClick={() => setPartOfDay(part.value)}
                className={`p-4 rounded-2xl text-left font-bold text-base transition border-2 ${
                  partOfDay === part.value
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {part.label}
              </button>
            ))}
          </div>
        </div>

        {/* Current Location (Optional manual entry, NO GPS) */}
        <div>
          <label className="block text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
            5. Where are you currently located? <span className="text-sm font-normal text-slate-500">(Optional self-report)</span>
          </label>
          <p className="text-xs text-slate-500 mb-2">
            * We never use GPS or location tracking. You may type your city, home, or general setting.
          </p>
          <input
            type="text"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            placeholder="e.g., At home in Mumbai / In my living room"
            className="w-full max-w-xl px-5 py-3.5 text-base border-2 border-slate-300 rounded-2xl focus:border-emerald-600 focus:outline-none"
          />
        </div>

        {errorMsg && (
          <p className="text-sm font-bold text-rose-600 bg-rose-50 p-4 rounded-2xl border border-rose-200">
            {errorMsg}
          </p>
        )}

        <div className="flex justify-end pt-6 border-t border-slate-100">
          <button
            type="submit"
            className="w-full sm:w-auto px-10 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-lg shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
          >
            <span>Save & Continue</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrientationActivity;
