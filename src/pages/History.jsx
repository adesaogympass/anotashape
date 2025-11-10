import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Dumbbell, TrendingUp, Flame } from 'lucide-react';
import { historyService } from '../services/api';
import Card from '../components/Card';
import BottomNav from '../components/BottomNav';

/**
 * Página de histórico de treinos
 */
const History = () => {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
    loadStats();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await historyService.getAll({ limit: 50 });
      setHistory(response.data.history || []);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await historyService.getStats();
      setStats(response.data.stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
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

  return (
    <div className="min-h-screen pb-20 bg-dark-50">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dark-800 mb-2">Histórico</h1>
          <p className="text-dark-500">Acompanhe seus treinos realizados</p>
        </div>

        {/* Estatísticas */}
        {stats && (
          <div className="grid grid-cols-2 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="text-center">
                <Dumbbell className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-dark-800">
                  {stats.totalWorkouts}
                </p>
                <p className="text-sm text-dark-500">Treinos Totais</p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="text-center">
                <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-dark-800">
                  {stats.last30Days}
                </p>
                <p className="text-sm text-dark-500">Últimos 30 Dias</p>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Lista de histórico */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-dark-800 mb-4">
            Treinos Realizados
          </h2>
        </div>

        {history.length === 0 ? (
          <Card className="text-center py-12">
            <Calendar className="w-16 h-16 text-dark-400 mx-auto mb-4" />
            <p className="text-dark-500 mb-2">Nenhum treino realizado ainda</p>
            <p className="text-dark-400 text-sm">
              Complete um treino para ver o histórico aqui
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {history.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-dark-800">
                        {entry.workouts?.name || 'Treino'}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4 text-dark-400" />
                        <p className="text-sm text-dark-500">
                          {formatDate(entry.completed_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="px-3 py-1 bg-green-500/20 text-green-600 text-sm font-medium rounded-full">
                        Completo
                      </span>
                      {entry.calories_burned && (
                        <div className="flex items-center gap-1 text-orange-600">
                          <Flame className="w-4 h-4" />
                          <span className="text-sm font-semibold">
                            {Math.round(entry.calories_burned)} kcal
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Exercícios realizados */}
                  {entry.exercise_logs && entry.exercise_logs.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-dark-600 mb-2">
                        Exercícios:
                      </p>
                      {entry.exercise_logs.map((log) => (
                        <div
                          key={log.id}
                          className="p-3 bg-dark-50 rounded-lg border border-dark-200"
                        >
                          <p className="font-medium text-dark-800">
                            {log.exercises?.name || 'Exercício'}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {log.sets_data?.map((set, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-primary-600/20 text-primary-700 text-xs font-medium rounded"
                              >
                                {set.weight}kg × {set.reps}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default History;
