import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  getAllAchievements,
  getUserAchievements,
  getAchievementsProgress
} from '../controllers/achievementsController.js';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// GET /api/achievements - Buscar todas as conquistas disponíveis
router.get('/', getAllAchievements);

// GET /api/achievements/user - Buscar conquistas desbloqueadas do usuário
router.get('/user', getUserAchievements);

// GET /api/achievements/progress - Buscar progresso de todas as conquistas
router.get('/progress', getAchievementsProgress);

export default router;
