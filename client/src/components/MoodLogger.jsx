import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Slider,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
  Box,
} from '@mui/material';
import MoodIcon from '@mui/icons-material/Mood';
import { api } from '../api';
import { MOOD_CONFIG } from '../utils';

export default function MoodLogger({ studentId, onSaved }) {
  const [mood, setMood] = useState('okay');
  const [energy, setEnergy] = useState(5);
  const [focus, setFocus] = useState(5);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.addMood(studentId, { mood, energy, focus, note });
      setNote('');
      setSuccess(true);
      onSaved?.();
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      /* handled silently */
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
          <MoodIcon color="secondary" />
          <Typography variant="h6">Quick Mood Check-in</Typography>
        </Stack>

        <Stack spacing={3}>
          <Box>
            <Typography variant="body2" gutterBottom>
              Current Mood
            </Typography>
            <ToggleButtonGroup
              value={mood}
              exclusive
              onChange={(_, v) => v && setMood(v)}
              size="small"
              sx={{ flexWrap: 'wrap', gap: 0.5 }}
            >
              {Object.entries(MOOD_CONFIG).map(([key, cfg]) => (
                <ToggleButton key={key} value={key} sx={{ borderRadius: '20px !important' }}>
                  {cfg.emoji}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          <Box>
            <Typography variant="body2">Energy Level: {energy}/10</Typography>
            <Slider value={energy} onChange={(_, v) => setEnergy(v)} min={1} max={10} color="secondary" />
          </Box>

          <Box>
            <Typography variant="body2">Focus Level: {focus}/10</Typography>
            <Slider value={focus} onChange={(_, v) => setFocus(v)} min={1} max={10} color="primary" />
          </Box>

          {success && <Alert severity="success">Mood logged!</Alert>}

          <Button variant="contained" color="secondary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Logging...' : 'Log Mood'}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
