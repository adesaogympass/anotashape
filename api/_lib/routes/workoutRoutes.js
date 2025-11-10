import express from 'express';
import {
  createWorkout,
  getWorkouts,
  getWorkoutById,
  updateWorkout,
  deleteWorkout,
  getTodayWorkout,
} from '../controllers/workoutController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Todas as rotas são protegidas
router.use(authenticate);

router.post('/', createWorkout);
router.get('/', getWorkouts);
router.get('/today', getTodayWorkout);
router.get('/:id', getWorkoutById);
router.put('/:id', updateWorkout);
router.delete('/:id', deleteWorkout);

export default router;
