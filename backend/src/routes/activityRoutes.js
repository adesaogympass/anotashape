import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  getDailyActivity,
  updateActivityGoals,
  getActivityHistory
} from '../controllers/activityController.js';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// GET /api/activity/daily - Buscar atividade diária (anéis)
router.get('/daily', getDailyActivity);

// PUT /api/activity/goals - Atualizar metas de atividade
router.put('/goals', updateActivityGoals);

// GET /api/activity/history - Buscar histórico de atividade
router.get('/history', getActivityHistory);

export default router;
