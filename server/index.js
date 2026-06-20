import './env.js';
import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/api.js';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'ExamSathi AI', timestamp: new Date().toISOString() });
});

app.use('/api', apiRoutes);

app.listen(PORT, () => {
  console.log(`ExamSathi AI server running on http://localhost:${PORT}`);
  console.log(`OpenAI: ${process.env.OPENAI_API_KEY?.trim() && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here' ? 'enabled' : 'disabled (using local fallback)'}`);
});
