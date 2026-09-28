const mongoose = require('mongoose');

const rubricScoreSchema = new mongoose.Schema({
  criterion: String,
  score: { type: Number, min: 0, max: 10 },
  comment: String
}, { _id: false });

const responseSchema = new mongoose.Schema({
  interviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview', required: true, index: true },
  index: Number,
  sectionKey: String,
  sectionTitle: String,
  question: { type: String, required: true },
  hint: String,
  skipped: { type: Boolean, default: false },
  userAnswer: { type: String, default: '' },
  timeSpent: { type: Number, default: 0 },
  evaluation: {
    graded: { type: Boolean, default: true },
    score: { type: Number, min: 0, max: 100, default: null },
    verdict: String,
    rubric: [rubricScoreSchema],
    strengths: [String],
    improvements: [String],
    feedback: String,
    idealAnswer: [String]
  }
}, { timestamps: true });

module.exports = mongoose.model('Response', responseSchema);
