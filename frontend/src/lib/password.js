// Mirrors the server's rules so people see problems before submitting.
export const passwordHint = 'At least 8 characters, with a letter and a number.';

export function weakPasswordMessage(password) {
  if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return 'Use at least 8 characters, with a letter and a number';
  }
  return null;
}
