import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '../../data');
mkdirSync(dataDir, { recursive: true });

const db = new Database(join(dataDir, 'oak-studio.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    applied_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

function applied(name) {
  return !!db.prepare('SELECT 1 FROM schema_migrations WHERE name = ?').get(name);
}

function mark(name) {
  db.prepare('INSERT INTO schema_migrations (name) VALUES (?)').run(name);
}

const migrations = [
  {
    name: '001_create_submissions',
    up() {
      db.exec(`
        CREATE TABLE IF NOT EXISTS submissions (
          id TEXT PRIMARY KEY,
          client_name TEXT NOT NULL,
          client_email TEXT NOT NULL,
          client_phone TEXT,
          project_description TEXT,
          lgpd_accepted_at TEXT NOT NULL,
          ip_address TEXT,
          original_filename TEXT NOT NULL,
          stored_filename TEXT NOT NULL,
          file_size INTEGER NOT NULL,
          mime_type TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
      `);
    },
  },
  {
    name: '002_clients_users_status',
    up() {
      db.exec(`
        CREATE TABLE IF NOT EXISTS clients (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          phone TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
      `);

      const cols = db.prepare('PRAGMA table_info(submissions)').all();
      if (!cols.some((c) => c.name === 'status')) {
        db.exec(`ALTER TABLE submissions ADD COLUMN status TEXT NOT NULL DEFAULT 'recebido';`);
      }
      if (!cols.some((c) => c.name === 'client_id')) {
        db.exec(`ALTER TABLE submissions ADD COLUMN client_id TEXT REFERENCES clients(id);`);
      }

      const orphanSubs = db
        .prepare(
          `SELECT id, client_name, client_email, client_phone FROM submissions WHERE client_id IS NULL`
        )
        .all();

      const findClient = db.prepare('SELECT id FROM clients WHERE email = ?');
      const insertClient = db.prepare(`
        INSERT INTO clients (id, name, email, phone) VALUES (@id, @name, @email, @phone)
      `);
      const updateSubClient = db.prepare(
        'UPDATE submissions SET client_id = ? WHERE id = ?'
      );

      for (const sub of orphanSubs) {
        let client = findClient.get(sub.client_email.toLowerCase());
        if (!client) {
          const clientId = uuidv4();
          insertClient.run({
            id: clientId,
            name: sub.client_name,
            email: sub.client_email.toLowerCase(),
            phone: sub.client_phone,
          });
          client = { id: clientId };
        }
        updateSubClient.run(client.id, sub.id);
      }
    },
  },
  {
    name: '004_optional_file_fields',
    up() {
      db.exec(`
        CREATE TABLE submissions_new (
          id TEXT PRIMARY KEY,
          client_id TEXT,
          client_name TEXT NOT NULL,
          client_email TEXT NOT NULL,
          client_phone TEXT,
          project_description TEXT,
          status TEXT NOT NULL DEFAULT 'recebido',
          lgpd_accepted_at TEXT NOT NULL,
          ip_address TEXT,
          original_filename TEXT,
          stored_filename TEXT,
          file_size INTEGER,
          mime_type TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        INSERT INTO submissions_new (
          id, client_id, client_name, client_email, client_phone, project_description,
          status, lgpd_accepted_at, ip_address, original_filename, stored_filename,
          file_size, mime_type, created_at
        )
        SELECT
          id, client_id, client_name, client_email, client_phone, project_description,
          status, lgpd_accepted_at, ip_address, original_filename, stored_filename,
          file_size, mime_type, created_at
        FROM submissions;

        DROP TABLE submissions;
        ALTER TABLE submissions_new RENAME TO submissions;
      `);
    },
  },
  {
    name: '003_seed_admin_user',
    up() {
      const email = 'admin@oakstudio.com';
      const exists = db.prepare('SELECT 1 FROM users WHERE email = ?').get(email);
      if (!exists) {
        const hash = bcrypt.hashSync('senha123', 10);
        db.prepare(
          `INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)`
        ).run(uuidv4(), 'Administrador Oak Studio', email, hash);
        console.log('Usuário admin criado: admin@oakstudio.com');
      }
    },
  },
];

for (const m of migrations) {
  if (!applied(m.name)) {
    m.up();
    mark(m.name);
    console.log(`Migration applied: ${m.name}`);
  }
}

console.log('Database up to date.');
db.close();
