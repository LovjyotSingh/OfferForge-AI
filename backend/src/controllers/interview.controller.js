const Interview = require('../models/Interview.model');
const Response = require('../models/Response.model');
const User = require('../models/User.model');
const ai = require('../services/ai.service');
const { LEVELS, getRole, getSection, buildPlan, locateQuestion, publicCatalog } = require('../config/interviewRoles');

const MAX_ANSWER_LENGTH = 20000;

function progressOf(interview) {
  return {
    answered: interview.answeredQuestions,
    total: interview.totalQuestions,
    finished: interview.answeredQuestions >= interview.totalQuestions
  };
}

function summarize(interview) {
  return {
    _id: interview._id,
    roleId: interview.roleId,
    targetRole: interview.targetRole,
    difficulty: interview.difficulty,
    levelLabel: (LEVELS[interview.difficulty] || LEVELS.medium).label,
    status: interview.status,
    sections: interview.sections,
    startTime: interview.startTime,
    ...progressOf(interview)
  };
}

function questionPayload(interview, pending) {
  const position = locateQuestion(interview.sections, pending.index);
  return {
    index: pending.index,
    question: pending.question,
    hint: pending.hint,
    sectionIndex: position.sectionIndex,
    indexInSection: position.indexInSection,
    section: position.section,
    rubric: getSection(pending.sectionKey)?.rubric || []
  };
}

// GET /api/interviews/roles
exports.getRoles = (req, res) => {
  res.json({ status: 'success', data: publicCatalog() });
};

// POST /api/interviews/start
exports.startInterview = async (req, res) => {
  try {
    const { roleId, difficulty = 'easy' } = req.body;
    const role = getRole(roleId);
    if (!role) return res.status(400).json({ status: 'error', message: 'Pick a valid role' });
    if (!LEVELS[difficulty]) return res.status(400).json({ status: 'error', message: 'Pick a valid level' });

    await Interview.updateMany(
      { userId: req.user.id, status: 'in-progress' },
      { $set: { status: 'abandoned', pendingQuestion: null } }
    );

    const sections = buildPlan(role);
    const interview = await Interview.create({
      userId: req.user.id,
      roleId: role.id,
      targetRole: role.title,
      difficulty,
      sections,
      totalQuestions: sections.reduce((n, s) => n + s.count, 0)
    });

    res.status(201).json({ status: 'success', data: { interviewId: interview._id } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Could not start interview' });
  }
};

// GET /api/interviews/:id/next-question
// Idempotent: returns the question currently on the table, generating it only if none exists.
exports.getNextQuestion = async (req, res) => {
  try {
    let interview = await Interview.findOne({ _id: req.params.id, userId: req.user.id });
    if (!interview) return res.status(404).json({ status: 'error', message: 'Interview not found' });

    const base = { interview: summarize(interview) };
    if (interview.status !== 'in-progress' || interview.answeredQuestions >= interview.totalQuestions) {
      return res.json({ status: 'success', data: { ...base, question: null } });
    }

    const index = interview.answeredQuestions;
    if (interview.pendingQuestion && interview.pendingQuestion.index === index) {
      return res.json({ status: 'success', data: { ...base, question: questionPayload(interview, interview.pendingQuestion) } });
    }

    const { section } = locateQuestion(interview.sections, index);
    const sectionConfig = getSection(section.key);
    if (!sectionConfig) return res.status(500).json({ status: 'error', message: `Unknown section "${section.key}"` });

    const previous = await Response.find({ interviewId: interview._id }).select('question').lean();
    const generated = await ai.generateQuestion({
      roleTitle: interview.targetRole,
      level: interview.difficulty,
      section: sectionConfig,
      previous: previous.map(r => r.question)
    });

    const pending = { index, sectionKey: section.key, ...generated, askedAt: new Date() };

    // Only one concurrent request may set the question; the others return whatever won.
    const claimed = await Interview.findOneAndUpdate(
      {
        _id: interview._id,
        status: 'in-progress',
        answeredQuestions: index,
        $or: [{ pendingQuestion: null }, { 'pendingQuestion.index': { $ne: index } }]
      },
      { $set: { pendingQuestion: pending } },
      { new: true }
    );

    interview = claimed || await Interview.findById(interview._id);
    if (!interview.pendingQuestion || interview.pendingQuestion.index !== interview.answeredQuestions) {
      return res.status(409).json({ status: 'error', message: 'The interview moved on. Refresh to continue.' });
    }

    res.json({ status: 'success', data: { interview: summarize(interview), question: questionPayload(interview, interview.pendingQuestion) } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Could not load the next question' });
  }
};

async function recordResponse(req, res, { skip }) {
  const answer = skip ? '' : String(req.body.answer ?? '');
  if (!skip && !answer.trim()) {
    return res.status(400).json({ status: 'error', message: 'Write an answer before submitting' });
  }
  if (answer.length > MAX_ANSWER_LENGTH) {
    return res.status(400).json({ status: 'error', message: `Answers are limited to ${MAX_ANSWER_LENGTH} characters` });
  }

  // Take the pending question atomically so a double submit cannot grade it twice.
  const interview = await Interview.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id, status: 'in-progress', pendingQuestion: { $ne: null } },
    { $set: { pendingQuestion: null } }
  );
  if (!interview) {
    return res.status(409).json({ status: 'error', message: 'There is no open question to answer' });
  }

  const pending = interview.pendingQuestion;
  const sectionConfig = getSection(pending.sectionKey);

  try {
    const evaluation = skip
      ? {
        graded: true,
        score: 0,
        verdict: 'Skipped',
        rubric: [],
        strengths: [],
        improvements: [],
        feedback: 'Skipped. In a real interview, talking through a partial idea almost always scores better than skipping.',
        idealAnswer: []
      }
      : await ai.evaluateAnswer({
        roleTitle: interview.targetRole,
        level: interview.difficulty,
        section: sectionConfig,
        question: pending.question,
        answer
      });

    const timeSpent = Math.max(0, Math.min(Number(req.body.timeSpent) || 0, 4 * 60 * 60));
    const response = await Response.create({
      interviewId: interview._id,
      index: pending.index,
      sectionKey: pending.sectionKey,
      sectionTitle: sectionConfig.title,
      question: pending.question,
      hint: pending.hint,
      skipped: skip,
      userAnswer: answer,
      timeSpent,
      evaluation
    });

    const updated = await Interview.findByIdAndUpdate(
      interview._id,
      { $push: { responses: response._id }, $inc: { answeredQuestions: 1 } },
      { new: true }
    );

    res.json({ status: 'success', data: { response, progress: progressOf(updated) } });
  } catch (err) {
    await Interview.updateOne(
      { _id: interview._id, pendingQuestion: null, answeredQuestions: interview.answeredQuestions },
      { $set: { pendingQuestion: pending } }
    );
    throw err;
  }
}

// POST /api/interviews/:id/answer
exports.submitAnswer = async (req, res) => {
  try {
    await recordResponse(req, res, { skip: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Could not save your answer. Try again.' });
  }
};

// POST /api/interviews/:id/skip
exports.skipQuestion = async (req, res) => {
  try {
    await recordResponse(req, res, { skip: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Could not skip the question. Try again.' });
  }
};

function average(values) {
  return values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : null;
}

// POST /api/interviews/:id/complete
exports.completeInterview = async (req, res) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, userId: req.user.id }).populate('responses');
    if (!interview) return res.status(404).json({ status: 'error', message: 'Interview not found' });

    if (interview.status === 'completed') {
      return res.json({ status: 'success', data: { interview } });
    }
    if (interview.status !== 'in-progress' || interview.answeredQuestions < interview.totalQuestions) {
      return res.status(400).json({ status: 'error', message: 'Answer every question before finishing' });
    }

    const gradedScores = r => (r.evaluation?.graded && r.evaluation.score !== null ? [r.evaluation.score] : []);

    const sections = interview.sections.map(section => {
      const inSection = interview.responses.filter(r => r.sectionKey === section.key);
      return {
        key: section.key,
        title: section.title,
        score: average(inSection.flatMap(gradedScores)),
        notes: inSection.map(r => ({ section: section.title, score: r.evaluation?.score ?? null, feedback: r.evaluation?.feedback || '' }))
      };
    });
    const overallScore = average(interview.responses.flatMap(gradedScores));

    const debrief = await ai.generateOverallFeedback({
      roleTitle: interview.targetRole,
      level: interview.difficulty,
      overallScore,
      sections
    });

    const endTime = new Date();
    const result = await Interview.updateOne(
      { _id: interview._id, status: 'in-progress' },
      {
        $set: {
          sections: interview.sections.map((s, i) => ({ ...s.toObject(), score: sections[i].score })),
          overallScore,
          recommendation: ai.hireRecommendation(overallScore),
          overallFeedback: debrief.summary,
          strengths: debrief.strengths,
          improvementAreas: debrief.improvementAreas,
          recommendations: debrief.recommendations,
          status: 'completed',
          endTime,
          duration: Math.floor((endTime - interview.startTime) / 1000)
        }
      }
    );

    if (result.modifiedCount === 1) {
      const scored = await Interview.find({ userId: req.user.id, status: 'completed', overallScore: { $ne: null } }).select('overallScore').lean();
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { 'stats.totalInterviews': 1 },
        $set: {
          'stats.lastInterviewDate': endTime,
          'stats.averageScore': average(scored.map(i => i.overallScore)) || 0
        }
      });
    }

    const completed = await Interview.findById(interview._id)
      .select('-pendingQuestion')
      .populate({ path: 'responses', options: { sort: { index: 1 } } });
    res.json({ status: 'success', data: { interview: completed } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Could not finish the interview' });
  }
};

// GET /api/interviews/history
exports.getHistory = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = 10;
    const filter = { userId: req.user.id, status: 'completed' };
    const [interviews, total] = await Promise.all([
      Interview.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('targetRole difficulty overallScore recommendation sections duration createdAt'),
      Interview.countDocuments(filter)
    ]);

    res.json({ status: 'success', data: { interviews, total, page, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Could not fetch history' });
  }
};

// GET /api/interviews/:id
exports.getInterview = async (req, res) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, userId: req.user.id })
      .select('-pendingQuestion')
      .populate({ path: 'responses', options: { sort: { index: 1 } } });
    if (!interview) return res.status(404).json({ status: 'error', message: 'Interview not found' });
    res.json({ status: 'success', data: { interview } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Could not fetch interview' });
  }
};
