import { Card, CardContent, Typography, Grid, Box, Stack } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import BedtimeIcon from '@mui/icons-material/Bedtime';
import EditNoteIcon from '@mui/icons-material/EditNote';
import MoodIcon from '@mui/icons-material/Mood';
import { MOOD_CONFIG } from '../utils';

const STAT_ICONS = {
  journals: EditNoteIcon,
  moods: MoodIcon,
  study: MenuBookIcon,
  sleep: BedtimeIcon,
};

export default function StatsOverview({ stats }) {
  if (!stats) return null;

  const moodData = Object.entries(stats.moodDistribution || {})
    .filter(([, count]) => count > 0)
    .map(([mood, count]) => ({
      name: MOOD_CONFIG[mood]?.label || mood,
      value: count,
      color: MOOD_CONFIG[mood]?.color || '#999',
    }));

  const statCards = [
    { key: 'journals', label: 'Journal Entries', value: stats.totalJournalEntries, color: '#C68B59' },
    { key: 'moods', label: 'Mood Check-ins', value: stats.totalMoodLogs, color: '#E07A5F' },
    { key: 'study', label: 'Avg Study Hours', value: `${stats.avgStudyHours}h`, color: '#C89666' },
    { key: 'sleep', label: 'Avg Sleep Hours', value: `${stats.avgSleepHours}h`, color: '#8D5B4C' },
  ];

  return (
    <Grid container spacing={2}>
      {statCards.map(({ key, label, value, color }) => {
        const Icon = STAT_ICONS[key];
        return (
          <Grid item xs={6} md={3} key={key}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box sx={{ bgcolor: `${color}22`, p: 1, borderRadius: 2 }}>
                    <Icon sx={{ color }} />
                  </Box>
                  <Box>
                    <Typography variant="h5" fontWeight={700}>
                      {value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {label}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        );
      })}

      {moodData.length > 0 && (
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Mood Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={moodData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {moodData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );
}
