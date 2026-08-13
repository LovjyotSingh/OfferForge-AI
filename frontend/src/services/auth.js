const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const REMEMBER_KEY = 'offerforge_remember';

export function clearLegacyAuth() {
  // Utility cleanup helper
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  try {
    const stored = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export function saveAuth(token, user, rememberMe = true) {
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(USER_KEY, JSON.stringify(user || {}));

  if (rememberMe) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user || {}));
    localStorage.setItem(REMEMBER_KEY, 'true');
  } else {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.setItem(REMEMBER_KEY, 'false');
  }
}

export const setAuth = saveAuth;

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}
