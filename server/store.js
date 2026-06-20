import { v4 as uuidv4 } from 'uuid';

const EXAMS = ['NEET', 'JEE', 'UPSC', 'CAT', 'GATE', 'CUET'];
const MOODS = ['great', 'good', 'okay', 'stressed', 'anxious', 'overwhelmed', 'burned_out'];

const store = {
  students: new Map(),
  journals: new Map(),
  moodLogs: new Map(),
  chatHistory: new Map(),
  insights: new Map(),
};

export { EXAMS, MOODS, store };

export function createStudent({ name, exam, targetYear }) {
  const id = uuidv4();
  const student = {
    id,
    name,
    exam: EXAMS.includes(exam) ? exam : 'JEE',
    targetYear: targetYear || new Date().getFullYear() + 1,
    createdAt: new Date().toISOString(),
  };
  store.students.set(id, student);
  store.journals.set(id, []);
  store.moodLogs.set(id, []);
  store.chatHistory.set(id, []);
  store.insights.set(id, null);
  return student;
}

export function getStudent(id) {
  return store.students.get(id) || null;
}

export function getAllStudents() {
  return Array.from(store.students.values());
}

export function addJournalEntry(studentId, { content, mood, studyHours, sleepHours }) {
  const entry = {
    id: uuidv4(),
    studentId,
    content,
    mood: MOODS.includes(mood) ? mood : 'okay',
    studyHours: Number(studyHours) || 0,
    sleepHours: Number(sleepHours) || 0,
    createdAt: new Date().toISOString(),
  };
  const entries = store.journals.get(studentId) || [];
  entries.unshift(entry);
  store.journals.set(studentId, entries);
  return entry;
}

export function getJournalEntries(studentId) {
  return store.journals.get(studentId) || [];
}

export function addMoodLog(studentId, { mood, energy, focus, note }) {
  const log = {
    id: uuidv4(),
    studentId,
    mood: MOODS.includes(mood) ? mood : 'okay',
    energy: Math.min(10, Math.max(1, Number(energy) || 5)),
    focus: Math.min(10, Math.max(1, Number(focus) || 5)),
    note: note || '',
    createdAt: new Date().toISOString(),
  };
  const logs = store.moodLogs.get(studentId) || [];
  logs.unshift(log);
  store.moodLogs.set(studentId, logs);
  return log;
}

export function getMoodLogs(studentId) {
  return store.moodLogs.get(studentId) || [];
}

export function addChatMessage(studentId, role, content) {
  const message = {
    id: uuidv4(),
    role,
    content,
    createdAt: new Date().toISOString(),
  };
  const history = store.chatHistory.get(studentId) || [];
  history.push(message);
  store.chatHistory.set(studentId, history);
  return message;
}

export function getChatHistory(studentId) {
  return store.chatHistory.get(studentId) || [];
}

export function saveInsights(studentId, insights) {
  const data = {
    ...insights,
    generatedAt: new Date().toISOString(),
  };
  store.insights.set(studentId, data);
  return data;
}

export function getInsights(studentId) {
  return store.insights.get(studentId) || null;
}

export function getStudentStats(studentId) {
  const journals = getJournalEntries(studentId);
  const moods = getMoodLogs(studentId);
  const moodCounts = {};
  MOODS.forEach((m) => (moodCounts[m] = 0));
  [...journals, ...moods].forEach((item) => {
    if (item.mood) moodCounts[item.mood] = (moodCounts[item.mood] || 0) + 1;
  });
  const avgStudy =
    journals.length > 0
      ? journals.reduce((s, j) => s + j.studyHours, 0) / journals.length
      : 0;
  const avgSleep =
    journals.length > 0
      ? journals.reduce((s, j) => s + j.sleepHours, 0) / journals.length
      : 0;
  return {
    totalJournalEntries: journals.length,
    totalMoodLogs: moods.length,
    moodDistribution: moodCounts,
    avgStudyHours: Math.round(avgStudy * 10) / 10,
    avgSleepHours: Math.round(avgSleep * 10) / 10,
  };
}
