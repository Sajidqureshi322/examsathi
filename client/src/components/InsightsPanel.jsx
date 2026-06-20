import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Box,
  LinearProgress,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  Paper,
} from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import SpaIcon from '@mui/icons-material/Spa';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { api } from '../api';
import { burnoutColor, burnoutLabel } from '../utils';

export default function InsightsPanel({ studentId, insights, onAnalyzed }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    setLoading(true);
    setError('');
    try {
      await api.analyze(studentId);
      onAnalyzed?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!insights) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <PsychologyIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Discover Your Emotional Patterns
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Add journal entries and mood logs, then let AI uncover hidden stress triggers and burnout risk.
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Button variant="contained" onClick={handleAnalyze} disabled={loading} startIcon={loading ? <CircularProgress size={20} /> : <PsychologyIcon />}>
            {loading ? 'Analyzing...' : 'Run AI Analysis'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Stack spacing={3}>
      <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1} mb={1}>
            <FavoriteIcon />
            <Typography variant="h6">AI Wellness Summary</Typography>
          </Stack>
          <Typography variant="body1">{insights.emotionalSummary}</Typography>
          <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic', opacity: 0.9 }}>
            {insights.motivationalMessage}
          </Typography>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
            <LocalFireDepartmentIcon color="error" sx={{ fontSize: 40 }} />
            <Typography variant="h6" mt={1}>
              Burnout Risk
            </Typography>
            <Typography variant="h3" color={`${burnoutColor(insights.burnoutLevel)}.main`} fontWeight={700}>
              {insights.burnoutRisk}%
            </Typography>
            <Chip label={burnoutLabel(insights.burnoutRisk)} color={burnoutColor(insights.burnoutLevel)} sx={{ mt: 1 }} />
            <LinearProgress
              variant="determinate"
              value={insights.burnoutRisk}
              color={burnoutColor(insights.burnoutLevel)}
              sx={{ mt: 2, height: 8, borderRadius: 4 }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
              <TrendingUpIcon color="primary" />
              <Typography variant="h6">Detected Patterns</Typography>
            </Stack>
            {insights.patterns?.length ? (
              <Stack spacing={1}>
                {insights.patterns.map((p, i) => (
                  <Alert key={i} severity="info" icon={false} sx={{ py: 0.5 }}>
                    {p}
                  </Alert>
                ))}
              </Stack>
            ) : (
              <Typography color="text.secondary">Keep journaling to reveal more patterns.</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {insights.stressTriggers?.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Hidden Stress Triggers
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {insights.stressTriggers.map((t, i) => (
                <Chip
                  key={i}
                  label={`${t.name} (${t.intensity})`}
                  color={t.intensity === 'high' ? 'error' : t.intensity === 'moderate' ? 'warning' : 'default'}
                  variant="outlined"
                />
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Personalized Coping Strategies
              </Typography>
              <Stack spacing={1.5}>
                {insights.copingStrategies?.map((s, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                    <Chip label={i + 1} size="small" color="primary" />
                    <Typography variant="body2">{s}</Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <SpaIcon color="success" />
                <Typography variant="h6">Mindfulness Exercises</Typography>
              </Stack>
              <Stack spacing={2}>
                {insights.mindfulnessExercises?.map((ex, i) => (
                  <Paper key={i} variant="outlined" sx={{ p: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2">{ex.title}</Typography>
                      <Chip label={ex.duration} size="small" color="success" variant="outlined" />
                    </Stack>
                    <Typography variant="body2" color="text.secondary" mt={1}>
                      {ex.steps}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box textAlign="center">
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Button variant="outlined" onClick={handleAnalyze} disabled={loading}>
          {loading ? 'Re-analyzing...' : 'Refresh Analysis'}
        </Button>
      </Box>
    </Stack>
  );
}
