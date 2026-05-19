import { appendFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const logsDir = join(__dirname, '../../logs');
mkdirSync(logsDir, { recursive: true });
const logFile = join(logsDir, 'app.log');

export function logAction({ action, user, resource, details = {} }) {
  const entry = {
    action,
    timestamp: new Date().toISOString(),
    user: user || 'anonymous',
    resource,
    ...details,
  };
  appendFileSync(logFile, JSON.stringify(entry) + '\n', 'utf8');
}
