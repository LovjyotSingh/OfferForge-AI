const nodemailer = require('nodemailer');

// Works with any SMTP provider. Free options:
//   Gmail:  SMTP_HOST=smtp.gmail.com     SMTP_PORT=465  SMTP_USER=you@gmail.com  SMTP_PASS=<16-char app password>
//   Brevo:  SMTP_HOST=smtp-relay.brevo.com SMTP_PORT=587 SMTP_USER=<brevo login> SMTP_PASS=<brevo SMTP key>
// While these are unset, email features switch off and sign-up works without verification.

let transport = null;

function isEmailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransport() {
  if (!transport) {
    const port = Number(process.env.SMTP_PORT) || 465;
    transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      requireTLS: port !== 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      connectionTimeout: 10000,
      socketTimeout: 15000,
      disableFileAccess: true,
      disableUrlAccess: true
    });
  }
  return transport;
}

// Links in emails must point at our own site. Never build them from the request's
// Host header, or an attacker could make reset links point at their server.
function appUrl() {
  const configured = process.env.APP_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
  return (configured || 'http://localhost:5173').replace(/\/$/, '');
}

const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function layout({ heading, body, buttonText, link, footnote }) {
  return `<!doctype html><html><body style="margin:0;background:#0B0A09;font-family:Inter,Arial,sans-serif;color:#F5F1EA">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#1A1714;border:1px solid #2A2621;border-radius:16px;padding:32px">
<tr><td style="font-size:14px;font-weight:600;color:#FF6B1A;letter-spacing:.02em">OfferForge AI</td></tr>
<tr><td style="padding-top:20px;font-size:22px;font-weight:600">${escapeHtml(heading)}</td></tr>
<tr><td style="padding-top:12px;font-size:15px;line-height:1.6;color:#C9C2B8">${escapeHtml(body)}</td></tr>
<tr><td style="padding-top:28px"><a href="${escapeHtml(link)}" style="display:inline-block;background:#FF6B1A;color:#0B0A09;text-decoration:none;font-weight:600;font-size:15px;padding:12px 22px;border-radius:999px">${escapeHtml(buttonText)}</a></td></tr>
<tr><td style="padding-top:28px;font-size:12px;line-height:1.6;color:#8A8278">${escapeHtml(footnote)}<br>If the button doesn't work, paste this link into your browser:<br><span style="word-break:break-all">${escapeHtml(link)}</span></td></tr>
</table></td></tr></table></body></html>`;
}

async function send({ to, subject, heading, body, buttonText, link, footnote }) {
  const from = process.env.EMAIL_FROM || `OfferForge AI <${process.env.SMTP_USER}>`;
  const text = `${heading}\n\n${body}\n\n${buttonText}: ${link}\n\n${footnote}`;
  await getTransport().sendMail({ from, to, subject, text, html: layout({ heading, body, buttonText, link, footnote }) });
}

exports.isEmailConfigured = isEmailConfigured;
exports.appUrl = appUrl;

exports.sendVerificationEmail = (user, token) => send({
  to: user.email,
  subject: 'Confirm your email for OfferForge AI',
  heading: `Welcome, ${user.name.split(' ')[0]}`,
  body: 'Confirm your email address to start your mock interviews.',
  buttonText: 'Confirm email',
  link: `${appUrl()}/verify-email?token=${encodeURIComponent(token)}`,
  footnote: "This link expires in 24 hours. If you didn't create an account, you can ignore this email."
});

exports.sendPasswordResetEmail = (user, token) => send({
  to: user.email,
  subject: 'Reset your OfferForge AI password',
  heading: 'Reset your password',
  body: 'Someone asked to reset the password for this account. If it was you, choose a new password below. Resetting signs you out on every device.',
  buttonText: 'Choose a new password',
  link: `${appUrl()}/reset-password?token=${encodeURIComponent(token)}`,
  footnote: "This link expires in 30 minutes and works once. If you didn't ask for this, ignore this email and your password stays the same."
});

exports.sendPasswordChangedEmail = user => send({
  to: user.email,
  subject: 'Your OfferForge AI password was changed',
  heading: 'Your password was changed',
  body: "Your password was just changed and you were signed out everywhere. If this wasn't you, reset your password right away.",
  buttonText: 'Reset password',
  link: `${appUrl()}/forgot-password`,
  footnote: 'You get this email whenever your password changes.'
});
