import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, Flame, Award, Calendar, Dumbbell } from 'lucide-react';
import ActivityRings from '../components/ActivityRings';
import Card from '../components/Card';
import BottomNav from '../components/BottomNav';
import { useNavigate } from 'react-router-dom';
import { activityService, historyService } from '../services/api';

/**
 * Página de Atividade com círculos estilo Apple Fitness
 */
const Activity = () => {
  const [activity, setActivity] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadActivity();
    loadHistory();
  }, []);

  const loadActivity = async () => {
    try {
      const response = await activityService.getDailyActivity();
      setActivity(response.data);
    } catch (error) {
      console.error('Erro ao carregar atividade:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await historyService.getAll({ limit: 5 });
      setHistory(response.data.history || []);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen pb-20 bg-dark-50">
        <div className="max-w-4xl mx-auto p-4">
          <Card className="text-center py-12">
            <p className="text-dark-500">Erro ao carregar atividades</p>
          </Card>
        </div>
        <BottomNav />
      </div>
    );
  }

  const { today, goals, totals } = activity;

  // Calcular porcentagens para efeitos visuais
  const caloriesPercent = Math.min((today.calories / goals.calories) * 100, 100);
  const workoutsPercent = Math.min((today.workouts / goals.workouts) * 100, 100);
  const streakPercent = Math.min((today.streak / goals.streak) * 100, 100);

  return (
    <div className="min-h-screen pb-20 bg-dark-50">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dark-800 mb-2">Atividade</h1>
          <p className="text-dark-500">Acompanhe seu progresso diário</p>
        </div>

        {/* Círculos de Atividade */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="flex flex-col items-center py-8">
            <h2 className="text-xl font-bold text-dark-800 mb-6">Hoje</h2>
            <ActivityRings
              calories={today.calories}
              caloriesGoal={goals.calories}
              workouts={today.workouts}
              workoutsGoal={goals.workouts}
              streak={today.streak}
              streakGoal={goals.streak}
              size="lg"
            />
            <div className="mt-8 grid grid-cols-3 gap-6 w-full max-w-md">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <p className="text-sm font-medium text-dark-600">Calorias</p>
                </div>
                <p className="text-2xl font-bold text-dark-800">{today.calories}</p>
                <p className="text-xs text-dark-500">de {goals.calories}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <p className="text-sm font-medium text-dark-600">Treinos</p>
                </div>
                <p className="text-2xl font-bold text-dark-800">{today.workouts}</p>
                <p className="text-xs text-dark-500">de {goals.workouts}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  <p className="text-sm font-medium text-dark-600">Sequência</p>
                </div>
                <p className="text-2xl font-bold text-dark-800">{today.streak}</p>
                <p className="text-xs text-dark-500">dias</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Estatísticas Resumidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="text-center">
              <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-dark-800">
                {totals.calories.toLocaleString()}
              </p>
              <p className="text-xs text-dark-500">Calorias Total</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="text-center">
              <Target className="w-8 h-8 text-primary-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-dark-800">{totals.workouts}</p>
              <p className="text-xs text-dark-500">Treinos Total</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="text-center">
              <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-dark-800">{today.streak}</p>
              <p className="text-xs text-dark-500">Sequência Atual</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="text-center">
              <Award className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-dark-800">{totals.bestStreak}</p>
              <p className="text-xs text-dark-500">Melhor Sequência</p>
            </Card>
          </motion.div>
        </div>

        {/* Conquistas Recentes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-dark-800">Conquistas</h2>
              <button
                onClick={() => navigate('/achievements')}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Ver Todas
              </button>
            </div>
            <div className="text-center py-8">
              <Award className="w-16 h-16 text-dark-400 mx-auto mb-4" />
              <p className="text-dark-500 mb-2">Complete treinos para desbloquear conquistas!</p>
              <button
                onClick={() => navigate('/achievements')}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Explorar Conquistas
              </button>
            </div>
          </Card>
        </motion.div>

        {/* Ações Rápidas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 grid grid-cols-2 gap-4"
        >
          <button
            onClick={() => navigate('/workouts')}
            className="p-4 bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            <Calendar className="w-8 h-8 mx-auto mb-2" />
            <p className="font-semibold">Iniciar Treino</p>
          </button>
          <button
            onClick={() => navigate('/evolution')}
            className="p-4 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            <TrendingUp className="w-8 h-8 mx-auto mb-2" />
            <p className="font-semibold">Ver Evolução</p>
          </button>
        </motion.div>

        {/* Histórico de Treinos Recentes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-dark-800">Treinos Recentes</h2>
            <button
              onClick={() => navigate('/history')}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Ver Todos
            </button>
          </div>

          {history.length === 0 ? (
            <Card className="text-center py-8">
              <Dumbbell className="w-12 h-12 text-dark-400 mx-auto mb-3" />
              <p className="text-dark-500 mb-2">Nenhum treino realizado ainda</p>
              <p className="text-dark-400 text-sm">
                Complete um treino para ver o histórico aqui
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {history.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-dark-800">
                          {entry.workouts?.name || 'Treino'}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="w-3 h-3 text-dark-400" />
                          <p className="text-sm text-dark-500">
                            {formatDate(entry.completed_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="px-2 py-1 bg-green-500/20 text-green-600 text-xs font-medium rounded-full">
                          Completo
                        </span>
                        {entry.calories_burned && (
                          <div className="flex items-center gap-1 text-orange-600">
                            <Flame className="w-3 h-3" />
                            <span className="text-xs font-semibold">
                              {Math.round(entry.calories_burned)} kcal
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Mini resumo dos exercícios */}
                    {entry.exercise_logs && entry.exercise_logs.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-dark-200">
                        <p className="text-xs text-dark-500">
                          {entry.exercise_logs.length} exercício
                          {entry.exercise_logs.length > 1 ? 's' : ''} • {' '}
                          {entry.exercise_logs.reduce(
                            (sum, log) => sum + (log.sets_data?.length || 0),
                            0
                          )}{' '}
                          séries
                        </p>
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Activity;
