const { isEmailConfigured } = require('../services/email.service');

// The only user fields ever sent to the browser.
module.exports = function publicUser(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    targetRole: user.targetRole,
    stats: user.stats,
    emailVerified: Boolean(user.emailVerified),
    // Verification is only enforced once the site can actually send email.
    needsVerification: isEmailConfigured() && !user.emailVerified
  };
};
