const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { USER_TARGET_ROLES } = require('../config/interviewRoles');

const BCRYPT_ROUNDS = 12;

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  password: { type: String, required: true, minlength: 8, select: false },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  targetRole: {
    type: String,
    enum: USER_TARGET_ROLES,
    default: 'Not Set'
  },
  profile: {
    college: { type: String, trim: true, maxlength: 120 },
    graduationYear: { type: Number, min: 1950, max: 2100 },
    skills: { type: [{ type: String, trim: true, maxlength: 40 }], validate: v => v.length <= 30 },
    phone: { type: String, trim: true, maxlength: 20 }
  },
  stats: {
    totalInterviews: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    lastInterviewDate: Date
  },
  isActive: { type: Boolean, default: true },
  // Bumped to revoke every session token issued before it.
  tokenVersion: { type: Number, default: 0 },
  lastLogin: Date,
  emailVerified: { type: Boolean, default: false },
  // Only SHA-256 hashes of one-time email tokens are stored.
  emailVerifyTokenHash: { type: String, select: false },
  emailVerifyExpires: { type: Date, select: false },
  resetTokenHash: { type: String, select: false },
  resetExpires: { type: Date, select: false },
  // 6-digit codes sent alongside the links (hash, expiry, wrong-attempt count).
  emailVerifyCodeHash: { type: String, select: false },
  emailVerifyCodeExpires: { type: Date, select: false },
  emailVerifyAttempts: { type: Number, select: false },
  resetCodeHash: { type: String, select: false },
  resetAttempts: { type: Number, select: false }
}, { timestamps: true });

userSchema.index({ emailVerifyTokenHash: 1 }, { sparse: true });
userSchema.index({ resetTokenHash: 1 }, { sparse: true });

const PRIVATE_FIELDS = [
  'password', 'tokenVersion', 'emailVerifyTokenHash', 'emailVerifyExpires', 'resetTokenHash', 'resetExpires',
  'emailVerifyCodeHash', 'emailVerifyCodeExpires', 'emailVerifyAttempts', 'resetCodeHash', 'resetAttempts', '__v'
];

// Never serialize secrets, even if a query explicitly selected them.
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    for (const field of PRIVATE_FIELDS) delete ret[field];
    return ret;
  }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, BCRYPT_ROUNDS);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// True when the stored hash was made with fewer rounds than we use now.
userSchema.methods.needsRehash = function () {
  return bcrypt.getRounds(this.password) < BCRYPT_ROUNDS;
};

module.exports = mongoose.model('User', userSchema);
