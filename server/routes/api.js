import { Router } from 'express';
import {
  createStudent,
  getStudent,
  getAllStudents,
  addJournalEntry,
  getJournalEntries,
  addMoodLog,
  getMoodLogs,
  addChatMessage,
  getChatHistory,
  saveInsights,
  getInsights,
  getStudentStats,
  EXAMS,
  MOODS,
} from '../store.js';
import { analyzeStudentWellness, generateChatResponse, isAIEnabled } from '../services/aiService.js';

const router = Router();

router.get('/meta', (_req, res) => {
  res.json({ exams: EXAMS, moods: MOODS, aiEnabled: isAIEnabled() });
});

router.post('/students', (req, res) => {
  const { name, exam, targetYear } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }
  const student = createStudent({ name: name.trim(), exam, targetYear });
  res.status(201).json(student);
});

router.get('/students', (_req, res) => {
  res.json(getAllStudents());
});

router.get('/students/:id', (req, res) => {
  const student = getStudent(req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  res.json(student);
});

router.get('/students/:id/stats', (req, res) => {
  const student = getStudent(req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  res.json(getStudentStats(req.params.id));
});

router.get('/students/:id/journals', (req, res) => {
  const student = getStudent(req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  res.json(getJournalEntries(req.params.id));
});

router.post('/students/:id/journals', (req, res) => {
  const student = getStudent(req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  const { content, mood, studyHours, sleepHours } = req.body;
  if (!content?.trim()) {
    return res.status(400).json({ error: 'Journal content is required' });
  }
  const entry = addJournalEntry(req.params.id, { content, mood, studyHours, sleepHours });
  res.status(201).json(entry);
});

router.get('/students/:id/moods', (req, res) => {
  const student = getStudent(req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  res.json(getMoodLogs(req.params.id));
});

router.post('/students/:id/moods', (req, res) => {
  const student = getStudent(req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  const { mood, energy, focus, note } = req.body;
  const log = addMoodLog(req.params.id, { mood, energy, focus, note });
  res.status(201).json(log);
});

router.get('/students/:id/insights', (req, res) => {
  const student = getStudent(req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  res.json(getInsights(req.params.id));
});

router.post('/students/:id/analyze', async (req, res) => {
  const student = getStudent(req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  const journals = getJournalEntries(req.params.id);
  const moodLogs = getMoodLogs(req.params.id);

  if (journals.length === 0 && moodLogs.length === 0) {
    return res.status(400).json({ error: 'Add at least one journal entry or mood log before analyzing' });
  }

  try {
    const insights = await analyzeStudentWellness(student, journals, moodLogs);
    const saved = saveInsights(req.params.id, insights);
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: 'Analysis failed', details: err.message });
  }
});

router.get('/students/:id/chat', (req, res) => {
  const student = getStudent(req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  res.json({
    history: getChatHistory(req.params.id),
    aiEnabled: isAIEnabled(),
  });
});

router.post('/students/:id/chat', async (req, res) => {
  const student = getStudent(req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  const { message } = req.body;
  if (!message?.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const studentId = req.params.id;
  const journals = getJournalEntries(studentId);
  const moodLogs = getMoodLogs(studentId);
  const insights = getInsights(studentId);
  const chatHistory = getChatHistory(studentId);

  try {
    const reply = await generateChatResponse(
      student,
      message.trim(),
      journals,
      moodLogs,
      chatHistory,
      insights
    );

    addChatMessage(studentId, 'user', message.trim());
    const aiMessage = addChatMessage(studentId, 'assistant', reply);
    res.json(aiMessage);
  } catch (err) {
    res.status(500).json({ error: 'Chat failed', details: err.message });
  }
});

export default router;
