const crypto = require('crypto');

const PASSWORD_MIN = 8;
const PASSWORD_MAX = 72; // bcrypt ignores everything past 72 bytes
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const str = v => (typeof v === 'string' ? v : '');

function passwordProblem(password, { name = '', email = '' } = {}) {
  if (password.length < PASSWORD_MIN) return `Password must be at least ${PASSWORD_MIN} characters`;
  if (Buffer.byteLength(password, 'utf8') > PASSWORD_MAX) return `Password must be at most ${PASSWORD_MAX} characters`;
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) return 'Password must include at least one letter and one number';
  const lower = password.toLowerCase();
  const local = email.split('@')[0];
  if ((email && lower === email) || (name && lower === name.toLowerCase()) || (local.length >= 4 && lower.includes(local))) {
    return 'Password must not contain your name or email';
  }
  return null;
}

// One-time tokens for email links. Only a SHA-256 hash is stored, so a database
// leak doesn't hand out working links.
function createToken() {
  const token = crypto.randomBytes(32).toString('base64url');
  return { token, hash: hashToken(token) };
}

function hashToken(token) {
  return crypto.createHash('sha256').update(String(token)).digest('hex');
}

const isTokenShaped = t => typeof t === 'string' && /^[A-Za-z0-9_-]{43}$/.test(t);

// 6-digit one-time codes people can read on one device and type on another.
// A code alone is guessable (1 in a million), so each one also has a short
// expiry and a hard cap on wrong attempts. The hash is tied to the user and
// purpose, so the same digits can't be reused across accounts or flows.
const CODE_MAX_ATTEMPTS = 5;

function createCode(purpose, userId) {
  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
  return { code, hash: hashCode(purpose, userId, code) };
}

function hashCode(purpose, userId, code) {
  return crypto.createHash('sha256').update(`${purpose}:${userId}:${code}`).digest('hex');
}

function codeMatches(storedHash, purpose, userId, code) {
  if (!storedHash) return false;
  const a = Buffer.from(storedHash, 'hex');
  const b = Buffer.from(hashCode(purpose, userId, code), 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Accepts "123456", "123 456" or "123-456".
function normalizeCode(value) {
  const digits = typeof value === 'string' ? value.replace(/[\s-]/g, '') : '';
  return /^\d{6}$/.test(digits) ? digits : null;
}

module.exports = {
  PASSWORD_MIN, PASSWORD_MAX, EMAIL_RE, CODE_MAX_ATTEMPTS,
  str, passwordProblem, createToken, hashToken, isTokenShaped,
  createCode, codeMatches, normalizeCode
};
