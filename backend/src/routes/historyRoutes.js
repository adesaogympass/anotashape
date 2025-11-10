import express from 'express';
import {
  createWorkoutHistory,
  getWorkoutHistory,
  getExerciseHistory,
  getStats,
} from '../controllers/workoutHistoryController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Todas as rotas são protegidas
router.use(authenticate);

router.post('/', createWorkoutHistory);
router.get('/', getWorkoutHistory);
router.get('/exercise/:exerciseId', getExerciseHistory);
router.get('/stats', getStats);

export default router;
