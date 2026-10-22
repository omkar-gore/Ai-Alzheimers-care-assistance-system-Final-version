/**
 * Early Cognitive Screening - Scoring Engine & Question Pools (Client-Side)
 * 
 * IMPORTANT MEDICAL SAFETY DISCLAIMER:
 * This screening model is designed for educational and demonstration purposes.
 * It is NOT a clinically validated medical test and MUST NEVER be used to diagnose
 * Alzheimer's disease, dementia, or any other health condition.
 */

export const MEDICAL_DISCLAIMERS = {
  SHORT:
    'This screening is not a medical diagnosis. It only identifies cognitive patterns that may warrant further evaluation by a qualified healthcare professional.',
  FULL:
    'This screening is not a medical diagnosis. It only identifies cognitive patterns that may warrant further evaluation by a qualified healthcare professional. This project uses a custom screening/assessment model for demonstration and educational purposes and should not be interpreted as a clinically validated diagnostic test.',
  EMERGENCY:
    'Emergency symptoms, sudden confusion, or acute neurological changes require immediate emergency medical attention.',
};

// Randomized word sets for Activity A (Immediate Recall) & Activity I (Delayed Recall)
export const WORD_POOLS = [
  ['APPLE', 'BOOK', 'RIVER', 'CHAIR', 'FLOWER'],
  ['ORANGE', 'CLOCK', 'MOUNTAIN', 'TABLE', 'GARDEN'],
  ['BANANA', 'LAMP', 'FOREST', 'WINDOW', 'CANDLE'],
  ['MANGO', 'PENCIL', 'OCEAN', 'BRIDGE', 'BIRD'],
];

// Target categories for Language Fluency
export const FLUENCY_CATEGORIES = [
  {
    type: 'category',
    topic: 'Fruits & Vegetables',
    prompt: 'Enter as many fruits or vegetables as you can in 60 seconds.',
    examples: ['Apple', 'Banana', 'Carrot', 'Spinach', 'Potato', 'Mango', 'Tomato', 'Cucumber', 'Grapes', 'Onion'],
  },
  {
    type: 'letter',
    topic: "Words starting with the letter 'S'",
    prompt: "Enter as many words starting with the letter 'S' as you can in 60 seconds.",
    examples: ['Sun', 'Star', 'Smile', 'Stone', 'Ship', 'Silver', 'Spring', 'Summer', 'School', 'Sweet'],
  },
];

// Reasoning question pool
export const REASONING_QUESTIONS = [
  {
    id: 'r1',
    type: 'number',
    question: 'What number comes next in this sequence? 2, 4, 6, 8, ?',
    options: ['9', '10', '12', '14'],
    correct: '10',
    explanation: 'The sequence increases by +2 each time.',
  },
  {
    id: 'r2',
    type: 'pattern',
    question: 'Which shape comes next? Circle → Square → Circle → Square → ?',
    options: ['Circle', 'Square', 'Triangle', 'Diamond'],
    correct: 'Circle',
    explanation: 'The pattern alternates between Circle and Square.',
  },
  {
    id: 'r3',
    type: 'number',
    question: 'What number comes next? 3, 6, 12, 24, ?',
    options: ['30', '36', '48', '52'],
    correct: '48',
    explanation: 'Each number is multiplied by 2.',
  },
  {
    id: 'r4',
    type: 'logic',
    question: 'Finger is to Hand as Toe is to ?',
    options: ['Foot', 'Leg', 'Arm', 'Shoe'],
    correct: 'Foot',
    explanation: 'Fingers are part of hands, and toes are part of feet.',
  },
];

/**
 * Normalizes text for lenient matching
 */
export const normalizeString = (str) => {
  if (!str) return '';
  return str
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
};

/**
 * Computes individual category scores (0 - 100) and weighted overall score.
 */
export const calculateScreeningScore = (screeningData) => {
  const {
    // 1. Immediate Word Recall
    wordSet = [],
    immediateRecalledWords = [],

    // 2. Sequence / Digit Memory
    sequenceResults = {},

    // 3. Attention
    attentionMetrics = {},

    // 4. Orientation
    orientationAnswers = {},

    // 5. Language Fluency
    fluencyWords = [],

    // 6. Reasoning
    reasoningAnswers = {},

    // 7. Daily Routine & Everyday Cognitive Assessment
    dailyLifeAnswers = {},

    // 8. Working Memory
    workingMemoryResult = {},

    // 9. Delayed Word Recall
    delayedRecalledWords = [],
  } = screeningData;

  // A. MEMORY: IMMEDIATE WORD RECALL (0 - 100)
  const normalizedOriginalWords = wordSet.map(normalizeString);
  let immediateHits = 0;
  const uniqueImmediateEntered = Array.from(
    new Set(immediateRecalledWords.map(normalizeString).filter(Boolean))
  );

  uniqueImmediateEntered.forEach((word) => {
    if (normalizedOriginalWords.includes(word)) {
      immediateHits += 1;
    }
  });

  const memoryScore = Math.min(
    100,
    Math.round((immediateHits / Math.max(normalizedOriginalWords.length, 1)) * 100)
  );

  // B. DELAYED WORD RECALL (0 - 100)
  let delayedHits = 0;
  const uniqueDelayedEntered = Array.from(
    new Set(delayedRecalledWords.map(normalizeString).filter(Boolean))
  );

  uniqueDelayedEntered.forEach((word) => {
    if (normalizedOriginalWords.includes(word)) {
      delayedHits += 1;
    }
  });

  const delayedRecallScore = Math.min(
    100,
    Math.round((delayedHits / Math.max(normalizedOriginalWords.length, 1)) * 100)
  );

  // C. ATTENTION TEST (0 - 100)
  const targetHits = Number(attentionMetrics.hits) || 0;
  const falseAlarms = Number(attentionMetrics.falseAlarms) || 0;
  const totalTargets = Number(attentionMetrics.totalTargets) || 6;

  const rawAttention = (targetHits - falseAlarms * 0.5) / Math.max(totalTargets, 1);
  const attentionScore = Math.max(0, Math.min(100, Math.round(rawAttention * 100)));

  // D. ORIENTATION (0 - 100)
  const now = new Date();
  const validDays = [
    now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase(),
    now.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase(),
  ];
  const validMonths = [
    now.toLocaleDateString('en-US', { month: 'long' }).toLowerCase(),
    now.toLocaleDateString('en-US', { month: 'short' }).toLowerCase(),
    String(now.getMonth() + 1),
    `0${now.getMonth() + 1}`,
  ];
  const validYear = String(now.getFullYear());

  const hour = now.getHours();
  let validPartOfDay = ['morning'];
  if (hour >= 12 && hour < 17) validPartOfDay = ['afternoon'];
  else if (hour >= 17 && hour < 21) validPartOfDay = ['evening'];
  else if (hour >= 21 || hour < 6) validPartOfDay = ['night'];

  let orientationHits = 0;
  if (validDays.includes((orientationAnswers.day || '').trim().toLowerCase())) {
    orientationHits += 1;
  }
  if (validMonths.includes((orientationAnswers.month || '').trim().toLowerCase())) {
    orientationHits += 1;
  }
  if ((orientationAnswers.year || '').trim() === validYear) {
    orientationHits += 1;
  }
  if (validPartOfDay.includes((orientationAnswers.partOfDay || '').trim().toLowerCase())) {
    orientationHits += 1;
  }

  const orientationScore = Math.round((orientationHits / 4) * 100);

  // E. LANGUAGE / WORD FLUENCY (0 - 100)
  const uniqueFluencyWords = Array.from(
    new Set(
      fluencyWords
        .map((w) => w.trim().toLowerCase())
        .filter((w) => w.length >= 2)
    )
  );

  const wordCount = uniqueFluencyWords.length;
  let languageScore = 0;
  if (wordCount >= 12) languageScore = 100;
  else if (wordCount >= 9) languageScore = 85;
  else if (wordCount >= 6) languageScore = 70;
  else if (wordCount >= 4) languageScore = 55;
  else if (wordCount >= 2) languageScore = 40;
  else if (wordCount === 1) languageScore = 25;
  else languageScore = 0;

  // F. PATTERN / SEQUENCE REASONING (0 - 100)
  let reasoningHits = 0;
  REASONING_QUESTIONS.forEach((q) => {
    if (reasoningAnswers[q.id] && reasoningAnswers[q.id].toString().trim() === q.correct) {
      reasoningHits += 1;
    }
  });
  const reasoningScore = Math.round((reasoningHits / REASONING_QUESTIONS.length) * 100);

  // G. WORKING MEMORY TASK (0 - 100)
  const wmAccuracy = Number(workingMemoryResult.accuracy) || 0;
  const workingMemoryScore = Math.max(0, Math.min(100, Math.round(wmAccuracy)));

  // H. DAILY ROUTINE & EVERYDAY COGNITIVE ASSESSMENT (0 - 100)
  const pointsMap = {
    Never: 10,
    Rarely: 8,
    Sometimes: 5,
    Often: 2,
    'Almost every day': 0,

    'No difficulty': 10,
    'Slight difficulty': 7,
    'Moderate difficulty': 4,
    'Significant difficulty': 0,

    'Yes, independently': 10,
    'Sometimes need help': 6,
    'Frequently need help': 3,
    'Usually need help': 0,

    Always: 10,
    Usually: 8,
    Rarely: 2,
  };

  const scoredKeys = [
    'forgetKeys',
    'forgetAppointments',
    'forgetNames',
    'repeatQuestions',
    'recipeDifficulty',
    'phoneDifficulty',
    'moneyDifficulty',
    'travelDifficulty',
    'forgetDailyActivities',
    'manageIndependently',
    'rememberImportantTasks',
  ];

  let dailyEarned = 0;
  let dailyCount = 0;

  scoredKeys.forEach((key) => {
    const val = dailyLifeAnswers[key];
    if (val && pointsMap[val] !== undefined) {
      dailyEarned += pointsMap[val];
      dailyCount += 1;
    }
  });

  const dailyLifeScore = dailyCount > 0
    ? Math.round((dailyEarned / (dailyCount * 10)) * 100)
    : 75;

  // OVERALL WEIGHTED COGNITIVE SCREENING SCORE (0 - 100)
  // Memory (20%) + Delayed Recall (15%) + Attention (15%) + Orientation (10%) +
  // Language (10%) + Reasoning (10%) + Working Memory (10%) + Daily Life (10%) = 100%
  const overallScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        memoryScore * 0.20 +
        delayedRecallScore * 0.15 +
        attentionScore * 0.15 +
        orientationScore * 0.10 +
        languageScore * 0.10 +
        reasoningScore * 0.10 +
        workingMemoryScore * 0.10 +
        dailyLifeScore * 0.10
      )
    )
  );

  // RISK INDICATOR
  let riskIndicator = 'Lower Risk Indicators';
  if (overallScore < 50) {
    riskIndicator = 'Higher Risk Indicators';
  } else if (overallScore < 75) {
    riskIndicator = 'Some Cognitive Concerns';
  }

  // STRENGTHS & AREAS TO WATCH
  const categoryEvaluations = [
    { name: 'Immediate Memory', score: memoryScore, weight: '20%' },
    { name: 'Delayed Recall', score: delayedRecallScore, weight: '15%' },
    { name: 'Attention & Focus', score: attentionScore, weight: '15%' },
    { name: 'Orientation', score: orientationScore, weight: '10%' },
    { name: 'Language & Fluency', score: languageScore, weight: '10%' },
    { name: 'Pattern Reasoning', score: reasoningScore, weight: '10%' },
    { name: 'Working Memory', score: workingMemoryScore, weight: '10%' },
    { name: 'Everyday Routine & Memory', score: dailyLifeScore, weight: '10%' },
  ];

  const strengths = categoryEvaluations
    .filter((c) => c.score >= 75)
    .map((c) => c.name);

  const areasToWatch = categoryEvaluations
    .filter((c) => c.score < 60)
    .map((c) => c.name);

  return {
    scores: {
      memoryScore,
      delayedRecallScore,
      attentionScore,
      orientationScore,
      languageScore,
      reasoningScore,
      workingMemoryScore,
      dailyLifeScore,
      overallScore,
    },
    riskIndicator,
    strengths,
    areasToWatch,
    categoryEvaluations,
    disclaimer: MEDICAL_DISCLAIMERS.FULL,
  };
};

/**
 * Returns UI color classes and explanatory text for the risk indicator
 */
export const getRiskBadgeConfig = (indicator) => {
  switch (indicator) {
    case 'Lower Risk Indicators':
      return {
        bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        badge: 'bg-emerald-600 text-white',
        bar: 'bg-emerald-500',
        title: 'Lower Risk Indicators',
        explanation: 'Performance in this screening did not show substantial areas of concern.',
        tone: 'positive',
      };
    case 'Some Cognitive Concerns':
      return {
        bg: 'bg-amber-50 border-amber-200 text-amber-800',
        badge: 'bg-amber-600 text-white',
        bar: 'bg-amber-500',
        title: 'Some Cognitive Concerns',
        explanation: 'Some areas of the screening showed performance that may benefit from further attention.',
        tone: 'moderate',
      };
    case 'Higher Risk Indicators':
    default:
      return {
        bg: 'bg-rose-50 border-rose-200 text-rose-800',
        badge: 'bg-rose-600 text-white',
        bar: 'bg-rose-500',
        title: 'Higher Risk Indicators',
        explanation: 'Several areas of this screening showed lower performance. Further professional evaluation may be helpful.',
        tone: 'notice',
      };
  }
};

/**
 * Calculates domain-by-domain and overall comparison between two screening evaluations.
 * 
 * IMPORTANT SAFETY NOTE:
 * Do NOT interpret improvement or decline as proof of Alzheimer's, dementia, or disease progression.
 */
export const calculateScreeningComparison = (current, previous) => {
  if (!current || !previous) return null;

  const getScore = (obj, field) => {
    if (obj.scores && obj.scores[field] !== undefined) return Number(obj.scores[field]) || 0;
    if (obj[field] !== undefined) return Number(obj[field]) || 0;
    return 0;
  };

  const currentOverall = getScore(current, 'overallScore');
  const previousOverall = getScore(previous, 'overallScore');
  const overallDiff = currentOverall - previousOverall;

  const domains = [
    { key: 'memoryScore', label: 'Memory' },
    { key: 'delayedRecallScore', label: 'Delayed Recall' },
    { key: 'attentionScore', label: 'Attention' },
    { key: 'orientationScore', label: 'Orientation' },
    { key: 'languageScore', label: 'Language' },
    { key: 'reasoningScore', label: 'Reasoning' },
    { key: 'workingMemoryScore', label: 'Working Memory' },
    { key: 'dailyLifeScore', label: 'Daily Life' },
  ];

  const domainComparisons = domains.map(({ key, label }) => {
    const curVal = getScore(current, key);
    const prevVal = getScore(previous, key);
    const diff = curVal - prevVal;
    return {
      key,
      label,
      current: curVal,
      previous: prevVal,
      diff,
      formattedDiff: diff > 0 ? `+${diff}` : String(diff),
      direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'same',
    };
  });

  return {
    previousDate: previous.createdAt || previous.date || null,
    currentDate: current.createdAt || current.date || null,
    previousScore: previousOverall,
    latestScore: currentOverall,
    overallChange: overallDiff,
    formattedOverallChange: overallDiff > 0 ? `+${overallDiff}` : String(overallDiff),
    domainComparisons,
    disclaimer:
      'Changes between screenings can be influenced by sleep, stress, practice, attention, mood, and many other factors. This screening is not a medical diagnosis.',
  };
};
