const rateLimit = require('express-rate-limit');
const MongoRateLimitStore = require('./mongoRateLimitStore');

// Builds a rate limiter whose counters live in MongoDB (shared across instances).
// If the database hiccups, requests are let through rather than failing the site.
function limiter(name, { windowMs, max, message, ...rest }) {
  return rateLimit({
    windowMs,
    max,
    store: new MongoRateLimitStore(name),
    passOnStoreError: true,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { status: 'error', message },
    ...rest
  });
}

const MINUTE = 60 * 1000;
const email = req => String(req.body?.email || '').toLowerCase().slice(0, 254);

module.exports = {
  limiter,
  MINUTE,
  // Per-IP+email: 10 failed sign-ins per 15 minutes.
  login: limiter('login', {
    windowMs: 15 * MINUTE,
    max: 10,
    skipSuccessfulRequests: true,
    keyGenerator: req => `${req.ip}|${email(req)}`,
    message: 'Too many failed sign-in attempts. Try again in 15 minutes.'
  }),
  // Per-IP across all emails: stops password spraying.
  loginIp: limiter('login-ip', {
    windowMs: 15 * MINUTE,
    max: 30,
    skipSuccessfulRequests: true,
    message: 'Too many sign-in attempts from this network. Try again later.'
  }),
  register: limiter('register', {
    windowMs: 60 * MINUTE,
    max: 5,
    skipFailedRequests: true,
    message: 'Too many accounts created from this network. Try again in an hour.'
  }),
  // Emails cost a send and can be used to spam someone's inbox.
  emailIp: limiter('email-ip', {
    windowMs: 60 * MINUTE,
    max: 10,
    message: 'Too many email requests. Try again in an hour.'
  }),
  emailTarget: limiter('email-target', {
    windowMs: 60 * MINUTE,
    max: 3,
    keyGenerator: req => email(req) || `user:${req.user?._id}`,
    message: 'Too many emails requested for this address. Try again in an hour.'
  }),
  // Token guessing on reset/verify links.
  token: limiter('token', {
    windowMs: 15 * MINUTE,
    max: 20,
    message: 'Too many attempts. Try again later.'
  }),
  // Sensitive actions that re-check the password (e.g. deleting the account).
  sensitive: limiter('sensitive', {
    windowMs: 15 * MINUTE,
    max: 5,
    skipSuccessfulRequests: true,
    keyGenerator: req => `user:${req.user?._id || req.ip}`,
    message: 'Too many attempts. Try again in 15 minutes.'
  }),
  // Coarse flood protection on every request. Kept in memory so normal API
  // calls don't pay for an extra database write.
  general: rateLimit({
    windowMs: 15 * MINUTE,
    max: 300,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { status: 'error', message: 'Too many requests. Please slow down.' }
  })
};
