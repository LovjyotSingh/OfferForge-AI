const Interview = require('../models/Interview.model');

function average(values) {
  return values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : null;
}

// GET /api/analytics/dashboard
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const [completed, inProgress] = await Promise.all([
      Interview.find({ userId, status: 'completed' })
        .sort({ createdAt: 1 })
        .select('targetRole difficulty overallScore recommendation sections duration createdAt')
        .lean(),
      Interview.findOne({ userId, status: 'in-progress' })
        .sort({ createdAt: -1 })
        .select('targetRole difficulty answeredQuestions totalQuestions createdAt')
        .lean()
    ]);

    const scores = completed.map(i => i.overallScore).filter(s => typeof s === 'number');

    const bySection = new Map();
    for (const interview of completed) {
      for (const section of interview.sections || []) {
        if (typeof section.score !== 'number') continue;
        const entry = bySection.get(section.key) || { key: section.key, title: section.title, scores: [] };
        entry.scores.push(section.score);
        bySection.set(section.key, entry);
      }
    }
    const sectionStats = [...bySection.values()]
      .map(s => ({ key: s.key, title: s.title, averageScore: average(s.scores), attempts: s.scores.length }))
      .sort((a, b) => a.averageScore - b.averageScore);

    res.json({
      status: 'success',
      data: {
        overview: {
          totalInterviews: completed.length,
          averageScore: average(scores),
          bestScore: scores.length ? Math.max(...scores) : null
        },
        sectionStats,
        trend: completed
          .filter(i => typeof i.overallScore === 'number')
          .slice(-12)
          .map(i => ({ date: i.createdAt, score: i.overallScore, role: i.targetRole })),
        recentInterviews: completed.slice(-5).reverse(),
        inProgress
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Could not fetch analytics' });
  }
};
