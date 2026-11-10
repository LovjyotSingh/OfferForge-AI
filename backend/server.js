const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./src/routes/auth.routes');
const interviewRoutes = require('./src/routes/interview.routes');
const analyticsRoutes = require('./src/routes/analytics.routes');

const app = express();

// Security headers. The API only ever returns JSON, so it can use the strictest CSP.
app.use(helmet({
  contentSecurityPolicy: { directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] } },
  crossOriginResourcePolicy: { policy: 'same-origin' }
}));
app.set('trust proxy', 1);

// CORS: the frontend is served from the same origin as the API, so only that origin
// (and any explicitly configured FRONTEND_URL) may call it from a browser.
const allowedOrigins = new Set(
  (process.env.FRONTEND_URL || '')
    .split(',')
    .map(origin => origin.trim().replace(/\/$/, ''))
    .filter(Boolean)
);
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  allowedOrigins.add('http://localhost:5173');
  allowedOrigins.add('http://127.0.0.1:5173');
}

function isAllowedOrigin(req, origin) {
  if (!origin) return true; // same-origin GETs, curl, server-to-server
  if (allowedOrigins.has(origin)) return true;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return Boolean(host) && origin === `https://${host}`;
}

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!isAllowedOrigin(req, origin)) {
    return res.status(403).json({ status: 'error', message: 'Origin not allowed' });
  }
  return cors({ origin: Boolean(origin), credentials: true })(req, res, next);
});

// Defence in depth against CSRF: a request body must be JSON, which a cross-site
// HTML form cannot send without a CORS preflight (which the check above rejects).
app.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && req.headers['content-type'] && !req.is('application/json')) {
    return res.status(415).json({ status: 'error', message: 'Requests must be sent as JSON' });
  }
  next();
});

app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(compression());
// Log method, path and status only. Query strings and bodies can carry personal data.
morgan.token('route', req => (req.originalUrl || '').split('?')[0]);
app.use(morgan(':method :route :status :response-time ms'));

// General API rate limit (per IP).
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many requests. Please slow down.' }
}));

// Database connection caching for Vercel serverless functions
let isConnected = false;
async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) return;
  mongoose.set('strictQuery', true);
  const db = await mongoose.connect(process.env.MONGODB_URI);
  isConnected = db.connections[0].readyState === 1;
}

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    res.status(503).json({ status: 'error', message: 'Service temporarily unavailable' });
  }
});

app.get('/', (req, res) => {
  res.send('OfferForge AI API is running');
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'offerforge-api', time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use('*', (req, res) => {
  res.status(404).json({ status: 'error', message: 'Route not found' });
});

// Global error handler: log the details, never send internals to the client.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = Number(err.status || err.statusCode) || 500;
  if (status >= 500) console.error(err);
  let message = 'Server error';
  if (status < 500) message = err.type === 'entity.too.large' ? 'Request is too large' : 'Invalid request';
  res.status(status).json({ status: 'error', message });
});

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
