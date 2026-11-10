// The session token lives in an httpOnly cookie that JavaScript can't read, so a
// script injected into the page can't steal it. The browser only keeps the
// (non-secret) profile below to know whether to show signed-in UI.
const USER_KEY = 'user';
const REMEMBER_KEY = 'offerforge_remember';
const LEGACY_TOKEN_KEY = 'token';

// Remove tokens saved by older versions of the app.
try {
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  sessionStorage.removeItem(LEGACY_TOKEN_KEY);
} catch {
  // storage unavailable
}

function readUser() {
  try {
    const stored = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return Boolean(readUser()?._id);
}

export function getUser() {
  return readUser() || {};
}

export function setAuth(user, rememberMe = true) {
  const value = JSON.stringify(user || {});
  sessionStorage.setItem(USER_KEY, value);
  if (rememberMe) {
    localStorage.setItem(USER_KEY, value);
    localStorage.setItem(REMEMBER_KEY, 'true');
  } else {
    localStorage.removeItem(USER_KEY);
    localStorage.setItem(REMEMBER_KEY, 'false');
  }
}

export function clearAuth() {
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(USER_KEY);
}
