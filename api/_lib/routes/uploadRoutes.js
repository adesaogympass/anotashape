import express from 'express';
import multer from 'multer';
import { uploadAvatar } from '../controllers/uploadController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Configuração do multer para armazenar em memória
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    // Aceita apenas imagens
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas'));
    }
  },
});

// Rota de upload de avatar (protegida)
router.post('/avatar', authenticate, upload.single('avatar'), uploadAvatar);

export default router;
