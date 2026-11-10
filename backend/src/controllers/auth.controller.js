const bcrypt = require('bcryptjs');
const User = require('../models/User.model');
const { USER_TARGET_ROLES } = require('../config/interviewRoles');
const { setSessionCookie, clearSessionCookie } = require('../middleware/auth.middleware');
const { EMAIL_RE, str, passwordProblem } = require('../utils/security');
const { sendVerification } = require('./account.controller');
const { isEmailConfigured } = require('../services/email.service');

// Hash of a random value nobody knows. Compared against when the email is unknown,
// so "no such account" takes as long as "wrong password" and emails can't be probed by timing.
const DUMMY_HASH = '$2a$12$jAAd9BabOsmiqKtmFOWeDuy6G8wMhKLrqSD2y2ZcnosSe60E4YdyG';

const publicUser = require('../utils/publicUser');

exports.register = async (req, res) => {
  try {
    const name = str(req.body.name).trim();
    const email = str(req.body.email).trim().toLowerCase();
    const password = str(req.body.password);
    const targetRole = str(req.body.targetRole) || 'Not Set';

    if (!name || !email || !password)
      return res.status(400).json({ status: 'error', message: 'Name, email and password are required' });
    if (name.length < 2 || name.length > 50)
      return res.status(400).json({ status: 'error', message: 'Name must be 2 to 50 characters' });
    if (email.length > 254 || !EMAIL_RE.test(email))
      return res.status(400).json({ status: 'error', message: 'Enter a valid email address' });
    if (!USER_TARGET_ROLES.includes(targetRole))
      return res.status(400).json({ status: 'error', message: 'Pick a valid target role' });
    const problem = passwordProblem(password, { name, email });
    if (problem) return res.status(400).json({ status: 'error', message: problem });

    if (await User.exists({ email }))
      return res.status(409).json({ status: 'error', message: 'An account with this email already exists. Try signing in.' });

    const user = await User.create({ name, email, password, targetRole });
    setSessionCookie(res, user, req.body.rememberMe !== false);
    if (isEmailConfigured()) await sendVerification(user);

    res.status(201).json({ status: 'success', message: 'Account created successfully!', data: { user: publicUser(user) } });
  } catch (err) {
    if (err?.code === 11000)
      return res.status(409).json({ status: 'error', message: 'An account with this email already exists. Try signing in.' });
    console.error('Register error:', err.message);
    res.status(500).json({ status: 'error', message: 'Registration failed. Please try again.' });
  }
};

exports.login = async (req, res) => {
  try {
    const email = str(req.body.email).trim().toLowerCase();
    const password = str(req.body.password);
    if (!email || !password)
      return res.status(400).json({ status: 'error', message: 'Email and password are required' });

    const user = await User.findOne({ email }).select('+password');
    const ok = await bcrypt.compare(password.slice(0, 200), user ? user.password : DUMMY_HASH);
    if (!user || !ok || !user.isActive)
      return res.status(401).json({ status: 'error', message: 'Invalid email or password' });

    // Upgrade older, weaker hashes transparently on a successful login.
    if (user.needsRehash()) user.password = password;
    user.lastLogin = new Date();
    // Skip validation: older accounts may predate the current password-length rule.
    await user.save({ validateBeforeSave: false });

    setSessionCookie(res, user, req.body.rememberMe !== false);
    res.status(200).json({ status: 'success', data: { user: publicUser(user) } });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ status: 'error', message: 'Login failed. Please try again.' });
  }
};

exports.logout = (req, res) => {
  clearSessionCookie(res);
  res.json({ status: 'success' });
};

// Revokes every session on every device by invalidating all previously issued tokens.
exports.logoutAll = async (req, res, next) => {
  try {
    await User.updateOne({ _id: req.user._id }, { $inc: { tokenVersion: 1 } });
    clearSessionCookie(res);
    res.json({ status: 'success' });
  } catch (err) {
    next(err);
  }
};

exports.getMe = (req, res) => {
  res.json({ status: 'success', data: { user: publicUser(req.user) } });
};

exports.updateProfile = async (req, res) => {
  try {
    const update = {};
    if (req.body.name !== undefined) update.name = str(req.body.name).trim();
    if (req.body.targetRole !== undefined) {
      if (!USER_TARGET_ROLES.includes(req.body.targetRole))
        return res.status(400).json({ status: 'error', message: 'Pick a valid target role' });
      update.targetRole = req.body.targetRole;
    }
    const profile = req.body.profile;
    if (profile && typeof profile === 'object') {
      if (profile.college !== undefined) update['profile.college'] = str(profile.college);
      if (profile.phone !== undefined) update['profile.phone'] = str(profile.phone);
      if (profile.graduationYear !== undefined) update['profile.graduationYear'] = Number(profile.graduationYear) || undefined;
      if (Array.isArray(profile.skills)) update['profile.skills'] = profile.skills.filter(s => typeof s === 'string');
    }

    const user = await User.findByIdAndUpdate(req.user._id, { $set: update }, { new: true, runValidators: true });
    res.json({ status: 'success', data: { user: publicUser(user) } });
  } catch (err) {
    if (err?.name === 'ValidationError')
      return res.status(400).json({ status: 'error', message: 'Some profile fields are invalid' });
    res.status(500).json({ status: 'error', message: 'Update failed' });
  }
};
