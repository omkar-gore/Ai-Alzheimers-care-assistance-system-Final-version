import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import CognitiveScreening from '../models/CognitiveScreening.js';
import User from '../models/User.js';
import { calculateScreeningScore } from '../utils/screeningScoring.js';

// ==========================================
// SUBMIT SCREENING (ANONYMOUS OR AUTHENTICATED)
// ==========================================
export const submitScreening = async (req, res) => {
  try {
    const {
      age,
      educationLevel,
      language,
      wordSet,
      immediateRecalledWords,
      sequenceResults,
      attentionMetrics,
      orientationAnswers,
      fluencyWords,
      reasoningAnswers,
      dailyLifeAnswers,
      workingMemoryResult,
      delayedRecalledWords,
      anonymousSessionId,
    } = req.body;

    if (!age || Number(age) < 1 || Number(age) > 130) {
      return res.status(400).json({ message: 'Valid age is required (1-130).' });
    }

    // Run centralized transparent scoring engine
    const scoringResult = calculateScreeningScore({
      wordSet,
      immediateRecalledWords,
      sequenceResults,
      attentionMetrics,
      orientationAnswers,
      fluencyWords,
      reasoningAnswers,
      dailyLifeAnswers,
      workingMemoryResult,
      delayedRecalledWords,
    });

    const {
      scores,
      riskIndicator,
      strengths,
      areasToWatch,
      disclaimer,
    } = scoringResult;

    // Determine screening user if authenticated
    const screeningUserId = req.user ? req.user._id : null;

    // Save record to MongoDB
    const screeningRecord = await CognitiveScreening.create({
      screeningUser: screeningUserId,
      anonymousSessionId: anonymousSessionId || '',
      age: Number(age),
      educationLevel: educationLevel || 'Not specified',
      language: language || 'English',
      memoryScore: scores.memoryScore,
      delayedRecallScore: scores.delayedRecallScore,
      attentionScore: scores.attentionScore,
      orientationScore: scores.orientationScore,
      languageScore: scores.languageScore,
      reasoningScore: scores.reasoningScore,
      workingMemoryScore: scores.workingMemoryScore,
      dailyLifeScore: scores.dailyLifeScore,
      overallScore: scores.overallScore,
      riskIndicator,
      strengths,
      areasToWatch,
      answers: {
        orientationAnswers,
        reasoningAnswers,
        immediateRecalledWords,
        delayedRecalledWords,
        fluencyWords,
      },
      activityResults: {
        sequenceResults,
        attentionMetrics,
        workingMemoryResult,
      },
      dailyLifeResponses: dailyLifeAnswers || {},
      disclaimerAcknowledged: true,
    });

    return res.status(201).json({
      success: true,
      screeningId: screeningRecord._id,
      scores,
      riskIndicator,
      strengths,
      areasToWatch,
      disclaimer,
      createdAt: screeningRecord.createdAt,
    });
  } catch (error) {
    console.error('Submit cognitive screening error:', error);
    return res.status(500).json({
      message: error.message || 'Failed to process cognitive screening submission.',
    });
  }
};

// ==========================================
// GET SCREENING HISTORY (AUTHENTICATED ONLY)
// ==========================================
export const getScreeningHistory = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Authentication required to view screening history.' });
    }

    const userId = req.user._id;

    // Query strictly owned screenings
    const history = await CognitiveScreening.find({
      screeningUser: userId,
    })
      .select('-answers -activityResults -dailyLifeResponses')
      .sort({ createdAt: -1 });

    return res.status(200).json(history);
  } catch (error) {
    console.error('Get screening history error:', error);
    return res.status(500).json({
      message: error.message || 'Failed to retrieve screening history.',
    });
  }
};

// ==========================================
// GET SINGLE SCREENING DETAILS
// ==========================================
export const getScreeningById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid screening ID format.' });
    }

    const screening = await CognitiveScreening.findById(id);

    if (!screening) {
      return res.status(404).json({ message: 'Screening record not found.' });
    }

    // If screening is owned by an authenticated user, enforce authorization
    if (screening.screeningUser) {
      if (!req.user || req.user._id.toString() !== screening.screeningUser.toString()) {
        return res.status(403).json({
          message: 'Access denied: You are not authorized to view this screening record.',
        });
      }
    }

    return res.status(200).json(screening);
  } catch (error) {
    console.error('Get screening by ID error:', error);
    return res.status(500).json({
      message: error.message || 'Failed to load screening record.',
    });
  }
};

// ==========================================
// REGISTER SCREENING USER & LINK RESULT
// ==========================================
export const registerScreeningUser = async (req, res) => {
  try {
    const { name, email, password, age, gender, phone, screeningId } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        message: 'Name, email, and password are required.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if email is already taken
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({
        message: 'An account with this email address already exists. Please login instead.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      age: Number(age) || 50,
      gender: gender || 'Other',
      phone: phone ? phone.trim() : '',
      role: 'screeningUser',
    });

    // If a screeningId was provided, link that screening to the new user
    if (screeningId && mongoose.Types.ObjectId.isValid(screeningId)) {
      await CognitiveScreening.findOneAndUpdate(
        { _id: screeningId, screeningUser: null },
        { screeningUser: newUser._id }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser._id.toString(), role: newUser.role },
      process.env.JWT_SECRET || 'caremate_secret_fallback',
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Screening account created successfully.',
      token,
      user: {
        id: newUser._id,
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        age: newUser.age,
      },
    });
  } catch (error) {
    console.error('Register screening user error:', error);
    return res.status(500).json({
      message: error.message || 'Failed to create screening account.',
    });
  }
};

// ==========================================
// LINK SCREENING TO CURRENT USER
// ==========================================
export const linkScreeningToUser = async (req, res) => {
  try {
    const { screeningId } = req.params;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    if (!mongoose.Types.ObjectId.isValid(screeningId)) {
      return res.status(400).json({ message: 'Invalid screening ID format.' });
    }

    const updated = await CognitiveScreening.findOneAndUpdate(
      { _id: screeningId, screeningUser: null },
      { screeningUser: req.user._id },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Screening not found or already linked.' });
    }

    return res.status(200).json({
      message: 'Screening linked to your account successfully.',
      screeningId: updated._id,
    });
  } catch (error) {
    console.error('Link screening error:', error);
    return res.status(500).json({
      message: error.message || 'Failed to link screening record.',
    });
  }
};
