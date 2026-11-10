const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

const isSecure = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
// The __Host- prefix makes the browser refuse the cookie unless it is Secure, host-only and path=/.
const COOKIE_NAME = isSecure ? '__Host-of_session' : 'of_session';
const SESSION_DAYS = 7;
const JWT_OPTIONS = { issuer: 'offerforge-api', audience: 'offerforge-web' };

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET is missing or too short (need at least 32 characters).');
  }
  return secret;
}

function signToken(user) {
  return jwt.sign(
    { sub: String(user._id), ver: user.tokenVersion || 0 },
    getSecret(),
    { ...JWT_OPTIONS, algorithm: 'HS256', expiresIn: `${SESSION_DAYS}d` }
  );
}

// rememberMe=false gives a browser-session cookie; the JWT itself still expires after SESSION_DAYS.
function setSessionCookie(res, user, rememberMe = true) {
  res.cookie(COOKIE_NAME, signToken(user), {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    path: '/',
    ...(rememberMe ? { maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000 } : {})
  });
}

function clearSessionCookie(res) {
  res.clearCookie(COOKIE_NAME, { httpOnly: true, secure: isSecure, sameSite: 'lax', path: '/' });
}

exports.setSessionCookie = setSessionCookie;
exports.clearSessionCookie = clearSessionCookie;

exports.protect = async (req, res, next) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.status(401).json({ status: 'error', message: 'Please login to continue' });

  let decoded;
  try {
    decoded = jwt.verify(token, getSecret(), { ...JWT_OPTIONS, algorithms: ['HS256'] });
  } catch {
    clearSessionCookie(res);
    return res.status(401).json({ status: 'error', message: 'Your session expired. Please login again.' });
  }

  try {
    const user = await User.findById(decoded.sub);
    // tokenVersion lets "log out everywhere" revoke every token issued before it.
    if (!user || !user.isActive || (user.tokenVersion || 0) !== decoded.ver) {
      clearSessionCookie(res);
      return res.status(401).json({ status: 'error', message: 'Please login to continue' });
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

exports.adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ status: 'error', message: 'Admin access required' });
  next();
};
