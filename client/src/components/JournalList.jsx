import { Card, CardContent, Typography, Stack, Chip, Box, Divider } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import { MOOD_CONFIG, formatDate, formatTime } from '../utils';

export default function JournalList({ entries }) {
  if (!entries?.length) {
    return (
      <Card>
        <CardContent>
          <Typography color="text.secondary" align="center">
            No journal entries yet. Start writing to build your emotional timeline.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
          <HistoryIcon color="primary" />
          <Typography variant="h6">Recent Entries</Typography>
        </Stack>
        <Stack spacing={2} divider={<Divider flexItem />}>
          {entries.slice(0, 10).map((entry) => {
            const moodCfg = MOOD_CONFIG[entry.mood] || MOOD_CONFIG.okay;
            return (
              <Box key={entry.id}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                  <Chip
                    label={`${moodCfg.emoji} ${moodCfg.label}`}
                    size="small"
                    sx={{ bgcolor: `${moodCfg.color}22`, color: moodCfg.color }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(entry.createdAt)} · {formatTime(entry.createdAt)}
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {entry.content}
                </Typography>
                <Stack direction="row" spacing={1} mt={1}>
                  <Chip label={`📚 ${entry.studyHours}h study`} size="small" variant="outlined" />
                  <Chip label={`😴 ${entry.sleepHours}h sleep`} size="small" variant="outlined" />
                </Stack>
              </Box>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}
