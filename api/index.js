import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import workoutRoutes from './routes/workoutRoutes.js';
import exerciseRoutes from './routes/exerciseRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import achievementsRoutes from './routes/achievementsRoutes.js';
import activityRoutes from './routes/activityRoutes.js';

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
