import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { insertSubmission, upsertClient } from '../db/database.js';
import { logAction } from '../utils/logger.js';
import { upload } from '../middleware/upload.js';

const router = Router();

const PRIVACY_TEXT = {
  title: 'Termos de Privacidade e LGPD — Oak Studio 3D',
  version: '1.0',
  content: `A Oak Studio 3D, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD), informa que os dados pessoais e arquivos de modelagem 3D enviados por você serão utilizados exclusivamente para:

• Análise técnica do seu projeto de impressão 3D;
• Elaboração de orçamento e comunicação sobre o pedido;
• Execução do serviço contratado, quando aplicável.

Seus dados serão armazenados de forma segura em ambiente controlado, não serão compartilhados com terceiros sem seu consentimento, e poderão ser excluídos mediante solicitação ao e-mail de contato da empresa.

Ao marcar a opção de concordância e enviar o formulário, você declara ter lido e aceito estes termos.`,
};

router.get('/privacy', (_req, res) => {
  logAction({
    action: 'screen_access',
    user: 'anonymous',
    resource: '/api/privacy',
  });
  res.json(PRIVACY_TEXT);
});

router.post('/submissions', upload.single('modelFile'), (req, res) => {
  const {
    clientName,
    clientEmail,
    clientPhone,
    projectDescription,
    lgpdAccepted,
  } = req.body;

  if (lgpdAccepted !== 'true') {
    return res.status(400).json({
      error: 'É necessário aceitar os termos de privacidade (LGPD) antes do envio.',
    });
  }

  if (!clientName?.trim() || !clientEmail?.trim()) {
    return res.status(400).json({ error: 'Nome e e-mail são obrigatórios.' });
  }

  const id = uuidv4();
  const lgpdAcceptedAt = new Date().toISOString();

  try {
    const clientId = upsertClient({
      name: clientName.trim(),
      email: clientEmail.trim(),
      phone: clientPhone?.trim(),
    });

    insertSubmission({
      id,
      clientId,
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim().toLowerCase(),
      clientPhone: clientPhone?.trim() || null,
      projectDescription: projectDescription?.trim() || null,
      status: 'recebido',
      lgpdAcceptedAt,
      ipAddress: req.ip,
      originalFilename: req.file?.originalname ?? null,
      storedFilename: req.file?.filename ?? null,
      fileSize: req.file?.size ?? null,
      mimeType: req.file?.mimetype ?? null,
    });

    logAction({
      action: 'data_creation',
      user: clientEmail.trim(),
      resource: `submission:${id}`,
      details: {
        clientName: clientName.trim(),
        clientId,
        hasFile: !!req.file,
        filename: req.file?.originalname ?? null,
        fileSize: req.file?.size ?? null,
      },
    });

    res.status(201).json({
      success: true,
      message: req.file
        ? 'Arquivo recebido com sucesso! Entraremos em contato em breve pela Oak Studio 3D.'
        : 'Solicitação recebida com sucesso! Entraremos em contato em breve pela Oak Studio 3D.',
      submissionId: id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao registrar o envio. Tente novamente.' });
  }
});

export default router;
