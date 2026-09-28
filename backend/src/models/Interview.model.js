const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  key: String,
  title: String,
  short: String,
  kind: String,
  brief: String,
  count: Number,
  score: { type: Number, default: null }
}, { _id: false });

const pendingQuestionSchema = new mongoose.Schema({
  index: Number,
  sectionKey: String,
  question: String,
  hint: String,
  source: String,
  askedAt: Date
}, { _id: false });

const interviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  roleId: String,
  targetRole: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
  status: { type: String, enum: ['in-progress', 'completed', 'abandoned'], default: 'in-progress' },
  startTime: { type: Date, default: Date.now },
  endTime: Date,
  duration: { type: Number, default: 0 },
  sections: [sectionSchema],
  totalQuestions: { type: Number, default: 0 },
  answeredQuestions: { type: Number, default: 0 },
  pendingQuestion: { type: pendingQuestionSchema, default: null },
  responses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Response' }],
  overallScore: { type: Number, default: null },
  recommendation: String,
  overallFeedback: String,
  strengths: [String],
  improvementAreas: [String],
  recommendations: [String]
}, { timestamps: true });

module.exports = mongoose.model('Interview', interviewSchema);
