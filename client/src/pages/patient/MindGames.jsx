import React, { useEffect, useMemo, useState } from 'react';
import {
  Brain,
  CheckCircle2,
  Eye,
  EyeOff,
  RefreshCw,
  Sparkles,
  Trophy,
  Hash,
  Palette,
  Search,
  Calculator,
  Grid3X3,
} from 'lucide-react';
import PatientLayout from './PatientLayout';


// =========================================================
// WORD RECALL DATA
// =========================================================

const WORD_SETS = [
  ['Garden', 'Family', 'Sunshine', 'Morning'],
  ['Apple', 'River', 'House', 'Flower'],
  ['Book', 'Chair', 'Bird', 'Garden'],
  ['Milk', 'School', 'Tree', 'Friend'],
  ['Rain', 'Window', 'Music', 'Home'],
];


// =========================================================
// NUMBER MEMORY DATA
// =========================================================

const NUMBER_SETS = [
  '4271',
  '5832',
  '9146',
  '3058',
  '7614',
  '2485',
];


// =========================================================
// COLOR GAME DATA
// =========================================================

const COLOR_OPTIONS = [
  {
    name: 'Red',
    className: 'bg-red-500',
  },
  {
    name: 'Blue',
    className: 'bg-blue-500',
  },
  {
    name: 'Green',
    className: 'bg-green-500',
  },
  {
    name: 'Yellow',
    className: 'bg-yellow-400',
  },
];


// =========================================================
// MAIN COMPONENT
// =========================================================

const MindGame = () => {
  const [selectedGame, setSelectedGame] =
    useState('words');

  const [score, setScore] = useState(0);

  const games = [
    {
      id: 'words',
      title: 'Word Recall',
      description: 'Remember familiar words',
      icon: Brain,
    },
    {
      id: 'numbers',
      title: 'Number Memory',
      description: 'Remember number sequences',
      icon: Hash,
    },
    {
      id: 'colors',
      title: 'Color Match',
      description: 'Match the correct color',
      icon: Palette,
    },
    {
      id: 'different',
      title: 'Find Different',
      description: 'Test your attention',
      icon: Search,
    },
    {
      id: 'math',
      title: 'Simple Math',
      description: 'Practice easy calculations',
      icon: Calculator,
    },
    {
      id: 'sequence',
      title: 'Sequence Memory',
      description: 'Remember the order',
      icon: Grid3X3,
    },
  ];

  return (
    <PatientLayout
      title="Mind Games"
      subtitle="Enjoy simple activities that exercise memory, attention, numbers, and thinking."
    >
      <div className="space-y-6">

        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#172f63] via-[#315bc4] to-[#7653d4] p-6 text-white shadow-xl shadow-indigo-200/50 sm:p-8">

          <div className="absolute -right-16 -top-20 h-60 w-60 rounded-full bg-white/10" />

          <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>

              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                <Brain size={24} />
              </div>

              <p className="text-xs font-black uppercase tracking-[1.5px] text-white/65">
                Cognitive activities
              </p>

              <h2 className="mt-1 text-3xl font-black tracking-tight">
                Keep your mind active
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80">
                Choose a simple activity and take your time. Every attempt is valuable.
              </p>

            </div>

            <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">

              <Trophy size={18} />

              <span className="text-sm font-black">
                Total Score {score}
              </span>

            </div>

          </div>

        </section>


        {/* =====================================================
            GAME SELECTOR
        ===================================================== */}

        <section>

          <div className="mb-4">

            <h3 className="text-xl font-black text-slate-800">
              Choose an activity
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Pick any game you would like to play.
            </p>

          </div>


          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

            {games.map((game) => {

              const Icon = game.icon;

              const active =
                selectedGame === game.id;

              return (
                <button
                  key={game.id}
                  type="button"
                  onClick={() =>
                    setSelectedGame(game.id)
                  }
                  className={`group rounded-[22px] border p-4 text-left transition ${
                    active
                      ? 'border-indigo-300 bg-indigo-50 shadow-md shadow-indigo-100'
                      : 'border-blue-100 bg-white shadow-sm hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md'
                  }`}
                >

                  <div className="flex items-center gap-4">

                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                        active
                          ? 'bg-indigo-600 text-white'
                          : 'bg-blue-50 text-blue-600'
                      }`}
                    >
                      <Icon size={21} />
                    </div>

                    <div>

                      <h4 className="font-black text-slate-800">
                        {game.title}
                      </h4>

                      <p className="mt-1 text-xs font-medium text-slate-500">
                        {game.description}
                      </p>

                    </div>

                  </div>

                </button>
              );
            })}

          </div>

        </section>


        {/* =====================================================
            SELECTED GAME
        ===================================================== */}

        {selectedGame === 'words' && (
          <WordRecall
            onCorrect={() =>
              setScore((value) => value + 1)
            }
          />
        )}

        {selectedGame === 'numbers' && (
          <NumberMemory
            onCorrect={() =>
              setScore((value) => value + 1)
            }
          />
        )}

        {selectedGame === 'colors' && (
          <ColorMatch
            onCorrect={() =>
              setScore((value) => value + 1)
            }
          />
        )}

        {selectedGame === 'different' && (
          <FindDifferent
            onCorrect={() =>
              setScore((value) => value + 1)
            }
          />
        )}

        {selectedGame === 'math' && (
          <SimpleMath
            onCorrect={() =>
              setScore((value) => value + 1)
            }
          />
        )}

        {selectedGame === 'sequence' && (
          <SequenceMemory
            onCorrect={() =>
              setScore((value) => value + 1)
            }
          />
        )}


        {/* =====================================================
            SUPPORT CARDS
        ===================================================== */}

        <section className="grid gap-4 sm:grid-cols-3">

          <InfoCard
            icon={Sparkles}
            title="Keep it short"
            text="A few minutes is enough for a quick activity."
          />

          <InfoCard
            icon={Brain}
            title="Go at your pace"
            text="There is no need to rush your answer."
          />

          <InfoCard
            icon={CheckCircle2}
            title="Celebrate progress"
            text="Every attempt is part of the activity."
          />

        </section>

      </div>
    </PatientLayout>
  );
};


// =========================================================
// WORD RECALL
// =========================================================

const WordRecall = ({ onCorrect }) => {

  const [round, setRound] = useState(0);
  const [showWords, setShowWords] = useState(true);
  const [answer, setAnswer] = useState('');
  const [message, setMessage] = useState('');

  const words =
    WORD_SETS[round % WORD_SETS.length];

  useEffect(() => {

    setShowWords(true);
    setAnswer('');
    setMessage('');

    const timer = setTimeout(() => {
      setShowWords(false);
    }, 5000);

    return () => clearTimeout(timer);

  }, [round]);

  const checkAnswer = (event) => {

    event.preventDefault();

    const normalized =
      answer.trim().toLowerCase();

    if (!normalized) {
      return;
    }

    const correct = words.some(
      (word) =>
        word.toLowerCase() === normalized
    );

    if (correct) {

      onCorrect();

      setMessage(
        'Great job! You remembered a word.'
      );

    } else {

      setMessage(
        `That is okay. The words were: ${words.join(', ')}.`
      );

    }

  };

  return (
    <GameCard
      label={`Round ${round + 1}`}
      title="Remember the words"
      status={showWords ? 'Memorize' : 'Recall'}
      statusActive={showWords}
    >

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

        {words.map((word) => (

          <div
            key={word}
            className={`flex min-h-24 items-center justify-center rounded-2xl border text-center text-sm font-black ${
              showWords
                ? 'border-indigo-100 bg-indigo-50 text-indigo-700'
                : 'border-slate-100 bg-slate-50 text-slate-300'
            }`}
          >

            {showWords ? (
              word
            ) : (
              <EyeOff size={21} />
            )}

          </div>

        ))}

      </div>


      <div className="mt-7 rounded-2xl bg-slate-50 p-4 sm:p-5">

        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">

          {showWords ? (
            <Eye size={15} />
          ) : (
            <EyeOff size={15} />
          )}

          {showWords
            ? 'The words are visible for 5 seconds.'
            : 'The words are hidden. What do you remember?'}

        </div>

        <form
          onSubmit={checkAnswer}
          className="mt-4 flex flex-col gap-2 sm:flex-row"
        >

          <input
            value={answer}
            onChange={(e) =>
              setAnswer(e.target.value)
            }
            disabled={showWords}
            placeholder={
              showWords
                ? 'Wait for the words to hide...'
                : 'Type one word you remember'
            }
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100"
          />

          <button
            type="submit"
            disabled={
              showWords ||
              !answer.trim()
            }
            className="rounded-xl bg-indigo-600 px-5 py-3 text-xs font-black text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Check answer
          </button>

        </form>

      </div>


      {message && (
        <Message message={message} />
      )}


      <NewRound
        onClick={() =>
          setRound((value) => value + 1)
        }
      />

    </GameCard>
  );
};


// =========================================================
// NUMBER MEMORY
// =========================================================

const NumberMemory = ({ onCorrect }) => {

  const [round, setRound] = useState(0);
  const [showNumber, setShowNumber] = useState(true);
  const [answer, setAnswer] = useState('');
  const [message, setMessage] = useState('');

  const number =
    NUMBER_SETS[round % NUMBER_SETS.length];

  useEffect(() => {

    setShowNumber(true);
    setAnswer('');
    setMessage('');

    const timer = setTimeout(() => {
      setShowNumber(false);
    }, 4000);

    return () => clearTimeout(timer);

  }, [round]);

  const checkAnswer = (event) => {

    event.preventDefault();

    if (!answer.trim()) {
      return;
    }

    if (answer.trim() === number) {

      onCorrect();

      setMessage(
        'Excellent! You remembered the number correctly.'
      );

    } else {

      setMessage(
        `Good try! The number was ${number}.`
      );

    }

  };

  return (
    <GameCard
      label={`Round ${round + 1}`}
      title="Remember the number"
      status={showNumber ? 'Memorize' : 'Recall'}
      statusActive={showNumber}
    >

      <div className="flex min-h-36 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-50 to-blue-50">

        {showNumber ? (

          <span className="text-5xl font-black tracking-[10px] text-indigo-700">
            {number}
          </span>

        ) : (

          <EyeOff
            size={42}
            className="text-slate-300"
          />

        )}

      </div>


      <div className="mt-6 rounded-2xl bg-slate-50 p-4">

        <p className="text-xs font-bold text-slate-500">
          {showNumber
            ? 'Look carefully. The number will disappear soon.'
            : 'What number do you remember?'}
        </p>

        <form
          onSubmit={checkAnswer}
          className="mt-4 flex flex-col gap-2 sm:flex-row"
        >

          <input
            value={answer}
            onChange={(e) =>
              setAnswer(
                e.target.value.replace(/\D/g, '')
              )
            }
            disabled={showNumber}
            inputMode="numeric"
            maxLength={4}
            placeholder="Enter the number"
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-lg font-black tracking-[5px] outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-100"
          />

          <button
            type="submit"
            disabled={
              showNumber ||
              answer.length !== 4
            }
            className="rounded-xl bg-indigo-600 px-5 py-3 text-xs font-black text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Check number
          </button>

        </form>

      </div>


      {message && (
        <Message message={message} />
      )}


      <NewRound
        onClick={() =>
          setRound((value) => value + 1)
        }
      />

    </GameCard>
  );
};


// =========================================================
// COLOR MATCH
// =========================================================

const ColorMatch = ({ onCorrect }) => {

  const [round, setRound] = useState(0);
  const [message, setMessage] = useState('');

  const target =
    COLOR_OPTIONS[
      round % COLOR_OPTIONS.length
    ];

  const checkColor = (color) => {

    if (color.name === target.name) {

      onCorrect();

      setMessage(
        'Correct! You matched the color.'
      );

    } else {

      setMessage(
        `Good try! The correct answer was ${target.name}.`
      );

    }

  };

  return (
    <GameCard
      label={`Round ${round + 1}`}
      title="Color Match"
      status="Choose"
      statusActive
    >

      <div className="text-center">

        <p className="text-sm font-bold text-slate-500">
          Which button has the same color?
        </p>

        <div className="mx-auto mt-6 flex h-32 w-32 items-center justify-center rounded-full bg-slate-100">

          <div
            className={`h-24 w-24 rounded-full shadow-lg ${target.className}`}
          />

        </div>

      </div>


      <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">

        {COLOR_OPTIONS.map((color) => (

          <button
            key={color.name}
            type="button"
            onClick={() =>
              checkColor(color)
            }
            className={`rounded-2xl px-4 py-5 text-sm font-black text-white shadow-sm transition hover:-translate-y-1 hover:shadow-md ${color.className}`}
          >
            {color.name}
          </button>

        ))}

      </div>


      {message && (
        <Message message={message} />
      )}


      <NewRound
        onClick={() =>
          setRound((value) => value + 1)
        }
      />

    </GameCard>
  );
};


// =========================================================
// FIND DIFFERENT
// =========================================================

const FindDifferent = ({ onCorrect }) => {

  const [round, setRound] = useState(0);
  const [message, setMessage] = useState('');

  const differentIndex =
    round % 9;

  const checkTile = (index) => {

    if (index === differentIndex) {

      onCorrect();

      setMessage(
        'Excellent! You found the different tile.'
      );

    } else {

      setMessage(
        'Good try! Look carefully at the shapes.'
      );

    }

  };

  return (
    <GameCard
      label={`Round ${round + 1}`}
      title="Find the different one"
      status="Attention"
      statusActive
    >

      <p className="text-center text-sm font-bold text-slate-500">
        One tile is different. Can you find it?
      </p>


      <div className="mx-auto mt-6 grid max-w-md grid-cols-3 gap-3">

        {Array.from({ length: 9 }).map(
          (_, index) => (

            <button
              key={index}
              type="button"
              onClick={() =>
                checkTile(index)
              }
              className="flex aspect-square items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 transition hover:bg-blue-100"
            >

              <div
                className={`h-12 w-12 ${
                  index === differentIndex
                    ? 'rounded-full bg-indigo-500'
                    : 'rounded-xl bg-indigo-500'
                }`}
              />

            </button>

          )
        )}

      </div>


      {message && (
        <Message message={message} />
      )}


      <NewRound
        onClick={() =>
          setRound((value) => value + 1)
        }
      />

    </GameCard>
  );
};


// =========================================================
// SIMPLE MATH
// =========================================================

const SimpleMath = ({ onCorrect }) => {

  const [round, setRound] = useState(0);
  const [answer, setAnswer] = useState('');
  const [message, setMessage] = useState('');

  const first =
    3 + (round % 6);

  const second =
    2 + (round % 5);

  const correctAnswer =
    first + second;

  const checkAnswer = (event) => {

    event.preventDefault();

    if (!answer.trim()) {
      return;
    }

    if (Number(answer) === correctAnswer) {

      onCorrect();

      setMessage(
        'Correct! Well done.'
      );

    } else {

      setMessage(
        `Good try! The answer is ${correctAnswer}.`
      );

    }

  };

  return (
    <GameCard
      label={`Round ${round + 1}`}
      title="Simple Math"
      status="Think"
      statusActive
    >

      <div className="rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 py-10 text-center">

        <p className="text-sm font-bold text-slate-500">
          What is
        </p>

        <p className="mt-2 text-5xl font-black text-indigo-700">
          {first} + {second}
        </p>

        <p className="mt-2 text-sm font-bold text-slate-500">
          ?
        </p>

      </div>


      <form
        onSubmit={checkAnswer}
        className="mt-6 flex flex-col gap-3 sm:flex-row"
      >

        <input
          type="number"
          value={answer}
          onChange={(e) =>
            setAnswer(e.target.value)
          }
          placeholder="Enter your answer"
          className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-lg font-black outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
        />

        <button
          type="submit"
          disabled={!answer.trim()}
          className="rounded-xl bg-indigo-600 px-6 py-3 text-xs font-black text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Check answer
        </button>

      </form>


      {message && (
        <Message message={message} />
      )}


      <NewRound
        onClick={() => {
          setRound((value) => value + 1);
          setAnswer('');
          setMessage('');
        }}
      />

    </GameCard>
  );
};


// =========================================================
// SEQUENCE MEMORY
// =========================================================

const SequenceMemory = ({ onCorrect }) => {

  const sequences = [
    ['1', '2', '3', '4'],
    ['2', '4', '1', '3'],
    ['3', '1', '4', '2'],
    ['4', '2', '3', '1'],
  ];

  const [round, setRound] = useState(0);
  const [showSequence, setShowSequence] =
    useState(true);
  const [answer, setAnswer] = useState('');
  const [message, setMessage] = useState('');

  const sequence =
    sequences[round % sequences.length];

  useEffect(() => {

    setShowSequence(true);
    setAnswer('');
    setMessage('');

    const timer = setTimeout(() => {
      setShowSequence(false);
    }, 4500);

    return () => clearTimeout(timer);

  }, [round]);

  const checkAnswer = (event) => {

    event.preventDefault();

    if (!answer.trim()) {
      return;
    }

    const userSequence =
      answer
        .replace(/\s/g, '')
        .split('');

    const correct =
      userSequence.join('') ===
      sequence.join('');

    if (correct) {

      onCorrect();

      setMessage(
        'Excellent! You remembered the sequence.'
      );

    } else {

      setMessage(
        `Good try! The sequence was ${sequence.join(' → ')}.`
      );

    }

  };

  return (
    <GameCard
      label={`Round ${round + 1}`}
      title="Sequence Memory"
      status={showSequence ? 'Memorize' : 'Recall'}
      statusActive={showSequence}
    >

      <p className="text-center text-sm font-bold text-slate-500">
        Remember the order of the numbers.
      </p>


      <div className="mt-6 grid grid-cols-4 gap-3">

        {sequence.map(
          (number, index) => (

            <div
              key={index}
              className={`flex aspect-square items-center justify-center rounded-2xl text-2xl font-black ${
                showSequence
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'bg-slate-50 text-slate-300'
              }`}
            >

              {showSequence ? (
                number
              ) : (
                <EyeOff size={21} />
              )}

            </div>

          )
        )}

      </div>


      <form
        onSubmit={checkAnswer}
        className="mt-6 flex flex-col gap-3 sm:flex-row"
      >

        <input
          value={answer}
          onChange={(e) =>
            setAnswer(
              e.target.value.replace(
                /[^1-4]/g,
                ''
              )
            )
          }
          disabled={showSequence}
          maxLength={4}
          inputMode="numeric"
          placeholder={
            showSequence
              ? 'Wait for the sequence...'
              : 'Enter the sequence'
          }
          className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-lg font-black tracking-[7px] outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-100"
        />

        <button
          type="submit"
          disabled={
            showSequence ||
            answer.length !== 4
          }
          className="rounded-xl bg-indigo-600 px-6 py-3 text-xs font-black text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Check sequence
        </button>

      </form>


      {message && (
        <Message message={message} />
      )}


      <NewRound
        onClick={() =>
          setRound((value) => value + 1)
        }
      />

    </GameCard>
  );
};


// =========================================================
// SHARED GAME CARD
// =========================================================

const GameCard = ({
  label,
  title,
  status,
  statusActive,
  children,
}) => (

  <section className="mx-auto w-full max-w-3xl rounded-[28px] border border-blue-100 bg-white p-5 shadow-sm sm:p-8">

    <div className="mb-6 flex items-center justify-between gap-3">

      <div>

        <p className="text-xs font-black uppercase tracking-[1.3px] text-indigo-600">
          {label}
        </p>

        <h3 className="mt-1 text-xl font-black text-slate-800">
          {title}
        </h3>

      </div>

      <span
        className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase ${
          statusActive
            ? 'bg-emerald-50 text-emerald-600'
            : 'bg-slate-100 text-slate-500'
        }`}
      >
        {status}
      </span>

    </div>

    {children}

  </section>
);


// =========================================================
// MESSAGE
// =========================================================

const Message = ({ message }) => (

  <div className="mt-4 flex items-start gap-3 rounded-2xl bg-blue-50 p-4 text-xs font-semibold leading-5 text-blue-700">

    <CheckCircle2
      size={18}
      className="mt-0.5 shrink-0"
    />

    {message}

  </div>

);


// =========================================================
// NEW ROUND BUTTON
// =========================================================

const NewRound = ({ onClick }) => (

  <button
    type="button"
    onClick={onClick}
    className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-xs font-black text-indigo-600 transition hover:bg-indigo-100"
  >

    <RefreshCw size={15} />

    Start new round

  </button>

);


// =========================================================
// INFO CARD
// =========================================================

const InfoCard = ({
  icon: Icon,
  title,
  text,
}) => (

  <div className="rounded-[22px] border border-blue-100 bg-white p-5 shadow-sm">

    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

      <Icon size={18} />

    </span>

    <h4 className="mt-4 font-black text-slate-800">
      {title}
    </h4>

    <p className="mt-1 text-xs leading-5 text-slate-500">
      {text}
    </p>

  </div>

);


export default MindGame;