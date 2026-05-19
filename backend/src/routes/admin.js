import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  findUserByEmail,
  getAllSubmissions,
  getSubmissionById,
  updateSubmissionStatus,
  getAllClients,
  KANBAN_STATUSES,
} from '../db/database.js';
import { requireAuth, signToken } from '../middleware/auth.js';
import { logAction } from '../utils/logger.js';

const router = Router();
const __dirname = dirname(fileURLToPath(import.meta.url));
const uploadsDir = join(__dirname, '../../uploads');

const STATUS_LABELS = {
  recebido: 'Recebido',
  analise: 'Em análise',
  orcamento: 'Orçamento',
  producao: 'Em produção',
  concluido: 'Concluído',
};

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
  }

  const user = findUserByEmail(email.trim());
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    logAction({
      action: 'login_failed',
      user: email.trim(),
      resource: '/api/admin/login',
    });
    return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
  }

  const token = signToken({ id: user.id, email: user.email, name: user.name });

  logAction({
    action: 'login',
    user: user.email,
    resource: '/api/admin/login',
  });

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

router.get('/kanban', requireAuth, (req, res) => {
  logAction({
    action: 'screen_access',
    user: req.user.email,
    resource: '/api/admin/kanban',
  });

  const submissions = getAllSubmissions();
  const columns = KANBAN_STATUSES.map((status) => ({
    id: status,
    label: STATUS_LABELS[status],
    cards: submissions
      .filter((s) => s.status === status)
      .map((s) => ({
        id: s.id,
        clientName: s.clientName,
        clientEmail: s.clientEmail,
        clientPhone: s.clientPhone,
        projectDescription: s.projectDescription,
        originalFilename: s.originalFilename,
        fileSize: s.fileSize,
        createdAt: s.createdAt,
        clientId: s.clientId,
      })),
  }));

  res.json({ columns, statuses: KANBAN_STATUSES, labels: STATUS_LABELS });
});

router.get('/submissions', requireAuth, (_req, res) => {
  res.json({ submissions: getAllSubmissions() });
});

router.patch('/submissions/:id/status', requireAuth, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!KANBAN_STATUSES.includes(status)) {
    return res.status(400).json({
      error: `Status inválido. Use: ${KANBAN_STATUSES.join(', ')}`,
    });
  }

  const submission = getSubmissionById(id);
  if (!submission) {
    return res.status(404).json({ error: 'Pedido não encontrado.' });
  }

  updateSubmissionStatus(id, status);

  logAction({
    action: 'data_editing',
    user: req.user.email,
    resource: `submission:${id}`,
    details: { status, previousStatus: submission.status },
  });

  res.json({ success: true, id, status });
});

router.get('/submissions/:id/file', requireAuth, (req, res) => {
  const submission = getSubmissionById(req.params.id);
  if (!submission) {
    return res.status(404).json({ error: 'Pedido não encontrado.' });
  }

  if (!submission.stored_filename) {
    return res.status(404).json({ error: 'Este pedido não possui arquivo anexado.' });
  }

  logAction({
    action: 'api_consumption',
    user: req.user.email,
    resource: `submission:${submission.id}:file`,
  });

  res.download(
    join(uploadsDir, submission.stored_filename),
    submission.original_filename
  );
});

router.get('/clients', requireAuth, (req, res) => {
  logAction({
    action: 'screen_access',
    user: req.user.email,
    resource: '/api/admin/clients',
  });
  res.json({ clients: getAllClients() });
});

export default router;
