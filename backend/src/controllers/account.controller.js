const { waitUntil } = require('@vercel/functions');
const User = require('../models/User.model');
const Interview = require('../models/Interview.model');
const Response = require('../models/Response.model');
const { setSessionCookie, clearSessionCookie } = require('../middleware/auth.middleware');
const { EMAIL_RE, str, passwordProblem, createToken, hashToken, isTokenShaped } = require('../utils/security');
const email = require('../services/email.service');
const publicUser = require('../utils/publicUser');

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;
const RESET_TTL_MS = 30 * 60 * 1000;

const fail = (res, status, message, extra = {}) => res.status(status).json({ status: 'error', message, ...extra });

// Runs after the response is sent, so slow email delivery can't reveal whether an
// account exists. On Vercel, waitUntil keeps the function alive until it finishes.
function inBackground(task) {
  const promise = Promise.resolve().then(task).catch(err => console.error('Background email failed:', err.message));
  try {
    waitUntil(promise);
  } catch {
    // Not running on Vercel; the promise still completes on its own.
  }
}

// Creates a fresh verification token (invalidating any older link) and emails it.
async function sendVerification(user) {
  const { token, hash } = createToken();
  await User.updateOne(
    { _id: user._id },
    { $set: { emailVerifyTokenHash: hash, emailVerifyExpires: new Date(Date.now() + VERIFY_TTL_MS) } }
  );
  try {
    await email.sendVerificationEmail(user, token);
    return true;
  } catch (err) {
    console.error('Verification email failed:', err.message);
    return false;
  }
}
exports.sendVerification = sendVerification;

// POST /api/account/resend-verification  (signed in)
exports.resendVerification = async (req, res, next) => {
  try {
    if (!email.isEmailConfigured()) return fail(res, 503, 'Email is not set up on this site yet.');
    if (req.user.emailVerified) return res.json({ status: 'success', message: 'Your email is already confirmed.' });
    const sent = await sendVerification(req.user);
    if (!sent) return fail(res, 502, "We couldn't send the email right now. Try again in a few minutes.");
    res.json({ status: 'success', message: `We sent a new confirmation link to ${req.user.email}.` });
  } catch (err) {
    next(err);
  }
};

// POST /api/account/verify-email  { token }  (works without being signed in)
exports.verifyEmail = async (req, res, next) => {
  try {
    const token = req.body.token;
    if (!isTokenShaped(token)) return fail(res, 400, 'This confirmation link is invalid.');
    const user = await User.findOneAndUpdate(
      { emailVerifyTokenHash: hashToken(token), emailVerifyExpires: { $gt: new Date() } },
      { $set: { emailVerified: true }, $unset: { emailVerifyTokenHash: 1, emailVerifyExpires: 1 } },
      { new: true }
    );
    if (!user) return fail(res, 400, 'This confirmation link is invalid or has expired. Sign in to get a new one.');
    res.json({ status: 'success', message: 'Your email is confirmed.', data: { user: publicUser(user) } });
  } catch (err) {
    next(err);
  }
};

// POST /api/account/forgot-password  { email }
// Always gives the same answer, so it can't be used to find out who has an account.
exports.forgotPassword = async (req, res, next) => {
  try {
    if (!email.isEmailConfigured()) return fail(res, 503, "Password reset by email isn't available yet.");
    const address = str(req.body.email).trim().toLowerCase();
    if (!EMAIL_RE.test(address) || address.length > 254) return fail(res, 400, 'Enter a valid email address');

    const user = await User.findOne({ email: address, isActive: true });
    if (user) {
      const { token, hash } = createToken();
      await User.updateOne({ _id: user._id }, { $set: { resetTokenHash: hash, resetExpires: new Date(Date.now() + RESET_TTL_MS) } });
      inBackground(() => email.sendPasswordResetEmail(user, token));
    }
    res.json({ status: 'success', message: 'If an account exists for that email, a reset link is on its way. Check your inbox and spam folder.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/account/reset-password  { token, password }
exports.resetPassword = async (req, res, next) => {
  try {
    const token = req.body.token;
    const password = str(req.body.password);
    if (!isTokenShaped(token)) return fail(res, 400, 'This reset link is invalid.');

    const user = await User.findOne({ resetTokenHash: hashToken(token), resetExpires: { $gt: new Date() } }).select('+resetTokenHash');
    if (!user) return fail(res, 400, 'This reset link is invalid or has expired. Request a new one.');

    const problem = passwordProblem(password, { name: user.name, email: user.email });
    if (problem) return fail(res, 400, problem);

    user.password = password;
    user.resetTokenHash = undefined;
    user.resetExpires = undefined;
    user.emailVerified = true; // they just proved they control the inbox
    user.tokenVersion = (user.tokenVersion || 0) + 1; // sign out every device
    await user.save({ validateBeforeSave: false });

    clearSessionCookie(res);
    inBackground(() => email.sendPasswordChangedEmail(user));
    res.json({ status: 'success', message: 'Your password was reset. Sign in with your new password.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/account/change-password  { currentPassword, newPassword }  (signed in)
exports.changePassword = async (req, res, next) => {
  try {
    const currentPassword = str(req.body.currentPassword);
    const newPassword = str(req.body.newPassword);
    const user = await User.findById(req.user._id).select('+password');
    if (!currentPassword || !(await user.comparePassword(currentPassword))) return fail(res, 401, 'Your current password is incorrect.');

    const problem = passwordProblem(newPassword, { name: user.name, email: user.email });
    if (problem) return fail(res, 400, problem);
    if (await user.comparePassword(newPassword)) return fail(res, 400, 'Choose a password different from your current one.');

    user.password = newPassword;
    user.tokenVersion = (user.tokenVersion || 0) + 1; // sign out other devices
    await user.save({ validateBeforeSave: false });
    setSessionCookie(res, user, true); // keep this device signed in

    if (email.isEmailConfigured()) inBackground(() => email.sendPasswordChangedEmail(user));
    res.json({ status: 'success', message: 'Password changed. Other devices were signed out.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/account/delete  { password }  (signed in)
// Permanently removes the account and every interview and answer that belongs to it.
exports.deleteAccount = async (req, res, next) => {
  try {
    const password = str(req.body.password);
    const user = await User.findById(req.user._id).select('+password');
    if (!password || !(await user.comparePassword(password))) return fail(res, 401, 'Your password is incorrect.');

    const interviewIds = await Interview.find({ userId: user._id }).distinct('_id');
    await Response.deleteMany({ interviewId: { $in: interviewIds } });
    await Interview.deleteMany({ userId: user._id });
    await User.deleteOne({ _id: user._id });

    clearSessionCookie(res);
    res.json({ status: 'success', message: 'Your account and all its data were deleted.' });
  } catch (err) {
    next(err);
  }
};

// GET /api/account/export  (signed in) — a copy of everything we store about the user.
exports.exportData = async (req, res, next) => {
  try {
    const interviews = await Interview.find({ userId: req.user._id }).select('-pendingQuestion -__v').lean();
    const responses = await Response.find({ interviewId: { $in: interviews.map(i => i._id) } }).select('-__v').lean();
    res.setHeader('Content-Disposition', 'attachment; filename="offerforge-my-data.json"');
    res.json({ exportedAt: new Date().toISOString(), account: req.user.toJSON(), interviews, responses });
  } catch (err) {
    next(err);
  }
};
