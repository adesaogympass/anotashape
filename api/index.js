import express from 'express';
import cors from 'cors';
import authRoutes from './_lib/routes/authRoutes.js';
import workoutRoutes from './_lib/routes/workoutRoutes.js';
import exerciseRoutes from './_lib/routes/exerciseRoutes.js';
import historyRoutes from './_lib/routes/historyRoutes.js';
import uploadRoutes from './_lib/routes/uploadRoutes.js';
import achievementsRoutes from './_lib/routes/achievementsRoutes.js';
import activityRoutes from './_lib/routes/activityRoutes.js';

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

// Export para Vercel Serverless - IMPORTANTE: handler, não o app diretamente
export default (req, res) => {
  return app(req, res);
};
