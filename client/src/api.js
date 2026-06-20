const BASE = 'https://examsathi-1.onrender.com/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  getMeta: () => request('/meta'),
  createStudent: (body) => request('/students', { method: 'POST', body: JSON.stringify(body) }),
  getStudent: (id) => request(`/students/${id}`),
  getStats: (id) => request(`/students/${id}/stats`),
  getJournals: (id) => request(`/students/${id}/journals`),
  addJournal: (id, body) => request(`/students/${id}/journals`, { method: 'POST', body: JSON.stringify(body) }),
  getMoods: (id) => request(`/students/${id}/moods`),
  addMood: (id, body) => request(`/students/${id}/moods`, { method: 'POST', body: JSON.stringify(body) }),
  getInsights: (id) => request(`/students/${id}/insights`),
  analyze: (id) => request(`/students/${id}/analyze`, { method: 'POST' }),
  getChat: async (id) => {
    const data = await request(`/students/${id}/chat`);
    return {
      history: Array.isArray(data) ? data : (data.history ?? []),
      aiEnabled: data.aiEnabled ?? false,
    };
  },
  sendChat: (id, message) =>
    request(`/students/${id}/chat`, { method: 'POST', body: JSON.stringify({ message }) }),
};
