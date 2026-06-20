export const MOOD_CONFIG = {
  great: { label: 'Great', emoji: '😄', color: '#2ECC71' },
  good: { label: 'Good', emoji: '🙂', color: '#27AE60' },
  okay: { label: 'Okay', emoji: '😐', color: '#F39C12' },
  stressed: { label: 'Stressed', emoji: '😰', color: '#E67E22' },
  anxious: { label: 'Anxious', emoji: '😟', color: '#E74C3C' },
  overwhelmed: { label: 'Overwhelmed', emoji: '😫', color: '#C0392B' },
  burned_out: { label: 'Burned Out', emoji: '🪫', color: '#922B21' },
};

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function burnoutColor(level) {
  if (level === 'high') return 'error';
  if (level === 'moderate') return 'warning';
  return 'success';
}

export function burnoutLabel(risk) {
  if (risk > 70) return 'High Risk';
  if (risk > 40) return 'Moderate';
  return 'Low';
}
