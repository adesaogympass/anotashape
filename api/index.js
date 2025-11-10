import express from 'express';
import cors from 'cors';
import authRoutes from '../backend/src/routes/authRoutes.js';
import workoutRoutes from '../backend/src/routes/workoutRoutes.js';
import exerciseRoutes from '../backend/src/routes/exerciseRoutes.js';
import historyRoutes from '../backend/src/routes/historyRoutes.js';
import uploadRoutes from '../backend/src/routes/uploadRoutes.js';
import achievementsRoutes from '../backend/src/routes/achievementsRoutes.js';
import activityRoutes from '../backend/src/routes/activityRoutes.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/achievements', achievementsRoutes);
app.use('/api/activity', activityRoutes);

// Rota 404
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Export para Vercel Serverless
export default app;
