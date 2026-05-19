import Database from 'better-sqlite3';
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '../../data');
mkdirSync(dataDir, { recursive: true });

const dbPath = join(dataDir, 'oak-studio.db');
const db = new Database(dbPath);

export const KANBAN_STATUSES = [
  'recebido',
  'analise',
  'orcamento',
  'producao',
  'concluido',
];

export function upsertClient({ name, email, phone }) {
  const normalizedEmail = email.toLowerCase().trim();
  const existing = db
    .prepare('SELECT * FROM clients WHERE email = ?')
    .get(normalizedEmail);

  if (existing) {
    db.prepare(`
      UPDATE clients SET name = @name, phone = @phone, updated_at = datetime('now')
      WHERE id = @id
    `).run({
      id: existing.id,
      name: name.trim(),
      phone: phone?.trim() || existing.phone,
    });
    return existing.id;
  }

  const id = uuidv4();
  db.prepare(`
    INSERT INTO clients (id, name, email, phone) VALUES (@id, @name, @email, @phone)
  `).run({
    id,
    name: name.trim(),
    email: normalizedEmail,
    phone: phone?.trim() || null,
  });
  return id;
}

export function insertSubmission(record) {
  const stmt = db.prepare(`
    INSERT INTO submissions (
      id, client_id, client_name, client_email, client_phone, project_description,
      status, lgpd_accepted_at, ip_address, original_filename, stored_filename,
      file_size, mime_type
    ) VALUES (
      @id, @clientId, @clientName, @clientEmail, @clientPhone, @projectDescription,
      @status, @lgpdAcceptedAt, @ipAddress, @originalFilename, @storedFilename,
      @fileSize, @mimeType
    )
  `);
  stmt.run(record);
}

export function findUserByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
}

export function getAllSubmissions() {
  return db
    .prepare(`
      SELECT
        s.id, s.status, s.client_name AS clientName, s.client_email AS clientEmail,
        s.client_phone AS clientPhone, s.project_description AS projectDescription,
        s.original_filename AS originalFilename, s.file_size AS fileSize,
        s.created_at AS createdAt, s.client_id AS clientId,
        c.name AS registeredClientName
      FROM submissions s
      LEFT JOIN clients c ON c.id = s.client_id
      ORDER BY s.created_at DESC
    `)
    .all();
}

export function getSubmissionById(id) {
  return db
    .prepare(`
      SELECT
        s.*, s.client_name AS clientName, s.client_email AS clientEmail,
        s.client_phone AS clientPhone, s.project_description AS projectDescription,
        s.original_filename AS originalFilename, s.stored_filename AS storedFilename,
        s.file_size AS fileSize, s.created_at AS createdAt, s.client_id AS clientId
      FROM submissions s WHERE s.id = ?
    `)
    .get(id);
}

export function updateSubmissionStatus(id, status) {
  const result = db
    .prepare(`UPDATE submissions SET status = ? WHERE id = ?`)
    .run(status, id);
  return result.changes > 0;
}

export function getAllClients() {
  return db
    .prepare(`
      SELECT
        c.id, c.name, c.email, c.phone, c.created_at AS createdAt,
        c.updated_at AS updatedAt,
        COUNT(s.id) AS submissionCount,
        MAX(s.created_at) AS lastSubmissionAt
      FROM clients c
      LEFT JOIN submissions s ON s.client_id = c.id
      GROUP BY c.id
      ORDER BY c.updated_at DESC
    `)
    .all();
}

export default db;
