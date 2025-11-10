import { supabase } from '../config/supabase.js';

/**
 * Cria um novo treino
 */
export const createWorkout = async (req, res) => {
  try {
    const { name, description, day_of_week } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Nome do treino é obrigatório' });
    }

    const { data: workout, error } = await supabase
      .from('workouts')
      .insert([
        {
          user_id: req.userId,
          name,
          description,
          day_of_week,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar treino:', error);
      return res.status(500).json({ error: 'Erro ao criar treino' });
    }

    return res.status(201).json({ workout });
  } catch (error) {
    console.error('Erro ao criar treino:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Lista todos os treinos do usuário
 */
export const getWorkouts = async (req, res) => {
  try {
    const { data: workouts, error } = await supabase
      .from('workouts')
      .select(`
        *,
        exercises (
          id,
          name,
          sets,
          reps,
          order_index
        )
      `)
      .eq('user_id', req.userId)
      .order('day_of_week', { ascending: true });

    if (error) {
      console.error('Erro ao buscar treinos:', error);
      return res.status(500).json({ error: 'Erro ao buscar treinos' });
    }

    return res.status(200).json({ workouts });
  } catch (error) {
    console.error('Erro ao buscar treinos:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Busca um treino específico por ID
 */
export const getWorkoutById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: workout, error } = await supabase
      .from('workouts')
      .select(`
        *,
        exercises (
          id,
          name,
          sets,
          reps,
          order_index
        )
      `)
      .eq('id', id)
      .eq('user_id', req.userId)
      .single();

    if (error || !workout) {
      return res.status(404).json({ error: 'Treino não encontrado' });
    }

    return res.status(200).json({ workout });
  } catch (error) {
    console.error('Erro ao buscar treino:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Atualiza um treino
 */
export const updateWorkout = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, day_of_week } = req.body;

    // Verifica se o treino pertence ao usuário
    const { data: existing } = await supabase
      .from('workouts')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.userId)
      .single();

    if (!existing) {
      return res.status(404).json({ error: 'Treino não encontrado' });
    }

    const { data: workout, error } = await supabase
      .from('workouts')
      .update({ name, description, day_of_week })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar treino:', error);
      return res.status(500).json({ error: 'Erro ao atualizar treino' });
    }

    return res.status(200).json({ workout });
  } catch (error) {
    console.error('Erro ao atualizar treino:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Remove um treino
 */
export const deleteWorkout = async (req, res) => {
  try {
    const { id } = req.params;

    // Verifica se o treino pertence ao usuário
    const { data: existing } = await supabase
      .from('workouts')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.userId)
      .single();

    if (!existing) {
      return res.status(404).json({ error: 'Treino não encontrado' });
    }

    const { error } = await supabase.from('workouts').delete().eq('id', id);

    if (error) {
      console.error('Erro ao deletar treino:', error);
      return res.status(500).json({ error: 'Erro ao deletar treino' });
    }

    return res.status(200).json({ message: 'Treino deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar treino:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Busca o treino do dia atual
 */
export const getTodayWorkout = async (req, res) => {
  try {
    // Pega o dia da semana atual (0 = domingo, 6 = sábado)
    const today = new Date().getDay();

    const { data: workout, error } = await supabase
      .from('workouts')
      .select(`
        *,
        exercises (
          id,
          name,
          sets,
          reps,
          order_index
        )
      `)
      .eq('user_id', req.userId)
      .eq('day_of_week', today)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = nenhum resultado encontrado
      console.error('Erro ao buscar treino do dia:', error);
      return res.status(500).json({ error: 'Erro ao buscar treino do dia' });
    }

    if (!workout) {
      return res.status(200).json({ workout: null, message: 'Nenhum treino para hoje' });
    }

    return res.status(200).json({ workout });
  } catch (error) {
    console.error('Erro ao buscar treino do dia:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
