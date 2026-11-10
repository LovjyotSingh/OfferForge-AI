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

module.exports = { PASSWORD_MIN, PASSWORD_MAX, EMAIL_RE, str, passwordProblem, createToken, hashToken, isTokenShaped };
