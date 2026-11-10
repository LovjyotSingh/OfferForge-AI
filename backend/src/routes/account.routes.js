const router = require('express').Router();
const c = require('../controllers/account.controller');
const { protect } = require('../middleware/auth.middleware');
const limits = require('../utils/rateLimit');

// Email links and codes (no sign-in needed)
router.post('/verify-email', limits.token, c.verifyEmail);
router.post('/forgot-password', limits.emailIp, limits.emailTarget, c.forgotPassword);
router.post('/reset-password', limits.token, c.resetPassword);
router.post('/reset-password-code', limits.token, c.resetPasswordWithCode);

// Signed-in account management
router.post('/resend-verification', protect, limits.emailIp, limits.emailTarget, c.resendVerification);
router.post('/verify-code', protect, limits.token, c.verifyCode);
router.post('/change-password', protect, limits.sensitive, c.changePassword);
router.post('/delete', protect, limits.sensitive, c.deleteAccount);
router.get('/export', protect, c.exportData);

module.exports = router;
