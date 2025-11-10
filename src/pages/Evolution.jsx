import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { workoutService, historyService } from '../services/api';
import Card from '../components/Card';
import BottomNav from '../components/BottomNav';

/**
 * Página de evolução com gráficos de progresso
 */
const Evolution = () => {
  const [workouts, setWorkouts] = useState([]);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [exerciseHistory, setExerciseHistory] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkouts();
  }, []);

  useEffect(() => {
    if (selectedWorkout) {
      loadExerciseHistory(selectedWorkout);
    }
  }, [selectedWorkout]);

  const loadWorkouts = async () => {
    try {
      const response = await workoutService.getAll();
      const workoutsData = response.data.workouts || [];
      setWorkouts(workoutsData);

      // Seleciona o primeiro treino por padrão
      if (workoutsData.length > 0) {
        setSelectedWorkout(workoutsData[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar treinos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExerciseHistory = async (workout) => {
    if (!workout.exercises || workout.exercises.length === 0) return;

    try {
      const historyData = {};

      // Busca histórico de cada exercício
      for (const exercise of workout.exercises) {
        const response = await historyService.getExerciseHistory(exercise.id);
        const logs = response.data.logs || [];

        // Processa os dados para o gráfico
        const chartData = logs
          .reverse()
          .map((log, index) => {
            // Calcula a carga máxima e média
            const weights = log.sets_data?.map((set) => set.weight) || [];
            const maxWeight = Math.max(...weights, 0);
            const avgWeight =
              weights.reduce((sum, w) => sum + w, 0) / weights.length || 0;

            return {
              session: index + 1,
              date: new Date(log.workout_history?.completed_at).toLocaleDateString(
                'pt-BR',
                { day: '2-digit', month: 'short' }
              ),
              maxWeight: maxWeight,
              avgWeight: avgWeight.toFixed(1),
              totalReps: log.sets_data?.reduce((sum, set) => sum + set.reps, 0) || 0,
            };
          });

        historyData[exercise.id] = {
          name: exercise.name,
          data: chartData,
        };
      }

      setExerciseHistory(historyData);
    } catch (error) {
      console.error('Erro ao carregar histórico de exercícios:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (workouts.length === 0) {
    return (
      <div className="min-h-screen pb-20 bg-dark-50">
        <div className="max-w-4xl mx-auto p-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-dark-800 mb-2">Evolução</h1>
            <p className="text-dark-500">Acompanhe seu progresso ao longo do tempo</p>
          </div>

          <Card className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-dark-400 mx-auto mb-4" />
            <p className="text-dark-500 mb-2">Nenhum treino criado ainda</p>
            <p className="text-dark-400 text-sm">
              Crie treinos e complete-os para ver sua evolução
            </p>
          </Card>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-dark-50">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dark-800 mb-2">Evolução</h1>
          <p className="text-dark-500">Acompanhe seu progresso ao longo do tempo</p>
        </div>

        {/* Seletor de treino */}
        <Card className="mb-6">
          <label className="block text-sm font-medium text-dark-600 mb-2">
            Selecione o treino
          </label>
          <select
            value={selectedWorkout?.id || ''}
            onChange={(e) => {
              const workout = workouts.find((w) => w.id === e.target.value);
              setSelectedWorkout(workout);
            }}
            className="w-full"
          >
            {workouts.map((workout) => (
              <option key={workout.id} value={workout.id}>
                {workout.name}
              </option>
            ))}
          </select>
        </Card>

        {/* Gráficos de evolução */}
        {selectedWorkout && (
          <div className="space-y-6">
            {selectedWorkout.exercises?.length === 0 ? (
              <Card className="text-center py-12">
                <p className="text-dark-500">
                  Este treino não possui exercícios cadastrados
                </p>
              </Card>
            ) : (
              <>
                {selectedWorkout.exercises?.map((exercise, index) => {
                  const history = exerciseHistory[exercise.id];

                  if (!history || history.data.length === 0) {
                    return (
                      <motion.div
                        key={exercise.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card>
                          <h3 className="text-xl font-bold text-dark-800 mb-2">
                            {exercise.name}
                          </h3>
                          <p className="text-dark-500 text-center py-8">
                            Nenhum histórico registrado ainda
                          </p>
                        </Card>
                      </motion.div>
                    );
                  }

                  return (
                    <motion.div
                      key={exercise.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card>
                        <div className="flex items-center gap-2 mb-4">
                          <TrendingUp className="w-5 h-5 text-primary-600" />
                          <h3 className="text-xl font-bold text-dark-800">
                            {history.name}
                          </h3>
                        </div>

                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={history.data}
                              margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
                            >
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#3f3f46"
                                opacity={0.3}
                              />
                              <XAxis
                                dataKey="date"
                                stroke="#a1a1aa"
                                fontSize={12}
                              />
                              <YAxis stroke="#a1a1aa" fontSize={12} />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: '#18181b',
                                  border: '1px solid #3f3f46',
                                  borderRadius: '8px',
                                  color: '#fafafa',
                                }}
                                labelStyle={{ color: '#d4d4d8' }}
                              />
                              <Legend
                                wrapperStyle={{ paddingTop: '20px' }}
                                iconType="line"
                              />
                              <Line
                                type="monotone"
                                dataKey="maxWeight"
                                stroke="#0ea5e9"
                                strokeWidth={3}
                                name="Carga Máxima (kg)"
                                dot={{ fill: '#0ea5e9', r: 4 }}
                                activeDot={{ r: 6 }}
                              />
                              <Line
                                type="monotone"
                                dataKey="avgWeight"
                                stroke="#10b981"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                name="Carga Média (kg)"
                                dot={{ fill: '#10b981', r: 3 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Estatísticas resumidas */}
                        <div className="mt-6 grid grid-cols-3 gap-4">
                          <div className="text-center p-3 bg-dark-50 rounded-lg">
                            <p className="text-2xl font-bold text-primary-600">
                              {history.data.length}
                            </p>
                            <p className="text-xs text-dark-500">Sessões</p>
                          </div>
                          <div className="text-center p-3 bg-dark-50 rounded-lg">
                            <p className="text-2xl font-bold text-primary-600">
                              {Math.max(
                                ...history.data.map((d) => d.maxWeight),
                                0
                              )}
                              kg
                            </p>
                            <p className="text-xs text-dark-500">Recorde</p>
                          </div>
                          <div className="text-center p-3 bg-dark-50 rounded-lg">
                            <p className="text-2xl font-bold text-primary-600">
                              {history.data.length > 0
                                ? history.data[history.data.length - 1].maxWeight
                                : 0}
                              kg
                            </p>
                            <p className="text-xs text-dark-500">Última</p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Evolution;
