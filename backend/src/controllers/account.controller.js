const { waitUntil } = require('@vercel/functions');
const User = require('../models/User.model');
const Interview = require('../models/Interview.model');
const Response = require('../models/Response.model');
const { setSessionCookie, clearSessionCookie } = require('../middleware/auth.middleware');
const {
  EMAIL_RE, CODE_MAX_ATTEMPTS, str, passwordProblem, createToken, hashToken, isTokenShaped,
  createCode, codeMatches, normalizeCode
} = require('../utils/security');
const email = require('../services/email.service');
const publicUser = require('../utils/publicUser');

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000; // link
const VERIFY_CODE_TTL_MS = 30 * 60 * 1000; // code
const RESET_TTL_MS = 30 * 60 * 1000; // link and code

const VERIFY_CODE_FIELDS = { emailVerifyCodeHash: 1, emailVerifyCodeExpires: 1, emailVerifyAttempts: 1 };
const VERIFY_FIELDS = { emailVerifyTokenHash: 1, emailVerifyExpires: 1, ...VERIFY_CODE_FIELDS };
const RESET_FIELDS = { resetTokenHash: 1, resetExpires: 1, resetCodeHash: 1, resetAttempts: 1 };

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

// Uses up one of a code's attempts before checking it, atomically, so even
// parallel guesses can never exceed CODE_MAX_ATTEMPTS.
async function claimAttempt(userId, field) {
  const result = await User.updateOne(
    { _id: userId, $or: [{ [field]: { $lt: CODE_MAX_ATTEMPTS } }, { [field]: { $exists: false } }] },
    { $inc: { [field]: 1 } }
  );
  return result.modifiedCount === 1;
}

// Creates a fresh link + code (invalidating older ones) and emails them.
async function sendVerification(user) {
  const { token, hash } = createToken();
  const { code, hash: codeHash } = createCode('verify', user._id);
  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        emailVerifyTokenHash: hash,
        emailVerifyExpires: new Date(Date.now() + VERIFY_TTL_MS),
        emailVerifyCodeHash: codeHash,
        emailVerifyCodeExpires: new Date(Date.now() + VERIFY_CODE_TTL_MS),
        emailVerifyAttempts: 0
      }
    }
  );
  try {
    await email.sendVerificationEmail(user, token, code);
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
    res.json({ status: 'success', message: `We sent a new code to ${req.user.email}.` });
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
      { $set: { emailVerified: true }, $unset: VERIFY_FIELDS },
      { new: true }
    );
    if (!user) return fail(res, 400, 'This confirmation link is invalid or has expired. Sign in to get a new one.');
    res.json({ status: 'success', message: 'Your email is confirmed.', data: { user: publicUser(user) } });
  } catch (err) {
    next(err);
  }
};

// POST /api/account/verify-code  { code }  (signed in)
exports.verifyCode = async (req, res, next) => {
  try {
    const code = normalizeCode(req.body.code);
    if (!code) return fail(res, 400, 'Enter the 6-digit code from the email.');
    if (req.user.emailVerified) return res.json({ status: 'success', message: 'Your email is already confirmed.', data: { user: publicUser(req.user) } });

    const user = await User.findById(req.user._id).select('+emailVerifyCodeHash +emailVerifyCodeExpires');
    if (!user.emailVerifyCodeHash || !(user.emailVerifyCodeExpires > new Date())) {
      return fail(res, 400, 'This code has expired. Send a new one.');
    }
    if (!(await claimAttempt(user._id, 'emailVerifyAttempts'))) {
      return fail(res, 429, 'Too many wrong codes. Send a new one.');
    }
    if (!codeMatches(user.emailVerifyCodeHash, 'verify', user._id, code)) {
      return fail(res, 400, "That code isn't right. Check the email and try again.");
    }

    const updated = await User.findByIdAndUpdate(user._id, { $set: { emailVerified: true }, $unset: VERIFY_FIELDS }, { new: true });
    res.json({ status: 'success', message: 'Your email is confirmed.', data: { user: publicUser(updated) } });
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
      const { code, hash: codeHash } = createCode('reset', user._id);
      await User.updateOne(
        { _id: user._id },
        { $set: { resetTokenHash: hash, resetCodeHash: codeHash, resetAttempts: 0, resetExpires: new Date(Date.now() + RESET_TTL_MS) } }
      );
      inBackground(() => email.sendPasswordResetEmail(user, token, code));
    }
    res.json({ status: 'success', message: 'If an account exists for that email, we sent it a 6-digit code. Check your inbox and spam folder.' });
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

    await finishReset(user, password);
    clearSessionCookie(res);
    res.json({ status: 'success', message: 'Your password was reset. Sign in with your new password.' });
  } catch (err) {
    next(err);
  }
};

// Sets the new password, burns the link and code, and signs out every device.
async function finishReset(user, password) {
  const fresh = await User.findById(user._id).select('+password');
  fresh.password = password;
  fresh.emailVerified = true; // they just proved they control the inbox
  fresh.tokenVersion = (fresh.tokenVersion || 0) + 1;
  await fresh.save({ validateBeforeSave: false });
  await User.updateOne({ _id: user._id }, { $unset: RESET_FIELDS });
  inBackground(() => email.sendPasswordChangedEmail(fresh));
}

const WRONG_RESET_CODE = "That code isn't right or has expired. Check the email, or request a new code.";

// POST /api/account/reset-password-code  { email, code, password }
// Unknown emails get the same answer as wrong codes, so it reveals nothing.
exports.resetPasswordWithCode = async (req, res, next) => {
  try {
    const address = str(req.body.email).trim().toLowerCase();
    const code = normalizeCode(req.body.code);
    const password = str(req.body.password);
    if (!EMAIL_RE.test(address) || address.length > 254) return fail(res, 400, 'Enter a valid email address');
    if (!code) return fail(res, 400, 'Enter the 6-digit code from the email.');

    const user = await User.findOne({ email: address, isActive: true }).select('+resetCodeHash +resetExpires');
    if (!user || !user.resetCodeHash || !(user.resetExpires > new Date())) return fail(res, 400, WRONG_RESET_CODE);

    // Check the new password first so a typo there doesn't burn an attempt.
    const problem = passwordProblem(password, { name: user.name, email: user.email });
    if (problem) return fail(res, 400, problem);

    if (!(await claimAttempt(user._id, 'resetAttempts'))) return fail(res, 429, 'Too many wrong codes. Request a new one.');
    if (!codeMatches(user.resetCodeHash, 'reset', user._id, code)) return fail(res, 400, WRONG_RESET_CODE);

    await finishReset(user, password);
    clearSessionCookie(res);
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
