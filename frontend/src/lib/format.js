export function scoreTone(score) {
  if (typeof score !== 'number') return { color: '#6B665D', text: 'text-faint', label: 'Not graded' };
  if (score >= 85) return { color: '#4ADE80', text: 'text-emerald-400', label: 'Strong' };
  if (score >= 70) return { color: '#FFC56B', text: 'text-ember-300', label: 'Solid' };
  if (score >= 50) return { color: '#FF8A3D', text: 'text-ember-400', label: 'Partial' };
  return { color: '#FB7185', text: 'text-rose-400', label: 'Weak' };
}

export function formatDuration(seconds) {
  const total = Math.max(0, Math.round(seconds || 0));
  if (total < 60) return `${total}s`;
  const minutes = Math.round(total / 60);
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
}

export function formatClock(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export const LEVEL_LABELS = { easy: 'Entry level', medium: 'Mid level', hard: 'Senior' };
