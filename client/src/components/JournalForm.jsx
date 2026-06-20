import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Slider,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
  Box,
} from '@mui/material';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { api } from '../api';
import { MOOD_CONFIG } from '../utils';

export default function JournalForm({ studentId, onSaved }) {
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('okay');
  const [studyHours, setStudyHours] = useState(6);
  const [sleepHours, setSleepHours] = useState(7);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Please write something about your day');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.addJournal(studentId, { content, mood, studyHours, sleepHours });
      setContent('');
      setSuccess(true);
      onSaved?.();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
          <EditNoteIcon color="primary" />
          <Typography variant="h6">Daily Journal</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Write freely about your day — stress, wins, worries. AI will uncover hidden patterns.
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              multiline
              rows={4}
              label="How was your day?"
              placeholder="Today I felt anxious after seeing my mock test score. I studied 8 hours but couldn't focus on Physics..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              fullWidth
            />

            <Box>
              <Typography variant="body2" gutterBottom>
                How are you feeling?
              </Typography>
              <ToggleButtonGroup
                value={mood}
                exclusive
                onChange={(_, v) => v && setMood(v)}
                size="small"
                sx={{ flexWrap: 'wrap', gap: 0.5 }}
              >
                {Object.entries(MOOD_CONFIG).map(([key, cfg]) => (
                  <ToggleButton key={key} value={key} sx={{ borderRadius: '20px !important', px: 1.5 }}>
                    {cfg.emoji} {cfg.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>

            <Box>
              <Typography variant="body2">Study Hours: {studyHours}h</Typography>
              <Slider value={studyHours} onChange={(_, v) => setStudyHours(v)} min={0} max={14} step={0.5} />
            </Box>

            <Box>
              <Typography variant="body2">Sleep Hours: {sleepHours}h</Typography>
              <Slider value={sleepHours} onChange={(_, v) => setSleepHours(v)} min={0} max={12} step={0.5} />
            </Box>

            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">Journal saved! Keep building your emotional timeline.</Alert>}

            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Saving...' : 'Save Journal Entry'}
            </Button>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
