// backend/src/routes/resume.routes.js
const router = require('express').Router();
const { protect } = require('../middleware/auth.middleware');
const { uploadMiddleware, analyzeResume, optimizeResume } = require('../controllers/resume.controller');

router.use(protect);
router.post('/analyze', uploadMiddleware, analyzeResume);
router.post('/optimize', optimizeResume);

module.exports = router;
