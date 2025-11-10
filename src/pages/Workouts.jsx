import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Play, Calendar, Edit2, Trash2 } from 'lucide-react';
import { workoutService } from '../services/api';
import Button from '../components/Button';
import Card from '../components/Card';
import BottomNav from '../components/BottomNav';

const DAYS_OF_WEEK = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
];

/**
 * Página de treinos - listagem e gerenciamento
 */
const Workouts = () => {
  const [workouts, setWorkouts] = useState([]);
  const [todayWorkout, setTodayWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadWorkouts();
    loadTodayWorkout();
  }, []);

  const loadWorkouts = async () => {
    try {
      const response = await workoutService.getAll();
      setWorkouts(response.data.workouts || []);
    } catch (error) {
      console.error('Erro ao carregar treinos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTodayWorkout = async () => {
    try {
      const response = await workoutService.getToday();
      setTodayWorkout(response.data.workout);
    } catch (error) {
      console.error('Erro ao carregar treino do dia:', error);
    }
  };

  const handleDeleteWorkout = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar este treino?')) return;

    try {
      await workoutService.delete(id);
      loadWorkouts();
      loadTodayWorkout();
    } catch (error) {
      console.error('Erro ao deletar treino:', error);
      alert('Erro ao deletar treino');
    }
  };

  const handleStartWorkout = () => {
    if (todayWorkout) {
      navigate(`/workout/${todayWorkout.id}/start`);
    }
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
          <h1 className="text-3xl font-bold text-dark-800 mb-2">Meus Treinos</h1>
          <p className="text-dark-500">Gerencie e inicie seus treinos</p>
        </div>

        {/* Treino de hoje */}
        {todayWorkout && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-br from-primary-600 to-primary-700 border-0 text-white">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5" />
                <h2 className="text-xl font-bold">Treino de Hoje</h2>
              </div>
              <h3 className="text-2xl font-bold mb-2">{todayWorkout.name}</h3>
              {todayWorkout.description && (
                <p className="text-primary-100 mb-4">{todayWorkout.description}</p>
              )}
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={handleStartWorkout}
                  className="flex items-center gap-2 bg-white text-primary-700 hover:bg-primary-50"
                >
                  <Play className="w-5 h-5" />
                  Iniciar Treino
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/workout/${todayWorkout.id}/edit`)}
                  className="border-white text-white hover:bg-white/20"
                >
                  <Edit2 className="w-5 h-5" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Lista de treinos por dia da semana */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-dark-800">Todos os Treinos</h2>
          <Button
            variant="primary"
            onClick={() => navigate('/workout/new')}
            className="flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Novo Treino
          </Button>
        </div>

        {workouts.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-dark-500 mb-4">Você ainda não criou nenhum treino</p>
            <Button onClick={() => navigate('/workout/new')} className="mx-auto">
              Criar Primeiro Treino
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {workouts.map((workout, index) => (
                <motion.div
                  key={workout.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:border-primary-500 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {workout.day_of_week !== null && (
                            <span className="px-3 py-1 bg-primary-600 text-white text-sm font-medium rounded-full">
                              {DAYS_OF_WEEK[workout.day_of_week]}
                            </span>
                          )}
                          <h3 className="text-lg font-bold text-dark-800">
                            {workout.name}
                          </h3>
                        </div>
                        {workout.description && (
                          <p className="text-dark-500 text-sm mb-2">
                            {workout.description}
                          </p>
                        )}
                        <p className="text-dark-400 text-sm">
                          {workout.exercises?.length || 0} exercícios
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/workout/${workout.id}/start`)}
                          className="p-2 hover:bg-primary-100 rounded-lg transition-colors"
                        >
                          <Play className="w-5 h-5 text-primary-600" />
                        </button>
                        <button
                          onClick={() => navigate(`/workout/${workout.id}/edit`)}
                          className="p-2 hover:bg-dark-200 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-5 h-5 text-dark-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteWorkout(workout.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5 text-red-600" />
                        </button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Workouts;
