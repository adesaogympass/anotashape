import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, ChevronRight, Trophy, Flame, Award } from 'lucide-react';
import { workoutService, historyService } from '../services/api';
import Button from '../components/Button';
import Card from '../components/Card';
import Timer from '../components/Timer';
import Input from '../components/Input';
import Modal from '../components/Modal';

/**
 * Página de execução do treino com timer de descanso
 */
const WorkoutSession = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [workout, setWorkout] = useState(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exerciseData, setExerciseData] = useState({});
  const [showTimer, setShowTimer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [finishing, setFinishing] = useState(false);

  // Modais
  const [showExitModal, setShowExitModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [workoutResult, setWorkoutResult] = useState(null);

  useEffect(() => {
    loadWorkout();
  }, [id]);

  const loadWorkout = async () => {
    try {
      const response = await workoutService.getById(id);
      const workoutData = response.data.workout;

      // Ordena exercícios
      workoutData.exercises = workoutData.exercises?.sort(
        (a, b) => a.order_index - b.order_index
      ) || [];

      setWorkout(workoutData);

      // Inicializa os dados dos exercícios
      const initialData = {};
      workoutData.exercises.forEach((exercise) => {
        initialData[exercise.id] = Array.from({ length: exercise.sets }, () => ({
          weight: '',
          reps: exercise.reps,
        }));
      });
      setExerciseData(initialData);
    } catch (error) {
      console.error('Erro ao carregar treino:', error);
      alert('Erro ao carregar treino');
      navigate('/workouts');
    } finally {
      setLoading(false);
    }
  };

  const currentExercise = workout?.exercises[currentExerciseIndex];

  const handleSetChange = (setIndex, field, value) => {
    setExerciseData({
      ...exerciseData,
      [currentExercise.id]: exerciseData[currentExercise.id].map((set, i) =>
        i === setIndex ? { ...set, [field]: value } : set
      ),
    });
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < workout.exercises.length - 1) {
      setShowTimer(true);
    } else {
      finishWorkout();
    }
  };

  const handleTimerComplete = () => {
    setShowTimer(false);
    setCurrentExerciseIndex((prev) => prev + 1);
  };

  const handleSkipRest = () => {
    setShowTimer(false);
    setCurrentExerciseIndex((prev) => prev + 1);
  };

  const handleExit = () => {
    setShowExitModal(true);
  };

  const confirmExit = () => {
    navigate('/workouts');
  };

  const finishWorkout = async () => {
    setFinishing(true);

    try {
      // Prepara os dados para salvar no histórico
      // IMPORTANTE: O backend espera 'sets' (não 'sets_data')
      const exercises = workout.exercises.map((exercise) => ({
        exercise_id: exercise.id,
        sets_data: exerciseData[exercise.id].map((set, index) => ({
          set: index + 1,
          weight: parseFloat(set.weight) || 0,
          reps: parseInt(set.reps) || 0,
        })),
        // Adicionar também 'sets' para o cálculo de calorias
        sets: exerciseData[exercise.id].map((set) => ({
          weight: parseFloat(set.weight) || 0,
          reps: parseInt(set.reps) || 0,
        })),
      }));

      const response = await historyService.create({
        workout_id: workout.id,
        exercises,
      });

      // Salvar resultado para mostrar no modal
      setWorkoutResult({
        calories: response.data.history?.calories_burned || 0,
        newAchievements: response.data.newAchievements || [],
      });

      setShowSuccessModal(true);
    } catch (error) {
      console.error('Erro ao finalizar treino:', error);
      console.error('Detalhes do erro:', error.response?.data);
      alert(
        `Erro ao salvar treino: ${error.response?.data?.error || error.message}`
      );
    } finally {
      setFinishing(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    navigate('/activity');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!workout || !currentExercise) {
    return null;
  }

  const isLastExercise = currentExerciseIndex === workout.exercises.length - 1;
  const allSetsCompleted = exerciseData[currentExercise.id]?.every(
    (set) => set.weight && set.reps
  );

  return (
    <>
      <div className="min-h-screen pb-20 bg-dark-50">
        <div className="max-w-4xl mx-auto p-4">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <button
              onClick={handleExit}
              className="p-2 hover:bg-dark-200 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-dark-600" />
            </button>

            <div className="text-center">
              <h1 className="text-2xl font-bold text-dark-800">{workout.name}</h1>
              <p className="text-dark-500">
                Exercício {currentExerciseIndex + 1} de {workout.exercises.length}
              </p>
            </div>

            <div className="w-10" />
          </div>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="h-2 bg-dark-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary-600"
                initial={{ width: 0 }}
                animate={{
                  width: `${
                    ((currentExerciseIndex + 1) / workout.exercises.length) * 100
                  }%`,
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Exercício atual */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentExercise.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="mb-6">
                <h2 className="text-3xl font-bold text-dark-800 mb-2">
                  {currentExercise.name}
                </h2>
                <p className="text-dark-500">
                  {currentExercise.sets} séries × {currentExercise.reps} repetições
                </p>
              </Card>

              {/* Séries */}
              <div className="space-y-4 mb-6">
                {exerciseData[currentExercise.id]?.map((set, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-dark-100">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 bg-primary-600 text-white font-bold rounded-full flex-shrink-0">
                          {index + 1}
                        </div>

                        <div className="flex-1 grid grid-cols-2 gap-3">
                          <Input
                            label="Peso (kg)"
                            type="number"
                            step="0.5"
                            placeholder="0"
                            value={set.weight}
                            onChange={(e) =>
                              handleSetChange(index, 'weight', e.target.value)
                            }
                          />
                          <Input
                            label="Repetições"
                            type="number"
                            placeholder={currentExercise.reps.toString()}
                            value={set.reps}
                            onChange={(e) =>
                              handleSetChange(index, 'reps', e.target.value)
                            }
                          />
                        </div>

                        {set.weight && set.reps && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex-shrink-0"
                          >
                            <Check className="w-6 h-6 text-green-500" />
                          </motion.div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Botão de próximo */}
              <Button
                fullWidth
                onClick={handleNextExercise}
                disabled={!allSetsCompleted}
                loading={finishing}
                className="flex items-center justify-center gap-2"
              >
                {isLastExercise ? (
                  <>
                    <Check className="w-5 h-5" />
                    Finalizar Treino
                  </>
                ) : (
                  <>
                    Próximo Exercício
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Timer de descanso */}
      <AnimatePresence>
        {showTimer && (
          <Timer
            duration={120}
            onComplete={handleTimerComplete}
            onSkip={handleSkipRest}
          />
        )}
      </AnimatePresence>

      {/* Modal de confirmação de saída */}
      <Modal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        title="Sair do Treino?"
        size="sm"
      >
        <div className="text-center">
          <p className="text-dark-400 mb-6">
            Tem certeza que deseja sair? Todo o progresso será perdido.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setShowExitModal(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={confirmExit}
              className="bg-red-600 hover:bg-red-700"
            >
              Sair
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de sucesso */}
      <Modal
        isOpen={showSuccessModal}
        onClose={handleCloseSuccess}
        showCloseButton={false}
        size="md"
      >
        <div className="text-center">
          {/* Ícone de sucesso animado */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center"
          >
            <Trophy className="w-12 h-12 text-white" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-dark-800 mb-2"
          >
            Parabéns! 🎉
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-dark-400 mb-6"
          >
            Você completou seu treino com sucesso!
          </motion.p>

          {/* Estatísticas */}
          {workoutResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-6"
            >
              <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-700/30 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Flame className="w-6 h-6 text-orange-500" />
                  <span className="text-2xl font-bold text-orange-500">
                    {workoutResult.calories}
                  </span>
                  <span className="text-dark-400">kcal queimadas</span>
                </div>
              </div>

              {/* Conquistas desbloqueadas */}
              {workoutResult.newAchievements &&
                workoutResult.newAchievements.length > 0 && (
                  <div className="bg-gradient-to-br from-yellow-900/20 to-amber-900/20 border border-yellow-700/30 rounded-lg p-4">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Award className="w-5 h-5 text-yellow-500" />
                      <span className="font-bold text-dark-200">
                        Novas Conquistas!
                      </span>
                    </div>
                    <div className="space-y-2">
                      {workoutResult.newAchievements.map((achievement) => (
                        <div
                          key={achievement.id}
                          className="flex items-center gap-2 text-sm text-dark-300"
                        >
                          <Trophy className="w-4 h-4 text-yellow-500" />
                          <span className="font-medium">{achievement.name}</span>
                          <span className="text-yellow-500">
                            +{achievement.points} pts
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </motion.div>
          )}

          {/* Botões */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex gap-3"
          >
            <Button
              variant="outline"
              fullWidth
              onClick={() => navigate('/history')}
            >
              Ver Histórico
            </Button>
            <Button fullWidth onClick={handleCloseSuccess}>
              Ver Atividade
            </Button>
          </motion.div>
        </div>
      </Modal>
    </>
  );
};

export default WorkoutSession;
