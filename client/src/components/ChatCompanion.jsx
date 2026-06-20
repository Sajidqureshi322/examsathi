import { useState, useRef, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  IconButton,
  Stack,
  Box,
  Paper,
  CircularProgress,
  Chip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import { api } from '../api';
import { formatTime } from '../utils';

const QUICK_PROMPTS = [
  "I'm feeling anxious about my exam",
  'How do I deal with burnout?',
  'I did poorly in my mock test',
  "I can't sleep properly",
  'I keep comparing myself to others',
  'Need some motivation today',
];

export default function ChatCompanion({ studentId, studentName, chatHistory, onNewMessage }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const sendMessage = async (text) => {
    const msg = text || message;
    if (!msg.trim() || loading) return;
    setMessage('');
    setLoading(true);
    try {
      await api.sendChat(studentId, msg.trim());
      onNewMessage?.();
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 0, '&:last-child': { pb: 0 } }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <SmartToyIcon color="primary" />
            <Box>
              <Typography variant="h6">Sathi Chat</Typography>
              <Typography variant="caption" color="text.secondary">
                Your always-available wellness companion, {studentName}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box sx={{ flex: 1, overflow: 'auto', p: 2, minHeight: 360, maxHeight: 480 }}>
          {chatHistory.length === 0 ? (
            <Box textAlign="center" py={4}>
              <SmartToyIcon sx={{ fontSize: 48, color: 'primary.light', mb: 1 }} />
              <Typography color="text.secondary" mb={2}>
                Hi {studentName}! I'm Sathi, your wellness companion. How can I support you today?
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1} justifyContent="center">
                {QUICK_PROMPTS.map((p) => (
                  <Chip key={p} label={p} onClick={() => sendMessage(p)} clickable variant="outlined" color="primary" />
                ))}
              </Stack>
            </Box>
          ) : (
            <Stack spacing={2}>
              {chatHistory.map((msg) => (
                <Stack
                  key={msg.id}
                  direction="row"
                  justifyContent={msg.role === 'user' ? 'flex-end' : 'flex-start'}
                  spacing={1}
                >
                  {msg.role === 'assistant' && (
                    <SmartToyIcon color="primary" sx={{ mt: 0.5, fontSize: 20 }} />
                  )}
                  <Paper
                    sx={{
                      p: 1.5,
                      maxWidth: '75%',
                      bgcolor: msg.role === 'user' ? 'primary.main' : 'background.default',
                      color: msg.role === 'user' ? 'primary.contrastText' : 'text.primary',
                      borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    }}
                  >
                    <Typography variant="body2">{msg.content}</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 0.5 }}>
                      {formatTime(msg.createdAt)}
                    </Typography>
                  </Paper>
                  {msg.role === 'user' && (
                    <PersonIcon color="action" sx={{ mt: 0.5, fontSize: 20 }} />
                  )}
                </Stack>
              ))}
              {loading && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <SmartToyIcon color="primary" sx={{ fontSize: 20 }} />
                  <CircularProgress size={20} />
                  <Typography variant="body2" color="text.secondary">
                    Sathi is thinking...
                  </Typography>
                </Stack>
              )}
              <div ref={bottomRef} />
            </Stack>
          )}
        </Box>

        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Stack direction="row" spacing={1}>
            <TextField
              fullWidth
              size="small"
              placeholder="Share what's on your mind..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              disabled={loading}
            />
            <IconButton color="primary" onClick={() => sendMessage()} disabled={loading || !message.trim()}>
              <SendIcon />
            </IconButton>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
