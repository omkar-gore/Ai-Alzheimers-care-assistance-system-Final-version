import mongoose from 'mongoose';

const cognitiveScreeningSchema = new mongoose.Schema(
  {
    screeningUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    anonymousSessionId: {
      type: String,
      default: '',
      index: true,
    },
    // Demographic / context information
    age: {
      type: Number,
      required: true,
      min: 1,
      max: 130,
    },
    educationLevel: {
      type: String,
      default: 'Not specified',
    },
    language: {
      type: String,
      default: 'English',
    },
    // Category Scores (0 - 100)
    memoryScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    delayedRecallScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    attentionScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    orientationScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    languageScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    reasoningScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    workingMemoryScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    dailyLifeScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    // Overall Weighted Screening Score (0 - 100)
    overallScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    // Risk Indicator (Non-diagnostic classification)
    riskIndicator: {
      type: String,
      required: true,
      enum: [
        'Lower Risk Indicators',
        'Some Cognitive Concerns',
        'Higher Risk Indicators',
      ],
    },
    // Breakdown & Insights
    strengths: {
      type: [String],
      default: [],
    },
    areasToWatch: {
      type: [String],
      default: [],
    },
    // Raw responses and detailed task metrics
    answers: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    activityResults: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    dailyLifeResponses: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Educational / Screening Disclaimer
    disclaimerAcknowledged: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('CognitiveScreening', cognitiveScreeningSchema);
