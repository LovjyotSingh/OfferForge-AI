const mongoose = require('mongoose');

// Rate-limit counters shared by every serverless instance, kept in MongoDB.
// In-memory counters reset whenever Vercel starts a new instance, so an
// attacker spread across instances could otherwise get past the limits.
const counterSchema = new mongoose.Schema({
  _id: String,
  hits: Number,
  resetAt: Date
}, { versionKey: false, collection: 'ratelimits' });
// MongoDB deletes each counter shortly after its window ends.
counterSchema.index({ resetAt: 1 }, { expireAfterSeconds: 0 });

const Counter = mongoose.models.RateLimitCounter || mongoose.model('RateLimitCounter', counterSchema);

class MongoRateLimitStore {
  constructor(prefix) {
    this.prefix = prefix;
    // Each limiter needs its own prefix so their counters never collide.
    this.localKeys = false;
  }

  init(options) {
    this.windowMs = options.windowMs;
  }

  key(key) {
    return `${this.prefix}:${key}`;
  }

  async increment(key) {
    const now = new Date();
    const fresh = new Date(now.getTime() + this.windowMs);
    // One atomic update: start a new window if the old one ended, otherwise count the hit.
    const doc = await Counter.findOneAndUpdate(
      { _id: this.key(key) },
      [{
        $set: {
          hits: { $cond: [{ $gt: [{ $ifNull: ['$resetAt', now] }, now] }, { $add: ['$hits', 1] }, 1] },
          resetAt: { $cond: [{ $gt: [{ $ifNull: ['$resetAt', now] }, now] }, '$resetAt', fresh] }
        }
      }],
      { upsert: true, new: true, lean: true }
    );
    return { totalHits: doc.hits, resetTime: doc.resetAt };
  }

  async decrement(key) {
    await Counter.updateOne({ _id: this.key(key), hits: { $gt: 0 } }, { $inc: { hits: -1 } });
  }

  async resetKey(key) {
    await Counter.deleteOne({ _id: this.key(key) });
  }
}

module.exports = MongoRateLimitStore;
