import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  MenuItem,
  Stack,
  Avatar,
  Chip,
} from '@mui/material';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import { api } from '../api';

export default function OnboardingPage({ onComplete }) {
  const [name, setName] = useState('');
  const [exam, setExam] = useState('JEE');
  const [targetYear, setTargetYear] = useState(new Date().getFullYear() + 1);
  const [exams, setExams] = useState(['NEET', 'JEE', 'UPSC', 'CAT', 'GATE', 'CUET']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getMeta().then((m) => setExams(m.exams)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const student = await api.createStudent({ name: name.trim(), exam, targetYear });
      localStorage.setItem('examsathi_student_id', student.id);
      onComplete(student);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #090705 0%, #1D1510 50%, #3B281B 100%)',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 480, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Stack alignItems="center" spacing={2} mb={3}>
            <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
              <SelfImprovementIcon sx={{ fontSize: 36 }} />
            </Avatar>
            <Typography variant="h4" align="center" color="primary">
              ExamSathi AI
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Your empathetic wellness companion for NEET, JEE, UPSC, CAT, GATE & CUET preparation
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
              {['Journal', 'Mood Tracking', 'AI Insights', 'Chat Support'].map((f) => (
                <Chip key={f} label={f} size="small" variant="outlined" color="primary" />
              ))}
            </Stack>
          </Stack>

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <TextField
                label="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
                required
                placeholder="e.g. Priya"
              />
              <TextField
                select
                label="Target Exam"
                value={exam}
                onChange={(e) => setExam(e.target.value)}
                fullWidth
              >
                {exams.map((e) => (
                  <MenuItem key={e} value={e}>
                    {e}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Target Year"
                type="number"
                value={targetYear}
                onChange={(e) => setTargetYear(Number(e.target.value))}
                fullWidth
              />
              {error && (
                <Typography color="error" variant="body2">
                  {error}
                </Typography>
              )}
              <Button type="submit" variant="contained" size="large" disabled={loading} fullWidth>
                {loading ? 'Starting...' : 'Begin My Wellness Journey'}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
