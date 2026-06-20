import { useState, useEffect, useCallback } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Tabs,
  Tab,
  Box,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import LogoutIcon from '@mui/icons-material/Logout';
import JournalForm from './components/JournalForm';
import JournalList from './components/JournalList';
import MoodLogger from './components/MoodLogger';
import InsightsPanel from './components/InsightsPanel';
import ChatCompanion from './components/ChatCompanion';
import StatsOverview from './components/StatsOverview';
import OnboardingPage from './components/OnboardingPage';
import { api } from './api';

function TabPanel({ value, index, children }) {
  return value === index ? <Box sx={{ py: 3 }}>{children}</Box> : null;
}

export default function App() {
  const [student, setStudent] = useState(null);
  const [tab, setTab] = useState(0);
  const [journals, setJournals] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [insights, setInsights] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshData = useCallback(async (studentId) => {
    const [j, chat, i, s] = await Promise.all([
      api.getJournals(studentId),
      api.getChat(studentId),
      api.getInsights(studentId),
      api.getStats(studentId),
    ]);
    setJournals(j);
    setChatHistory(chat.history);
    setInsights(i);
    setStats(s);
  }, []);

  useEffect(() => {
    const savedId = localStorage.getItem('examsathi_student_id');
    if (savedId) {
      api
        .getStudent(savedId)
        .then(async (s) => {
          setStudent(s);
          await refreshData(savedId);
        })
        .catch(() => localStorage.removeItem('examsathi_student_id'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [refreshData]);

  const handleLogout = () => {
    localStorage.removeItem('examsathi_student_id');
    setStudent(null);
    setTab(0);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography color="primary">Loading ExamSathi AI...</Typography>
      </Box>
    );
  }

  if (!student) {
    return <OnboardingPage onComplete={(s) => { setStudent(s); refreshData(s.id); }} />;
  }

  return (
    <>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider', color: 'text.primary' }}>
        <Toolbar>
          <SelfImprovementIcon color="primary" sx={{ mr: 1.5 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" fontWeight={700} color="primary">
              ExamSathi AI
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Wellness companion for {student.exam} {student.targetYear}
            </Typography>
          </Box>
          <Chip label={`Hi, ${student.name}`} sx={{ bgcolor: 'action.selected', color: 'text.primary', mr: 1 }} />
          <Tooltip title="Start fresh (data is temporary)">
            <IconButton color="inherit" onClick={handleLogout}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          textColor="primary"
          indicatorColor="secondary"
          sx={{ px: 2, borderTop: 1, borderColor: 'divider' }}
        >
          <Tab label="Dashboard" />
          <Tab label="Journal" />
          <Tab label="AI Insights" />
          <Tab label="Sathi Chat" />
        </Tabs>
      </AppBar>

      <Container maxWidth="lg">
        <TabPanel value={tab} index={0}>
          <StatsOverview stats={stats} />
          <Box mt={3}>
            <InsightsPanel
              studentId={student.id}
              insights={insights}
              onAnalyzed={() => refreshData(student.id)}
            />
          </Box>
        </TabPanel>

        <TabPanel value={tab} index={1}>
          <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={3}>
            <JournalForm studentId={student.id} onSaved={() => refreshData(student.id)} />
            <MoodLogger studentId={student.id} onSaved={() => refreshData(student.id)} />
          </Box>
          <Box mt={3}>
            <JournalList entries={journals} />
          </Box>
        </TabPanel>

        <TabPanel value={tab} index={2}>
          <InsightsPanel
            studentId={student.id}
            insights={insights}
            onAnalyzed={() => refreshData(student.id)}
          />
        </TabPanel>

        <TabPanel value={tab} index={3}>
          <ChatCompanion
            studentId={student.id}
            studentName={student.name}
            chatHistory={chatHistory}
            onNewMessage={() => refreshData(student.id)}
          />
        </TabPanel>
      </Container>
    </>
  );
}
