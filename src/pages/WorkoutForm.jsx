import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { ArrowLeft, Plus, Trash2, GripVertical } from 'lucide-react';
import { workoutService, exerciseService } from '../services/api';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda' },
  { value: 2, label: 'Terça' },
  { value: 3, label: 'Quarta' },
  { value: 4, label: 'Quinta' },
  { value: 5, label: 'Sexta' },
  { value: 6, label: 'Sábado' },
  { value: null, label: 'Sem dia definido' },
];

/**
 * Página de criação/edição de treino com drag and drop
 */
const WorkoutForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id && id !== 'new');

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      loadWorkout();
    }
  }, [id]);

  const loadWorkout = async () => {
    try {
      const response = await workoutService.getById(id);
      const workout = response.data.workout;

      setName(workout.name);
      setDescription(workout.description || '');
      setDayOfWeek(workout.day_of_week);
      setExercises(
        workout.exercises?.sort((a, b) => a.order_index - b.order_index) || []
      );
    } catch (error) {
      console.error('Erro ao carregar treino:', error);
      setError('Erro ao carregar treino');
    }
  };

  const handleAddExercise = () => {
    setExercises([
      ...exercises,
      {
        id: `temp-${Date.now()}`,
        name: '',
        sets: 3,
        reps: 12,
        order_index: exercises.length,
        isNew: true,
      },
    ]);
  };

  const handleRemoveExercise = (index) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleExerciseChange = (index, field, value) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    setExercises(updated);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(exercises);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Atualiza os order_index
    const updatedItems = items.map((item, index) => ({
      ...item,
      order_index: index,
    }));

    setExercises(updatedItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Salva o treino
      let workoutId = id;

      if (isEdit) {
        await workoutService.update(id, {
          name,
          description,
          day_of_week: dayOfWeek,
        });
      } else {
        const response = await workoutService.create({
          name,
          description,
          day_of_week: dayOfWeek,
        });
        workoutId = response.data.workout.id;
      }

      // Salva os exercícios
      for (const [index, exercise] of exercises.entries()) {
        const exerciseData = {
          workout_id: workoutId,
          name: exercise.name,
          sets: parseInt(exercise.sets),
          reps: parseInt(exercise.reps),
          order_index: index,
        };

        if (exercise.isNew) {
          await exerciseService.create(exerciseData);
        } else {
          await exerciseService.update(exercise.id, exerciseData);
        }
      }

      navigate('/workouts');
    } catch (error) {
      console.error('Erro ao salvar treino:', error);
      setError(error.response?.data?.error || 'Erro ao salvar treino');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-dark-50">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate('/workouts')}
            className="p-2 hover:bg-dark-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-dark-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-dark-800">
              {isEdit ? 'Editar Treino' : 'Novo Treino'}
            </h1>
            <p className="text-dark-500">Configure seu treino e exercícios</p>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados do treino */}
          <Card>
            <h2 className="text-xl font-bold text-dark-800 mb-4">
              Informações do Treino
            </h2>

            <div className="space-y-4">
              <Input
                label="Nome do Treino"
                placeholder="Ex: Peito e Tríceps"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <div className="input-group">
                <label className="label">Descrição (opcional)</label>
                <textarea
                  placeholder="Ex: Foco em hipertrofia"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full min-h-[80px]"
                />
              </div>

              <div className="input-group">
                <label className="label">Dia da Semana</label>
                <select
                  value={dayOfWeek === null ? 'null' : dayOfWeek}
                  onChange={(e) =>
                    setDayOfWeek(
                      e.target.value === 'null' ? null : parseInt(e.target.value)
                    )
                  }
                  className="w-full"
                >
                  {DAYS_OF_WEEK.map((day) => (
                    <option
                      key={day.value === null ? 'null' : day.value}
                      value={day.value === null ? 'null' : day.value}
                    >
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Exercícios com Drag and Drop */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-dark-800">Exercícios</h2>
                <p className="text-sm text-dark-500 mt-1">
                  Arraste para reordenar
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddExercise}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </Button>
            </div>

            {exercises.length === 0 ? (
              <p className="text-center text-dark-500 py-8">
                Nenhum exercício adicionado. Clique em "Adicionar" para começar.
              </p>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="exercises">
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-3"
                    >
                      <AnimatePresence>
                        {exercises.map((exercise, index) => (
                          <Draggable
                            key={exercise.id}
                            draggableId={exercise.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <motion.div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className={`p-4 rounded-lg border-2 transition-all ${
                                  snapshot.isDragging
                                    ? 'bg-dark-200 border-primary-500 shadow-lg'
                                    : 'bg-dark-50 border-dark-200'
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <div
                                    {...provided.dragHandleProps}
                                    className="mt-2 cursor-grab active:cursor-grabbing"
                                  >
                                    <GripVertical className="w-5 h-5 text-dark-400" />
                                  </div>

                                  <div className="flex-1 space-y-3">
                                    <Input
                                      placeholder="Nome do exercício"
                                      value={exercise.name}
                                      onChange={(e) =>
                                        handleExerciseChange(
                                          index,
                                          'name',
                                          e.target.value
                                        )
                                      }
                                      required
                                    />

                                    <div className="grid grid-cols-2 gap-3">
                                      <Input
                                        label="Séries"
                                        type="number"
                                        min="1"
                                        value={exercise.sets}
                                        onChange={(e) =>
                                          handleExerciseChange(
                                            index,
                                            'sets',
                                            e.target.value
                                          )
                                        }
                                        required
                                      />
                                      <Input
                                        label="Repetições"
                                        type="number"
                                        min="1"
                                        value={exercise.reps}
                                        onChange={(e) =>
                                          handleExerciseChange(
                                            index,
                                            'reps',
                                            e.target.value
                                          )
                                        }
                                        required
                                      />
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleRemoveExercise(index)}
                                    className="p-2 hover:bg-red-100 rounded-lg transition-colors flex-shrink-0"
                                  >
                                    <Trash2 className="w-5 h-5 text-red-600" />
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </Draggable>
                        ))}
                      </AnimatePresence>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </Card>

          {/* Botões de ação */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/workouts')}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" loading={loading} className="flex-1">
              {isEdit ? 'Salvar Alterações' : 'Criar Treino'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkoutForm;
