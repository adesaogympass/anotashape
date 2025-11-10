import { supabase } from '../config/supabase.js';

/**
 * Cria um novo exercício em um treino
 */
export const createExercise = async (req, res) => {
  try {
    const { workout_id, name, sets, reps, order_index } = req.body;

    if (!workout_id || !name || !sets || !reps) {
      return res.status(400).json({
        error: 'workout_id, nome, séries e repetições são obrigatórios',
      });
    }

    // Verifica se o treino pertence ao usuário
    const { data: workout } = await supabase
      .from('workouts')
      .select('id')
      .eq('id', workout_id)
      .eq('user_id', req.userId)
      .single();

    if (!workout) {
      return res.status(404).json({ error: 'Treino não encontrado' });
    }

    const { data: exercise, error } = await supabase
      .from('exercises')
      .insert([
        {
          workout_id,
          name,
          sets,
          reps,
          order_index: order_index || 0,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar exercício:', error);
      return res.status(500).json({ error: 'Erro ao criar exercício' });
    }

    return res.status(201).json({ exercise });
  } catch (error) {
    console.error('Erro ao criar exercício:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Lista todos os exercícios de um treino
 */
export const getExercisesByWorkout = async (req, res) => {
  try {
    const { workoutId } = req.params;

    // Verifica se o treino pertence ao usuário
    const { data: workout } = await supabase
      .from('workouts')
      .select('id')
      .eq('id', workoutId)
      .eq('user_id', req.userId)
      .single();

    if (!workout) {
      return res.status(404).json({ error: 'Treino não encontrado' });
    }

    const { data: exercises, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('workout_id', workoutId)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Erro ao buscar exercícios:', error);
      return res.status(500).json({ error: 'Erro ao buscar exercícios' });
    }

    return res.status(200).json({ exercises });
  } catch (error) {
    console.error('Erro ao buscar exercícios:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Atualiza um exercício
 */
export const updateExercise = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sets, reps, order_index } = req.body;

    // Verifica se o exercício pertence ao usuário
    const { data: existing } = await supabase
      .from('exercises')
      .select('workout_id')
      .eq('id', id)
      .single();

    if (!existing) {
      return res.status(404).json({ error: 'Exercício não encontrado' });
    }

    const { data: workout } = await supabase
      .from('workouts')
      .select('id')
      .eq('id', existing.workout_id)
      .eq('user_id', req.userId)
      .single();

    if (!workout) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const { data: exercise, error } = await supabase
      .from('exercises')
      .update({ name, sets, reps, order_index })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar exercício:', error);
      return res.status(500).json({ error: 'Erro ao atualizar exercício' });
    }

    return res.status(200).json({ exercise });
  } catch (error) {
    console.error('Erro ao atualizar exercício:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Remove um exercício
 */
export const deleteExercise = async (req, res) => {
  try {
    const { id } = req.params;

    // Verifica se o exercício pertence ao usuário
    const { data: existing } = await supabase
      .from('exercises')
      .select('workout_id')
      .eq('id', id)
      .single();

    if (!existing) {
      return res.status(404).json({ error: 'Exercício não encontrado' });
    }

    const { data: workout } = await supabase
      .from('workouts')
      .select('id')
      .eq('id', existing.workout_id)
      .eq('user_id', req.userId)
      .single();

    if (!workout) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const { error } = await supabase.from('exercises').delete().eq('id', id);

    if (error) {
      console.error('Erro ao deletar exercício:', error);
      return res.status(500).json({ error: 'Erro ao deletar exercício' });
    }

    return res.status(200).json({ message: 'Exercício deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar exercício:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
