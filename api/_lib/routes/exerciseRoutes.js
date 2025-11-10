import express from 'express';
import {
  createExercise,
  getExercisesByWorkout,
  updateExercise,
  deleteExercise,
} from '../controllers/exerciseController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Todas as rotas são protegidas
router.use(authenticate);

router.post('/', createExercise);
router.get('/workout/:workoutId', getExercisesByWorkout);
router.put('/:id', updateExercise);
router.delete('/:id', deleteExercise);

export default router;
