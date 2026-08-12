const ai = require('../services/ai.service');

// GET /api/ai/status
exports.getAIStatus = async (req, res) => {
  try {
    const status = await ai.getAIStatus();
    res.json({ status: 'success', data: status });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message || 'Could not fetch AI status' });
  }
};

// POST /api/ai/chat
exports.chat = async (req, res) => {
  try {
    const { message, context } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ status: 'error', message: 'Message is required' });
    }

    const reply = await ai.chatWithContext(message.trim(), context || {});
    res.json({ status: 'success', data: { reply } });
  } catch (err) {
    console.error('AI chat error:', err);
    res.status(500).json({ status: 'error', message: err.message || 'AI Chat assistance failed' });
  }
};
