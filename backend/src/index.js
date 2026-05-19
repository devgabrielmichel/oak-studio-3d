import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import submissionsRouter from './routes/submissions.js';
import adminRouter from './routes/admin.js';
import { logAction } from './utils/logger.js';

const app = express();
const port = Number(process.env.PORT) || 3001;
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';

app.set('trust proxy', 1);
app.use(cors({ origin: corsOrigin }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Oak Studio 3D API' });
});

app.use('/api', submissionsRouter);
app.use('/api/admin', adminRouter);

app.use((err, req, res, _next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    const maxMb = Number(process.env.UPLOAD_MAX_MB) || 50;
    return res.status(400).json({ error: `Arquivo excede o limite de ${maxMb} MB.` });
  }
  if (err.message?.includes('Formato não permitido')) {
    return res.status(400).json({ error: err.message });
  }
  console.error(err);
  logAction({
    action: 'api_error',
    user: req.body?.clientEmail || req.user?.email || 'anonymous',
    resource: req.path,
    details: { message: err.message },
  });
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

app.listen(port, () => {
  console.log(`Oak Studio 3D API rodando em http://localhost:${port}`);
});
