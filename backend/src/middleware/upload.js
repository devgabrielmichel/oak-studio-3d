import multer from 'multer';
import { mkdirSync } from 'fs';
import { extname, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { v4 as uuidv4 } from 'uuid';

const __dirname = dirname(fileURLToPath(import.meta.url));
const uploadsDir = join(__dirname, '../../uploads');
mkdirSync(uploadsDir, { recursive: true });

const ALLOWED_EXTENSIONS = new Set([
  '.stl',
  '.obj',
  '.3mf',
  '.step',
  '.stp',
  '.iges',
  '.igs',
  '.zip',
  '.rar',
  '.7z',
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

function fileFilter(_req, file, cb) {
  const ext = extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return cb(
      new Error(
        'Formato não permitido. Envie STL, OBJ, 3MF, STEP, IGES ou um arquivo compactado (ZIP/RAR/7Z).'
      )
    );
  }
  cb(null, true);
}

const maxMb = Number(process.env.UPLOAD_MAX_MB) || 50;

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxMb * 1024 * 1024 },
});
