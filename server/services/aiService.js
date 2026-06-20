import '../env.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const geminiApiKey = process.env.GEMINI_API_KEY?.trim();
const genAI = geminiApiKey && geminiApiKey !== 'your_gemini_api_key_here'
  ? new GoogleGenerativeAI(geminiApiKey)
  : null;

const STRESS_KEYWORDS = {
  comparison: ['compared', 'behind', 'others are', 'everyone else', 'rank', 'percentile'],
  sleep: ['sleep', 'insomnia', 'tired', 'exhausted', 'fatigue', 'restless'],
  family: ['parents', 'family', 'pressure', 'expectations', 'disappointed'],
  syllabus: ['syllabus', 'backlog', 'incomplete', 'chapters left', 'not finished'],
  mock_tests: ['mock', 'test score', 'marks dropped', 'failed mock', 'low score'],
  self_doubt: ['give up', 'not good enough', 'cant do', "can't do", 'hopeless', 'useless', 'failure'],
};

function detectLocalPatterns(journals, moodLogs) {
  const triggers = {};
  const allText = journals.map((j) => j.content.toLowerCase()).join(' ');

  Object.entries(STRESS_KEYWORDS).forEach(([trigger, keywords]) => {
    const count = keywords.filter((kw) => allText.includes(kw)).length;
    if (count > 0) triggers[trigger] = count;
  });

  const recentMoods = [...journals.slice(0, 7), ...moodLogs.slice(0, 7)].map((x) => x.mood);
  const negativeMoods = ['stressed', 'anxious', 'overwhelmed', 'burned_out'];
  const negativeCount = recentMoods.filter((m) => negativeMoods.includes(m)).length;
  const burnoutRisk = Math.min(100, Math.round((negativeCount / Math.max(recentMoods.length, 1)) * 100 + (triggers.self_doubt || 0) * 10));

  const avgSleep = journals.length
    ? journals.slice(0, 7).reduce((s, j) => s + j.sleepHours, 0) / Math.min(journals.length, 7)
    : 7;
  const avgStudy = journals.length
    ? journals.slice(0, 7).reduce((s, j) => s + j.studyHours, 0) / Math.min(journals.length, 7)
    : 6;

  const patterns = [];
  if (triggers.comparison) patterns.push('Social comparison anxiety — you frequently compare yourself to peers');
  if (triggers.sleep || avgSleep < 6) patterns.push('Sleep deprivation pattern — insufficient rest is amplifying stress');
  if (triggers.family) patterns.push('External pressure — family expectations appear as a recurring stress source');
  if (triggers.syllabus) patterns.push('Syllabus anxiety — backlog worries are affecting your confidence');
  if (triggers.mock_tests) patterns.push('Performance anxiety — mock test results are triggering self-doubt');
  if (triggers.self_doubt) patterns.push('Negative self-talk — critical inner voice is undermining motivation');
  if (avgStudy > 10 && avgSleep < 6) patterns.push('Overwork cycle — high study hours with low sleep increases burnout risk');

  if (patterns.length === 0 && journals.length > 0) {
    patterns.push('Building awareness — keep journaling to uncover deeper patterns over time');
  }

  return { triggers, burnoutRisk, patterns, avgSleep, avgStudy };
}

function generateLocalInsights(student, journals, moodLogs) {
  const { triggers, burnoutRisk, patterns, avgSleep, avgStudy } = detectLocalPatterns(journals, moodLogs);

  const copingStrategies = [];
  if (triggers.comparison) copingStrategies.push('Practice the "personal best" mindset — track only your own progress chart, not others\'');
  if (triggers.sleep || avgSleep < 6) copingStrategies.push('Set a non-negotiable sleep window — 7 hours improves retention more than extra study hours');
  if (triggers.family) copingStrategies.push('Have an honest 10-minute check-in with family about realistic expectations');
  if (triggers.syllabus) copingStrategies.push('Break backlog into 3 high-impact topics per day instead of trying to cover everything');
  if (triggers.mock_tests) copingStrategies.push('Treat mocks as diagnostics, not verdicts — note 2 learnings per test, not just the score');
  if (triggers.self_doubt) copingStrategies.push('Use the 3-3-3 grounding: name 3 things you see, 3 you hear, 3 you feel');
  if (burnoutRisk > 60) copingStrategies.push('Schedule a guilt-free 30-minute break today — rest is part of preparation');

  if (copingStrategies.length === 0) {
    copingStrategies.push('Maintain your current rhythm — consistency beats intensity');
    copingStrategies.push('End each study block with a 2-minute reflection on what went well');
  }

  const mindfulnessExercises = [
    burnoutRisk > 50
      ? { title: 'Box Breathing (4-4-4-4)', duration: '3 min', steps: 'Inhale 4s, hold 4s, exhale 4s, hold 4s. Repeat 6 cycles before your next study session.' }
      : { title: 'Morning Intention Setting', duration: '2 min', steps: 'Before studying, write one sentence: "Today I will master ___ and be kind to myself."' },
    avgSleep < 6
      ? { title: 'Body Scan for Rest', duration: '5 min', steps: 'Lie down, scan from toes to head, release tension in each area. Do this before bed instead of scrolling.' }
      : { title: 'Focus Anchor', duration: '2 min', steps: 'Pick one object, observe it for 2 minutes. When mind wanders, gently return. Builds concentration.' },
    { title: 'Gratitude Micro-Journal', duration: '1 min', steps: 'Write 3 small wins from today — even "I showed up" counts.' },
  ];

  let burnoutLevel = 'low';
  if (burnoutRisk > 70) burnoutLevel = 'high';
  else if (burnoutRisk > 40) burnoutLevel = 'moderate';

  return {
    emotionalSummary: `${student.name}, preparing for ${student.exam} is demanding. Based on your ${journals.length} journal entries, your emotional landscape shows ${patterns.length > 1 ? 'recognizable patterns worth addressing' : 'early signs we can track together'}. ${burnoutRisk > 50 ? 'Your burnout indicators need attention — please prioritize rest.' : 'You are managing well, keep building healthy habits.'}`,
    stressTriggers: Object.keys(triggers).map((t) => ({
      name: t.replace(/_/g, ' '),
      intensity: triggers[t] > 2 ? 'high' : 'moderate',
      mentions: triggers[t],
    })),
    patterns,
    burnoutRisk,
    burnoutLevel,
    copingStrategies,
    mindfulnessExercises,
    motivationalMessage: burnoutRisk > 60
      ? `${student.name}, the fact that you're still showing up despite feeling overwhelmed proves your resilience. One focused hour beats ten anxious ones. You've got this. 💪`
      : `Every ${student.exam} topper was once where you are now — doubting, struggling, and still moving forward. Your consistency is your superpower, ${student.name}! 🌟`,
    growthTrend: journals.length >= 3 ? 'tracking' : 'insufficient_data',
  };
}

function generateLocalChatResponse(student, message, journals, moodLogs) {
  const lower = message.toLowerCase();
  const { burnoutRisk, patterns } = detectLocalPatterns(journals, moodLogs);

  if (lower.includes('anxious') || lower.includes('panic') || lower.includes('nervous')) {
    return `I hear you, ${student.name}. Exam anxiety is very common for ${student.exam} aspirants. Try this right now: breathe in for 4 counts, hold for 4, out for 4. You're safe in this moment. What's one small thing you can control today?`;
  }
  if (lower.includes('burnout') || lower.includes('tired') || lower.includes('exhausted') || lower.includes('give up')) {
    return `Burnout is your mind asking for care, not quitting. ${burnoutRisk > 50 ? "I've noticed stress building in your logs." : ''} Take a 20-minute walk, eat something nourishing, and come back with just ONE topic. Progress isn't linear — rest is strategy.`;
  }
  if (lower.includes('mock') || lower.includes('score') || lower.includes('marks') || lower.includes('fail')) {
    return `Mock tests measure learning gaps, not your worth. Top ${student.exam} rankers often scored poorly in early mocks. After each test, write: "What did I learn?" not "What's wrong with me?" Want help reframing a specific result?`;
  }
  if (lower.includes('sleep') || lower.includes('insomnia')) {
    return `Sleep is your secret weapon for ${student.exam} prep — memory consolidation happens during rest. Try: no screens 30 min before bed, same sleep time daily, and a worry journal to dump anxious thoughts before sleeping.`;
  }
  if (lower.includes('compare') || lower.includes('behind') || lower.includes('others')) {
    return `Comparison steals joy and focus. Your only competition is yesterday's you. ${patterns.some((p) => p.includes('comparison')) ? "I've seen this pattern in your journals too." : ''} Unfollow toxic comparison triggers and celebrate YOUR small wins today.`;
  }
  if (lower.includes('motivat') || lower.includes('encourage') || lower.includes('help')) {
    return `${student.name}, you chose one of India's toughest paths — that alone shows courage. ${student.exam} preparation is a marathon. Today, just win the next hour. I'm here whenever you need to talk. What feels hardest right now?`;
  }

  return `Thank you for sharing, ${student.name}. As your ${student.exam} wellness companion, I'm here to listen without judgment. ${journals.length > 0 ? `Based on your journaling journey (${journals.length} entries), I can see you're putting in real effort.` : 'Start a journal entry today so I can give you more personalized insights.'} Tell me more about what's on your mind — stress, study, sleep, or motivation?`;
}

async function callGemini(systemPrompt, userPrompt) {
  if (!genAI) return null;
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: systemPrompt,
    });
    const result = await model.generateContent(
      userPrompt + '\n\nRespond ONLY with valid JSON, no markdown code fences.'
    );
    const text = result.response.text().trim();
    // Strip markdown fences if model wraps anyway
    const clean = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
    return JSON.parse(clean);
  } catch (err) {
    console.error('Gemini error:', err.message);
    return null;
  }
}

export async function analyzeStudentWellness(student, journals, moodLogs) {
  const localFallback = generateLocalInsights(student, journals, moodLogs);

  if (!openai || journals.length === 0) {
    return localFallback;
  }

  const journalSummary = journals
    .slice(0, 14)
    .map((j) => `[${j.createdAt.slice(0, 10)}] Mood: ${j.mood}, Study: ${j.studyHours}h, Sleep: ${j.sleepHours}h — "${j.content}"`)
    .join('\n');

  const moodSummary = moodLogs
    .slice(0, 14)
    .map((m) => `[${m.createdAt.slice(0, 10)}] Mood: ${m.mood}, Energy: ${m.energy}/10, Focus: ${m.focus}/10`)
    .join('\n');

  const systemPrompt = `You are ExamSathi AI, an empathetic wellness coach for Indian students preparing for ${student.exam}. Analyze journal and mood data. Respond ONLY with valid JSON matching this schema:
{
  "emotionalSummary": "string - 2-3 sentences personalized summary",
  "stressTriggers": [{"name": "string", "intensity": "high|moderate|low", "mentions": number}],
  "patterns": ["string array of recurring behavioral/emotional patterns"],
  "burnoutRisk": number 0-100,
  "burnoutLevel": "low|moderate|high",
  "copingStrategies": ["string array of 3-5 personalized strategies"],
  "mindfulnessExercises": [{"title": "string", "duration": "string", "steps": "string"}],
  "motivationalMessage": "string - warm encouraging message using student name",
  "growthTrend": "improving|stable|declining|tracking|insufficient_data"
}`;

  const userPrompt = `Student: ${student.name}, Exam: ${student.exam}, Target Year: ${student.targetYear}

Recent Journal Entries:
${journalSummary || 'No entries yet'}

Recent Mood Logs:
${moodSummary || 'No mood logs yet'}

Analyze emotional patterns, hidden stress triggers, burnout risk, and provide hyper-personalized wellness support.`;

  const aiResult = await callGemini(systemPrompt, userPrompt);
  return aiResult || localFallback;
}

function buildChatSystemPrompt(student, journals, moodLogs, insights) {
  const journalContext = journals
    .slice(0, 7)
    .map(
      (j) =>
        `[${j.createdAt.slice(0, 10)}] mood=${j.mood}, study=${j.studyHours}h, sleep=${j.sleepHours}h — "${j.content}"`
    )
    .join('\n');

  const moodContext = moodLogs
    .slice(0, 7)
    .map((m) => `[${m.createdAt.slice(0, 10)}] mood=${m.mood}, energy=${m.energy}/10, focus=${m.focus}/10`)
    .join('\n');

  const insightsContext = insights
    ? `Burnout risk: ${insights.burnoutRisk}% (${insights.burnoutLevel}). Known patterns: ${insights.patterns?.join('; ') || 'none yet'}. Stress triggers: ${insights.stressTriggers?.map((t) => t.name).join(', ') || 'none yet'}.`
    : 'No wellness analysis run yet.';

  return `You are ExamSathi AI ("Sathi"), an empathetic digital wellness companion for Indian students preparing for high-stakes exams.

Student profile:
- Name: ${student.name}
- Target exam: ${student.exam}
- Target year: ${student.targetYear}

Your role:
- Listen without judgment and validate feelings first
- Offer hyper-personalized, practical coping strategies (breathing, study breaks, reframing mock tests, sleep hygiene)
- Suggest brief mindfulness exercises when stress is high
- Give warm motivational encouragement grounded in their context
- Reference their journal/mood data and prior conversation when relevant
- Never diagnose medical conditions; encourage professional help for severe distress or self-harm
- Keep replies concise (2-5 sentences), warm, and culturally aware of Indian exam pressure (NEET/JEE/UPSC/CAT/GATE/CUET)

Recent journal entries:
${journalContext || 'None yet'}

Recent mood logs:
${moodContext || 'None yet'}

Latest wellness analysis:
${insightsContext}`;
}

export async function generateChatResponse(student, message, journals, moodLogs, chatHistory, insights = null) {
  if (!genAI) {
    return generateLocalChatResponse(student, message, journals, moodLogs);
  }

  const systemPrompt = buildChatSystemPrompt(student, journals, moodLogs, insights);

  // Gemini uses 'user' and 'model' roles (not 'assistant')
  const history = chatHistory
    .slice(-20)
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: systemPrompt,
    });
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(message);
    return result.response.text();
  } catch (err) {
    console.error('Gemini chat error:', err.message);
    return generateLocalChatResponse(student, message, journals, moodLogs);
  }
}

export function isAIEnabled() {
  return !!genAI;
}
