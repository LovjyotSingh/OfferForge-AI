const router = require('express').Router();
const { getAIStatus, chat } = require('../controllers/ai.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/status', getAIStatus);
router.post('/chat', chat);

module.exports = router;
