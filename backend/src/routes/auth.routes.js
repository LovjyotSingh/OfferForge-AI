// backend/src/routes/auth.routes.js
const router = require('express').Router();
const c = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const limits = require('../utils/rateLimit');

// Rate limits are stored in MongoDB, so they hold across every serverless instance.
router.post('/register', limits.register, c.register);
router.post('/login', limits.loginIp, limits.login, c.login);
router.post('/logout', c.logout);
router.post('/logout-all', protect, c.logoutAll);
router.get('/me', protect, c.getMe);
router.put('/profile', protect, c.updateProfile);

module.exports = router;
