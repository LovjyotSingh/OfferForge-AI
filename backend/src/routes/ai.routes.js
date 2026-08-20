const router = require('express').Router();
const { getAIStatus, chat, analyzeJobCopilot } = require('../controllers/ai.controller');
const { protect } = require('../middleware/auth.middleware');

// Public or optionally protected endpoint
router.get('/status', getAIStatus);
router.post('/chat', protect, chat);
router.post('/job-copilot', (req, res, next) => {
  // Optional auth: if token is present, decode it, otherwise allow public/guest usage
  if (req.headers.authorization) {
    return protect(req, res, next);
  }
  next();
}, analyzeJobCopilot);

module.exports = router;

