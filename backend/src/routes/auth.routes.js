// backend/src/routes/auth.routes.js
const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const c = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

const limited = message => ({
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { status: 'error', message }
});

// Brute-force protection: 10 failed logins per IP+email per 15 minutes.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  keyGenerator: req => `${req.ip}|${String(req.body?.email || '').toLowerCase().slice(0, 254)}`,
  ...limited('Too many failed sign-in attempts. Try again in 15 minutes.')
});

// And 30 failed logins per IP across all emails (stops password spraying).
const loginIpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  skipSuccessfulRequests: true,
  ...limited('Too many sign-in attempts from this network. Try again later.')
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  skipFailedRequests: true, // only count accounts actually created, not typos
  ...limited('Too many accounts created from this network. Try again in an hour.')
});

router.post('/register', registerLimiter, c.register);
router.post('/login', loginIpLimiter, loginLimiter, c.login);
router.post('/logout', c.logout);
router.post('/logout-all', protect, c.logoutAll);
router.get('/me', protect, c.getMe);
router.put('/profile', protect, c.updateProfile);

module.exports = router;
