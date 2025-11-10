import { supabase } from '../config/supabase.js';

/**
 * Registra um novo histórico de treino (sessão completa)
 */
export const createWorkoutHistory = async (req, res) => {
  try {
    const { workout_id, exercises } = req.body;

    if (!workout_id || !exercises || !Array.isArray(exercises)) {
      return res.status(400).json({
        error: 'workout_id e exercises (array) são obrigatórios',
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

    // Cria o registro de histórico do treino
    const { data: history, error: historyError } = await supabase
      .from('workout_history')
      .insert([
        {
          user_id: req.userId,
          workout_id,
          completed_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (historyError) {
      console.error('Erro ao criar histórico:', historyError);
      return res.status(500).json({ error: 'Erro ao criar histórico' });
    }

    // Cria os registros de exercícios executados
    const exerciseLogs = exercises.map((ex) => ({
      workout_history_id: history.id,
      exercise_id: ex.exercise_id,
      sets_data: ex.sets_data, // Array com { set: 1, weight: 50, reps: 12 }
    }));

    const { data: logs, error: logsError } = await supabase
      .from('exercise_logs')
      .insert(exerciseLogs)
      .select();

    if (logsError) {
      console.error('Erro ao criar logs de exercícios:', logsError);
      return res.status(500).json({ error: 'Erro ao criar logs' });
    }

    return res.status(201).json({
      history,
      logs,
    });
  } catch (error) {
    console.error('Erro ao criar histórico:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Lista o histórico de treinos do usuário
 */
export const getWorkoutHistory = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const { data: history, error } = await supabase
      .from('workout_history')
      .select(`
        *,
        workouts (
          id,
          name
        ),
        exercise_logs (
          id,
          sets_data,
          exercises (
            id,
            name
          )
        )
      `)
      .eq('user_id', req.userId)
      .order('completed_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Erro ao buscar histórico:', error);
      return res.status(500).json({ error: 'Erro ao buscar histórico' });
    }

    return res.status(200).json({ history });
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Busca o histórico de um exercício específico
 */
export const getExerciseHistory = async (req, res) => {
  try {
    const { exerciseId } = req.params;
    const { limit = 20 } = req.query;

    // Verifica se o exercício pertence a um treino do usuário
    const { data: exercise } = await supabase
      .from('exercises')
      .select('workout_id')
      .eq('id', exerciseId)
      .single();

    if (!exercise) {
      return res.status(404).json({ error: 'Exercício não encontrado' });
    }

    const { data: workout } = await supabase
      .from('workouts')
      .select('id')
      .eq('id', exercise.workout_id)
      .eq('user_id', req.userId)
      .single();

    if (!workout) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    // Busca o histórico do exercício
    const { data: logs, error } = await supabase
      .from('exercise_logs')
      .select(`
        *,
        workout_history (
          completed_at
        )
      `)
      .eq('exercise_id', exerciseId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Erro ao buscar histórico do exercício:', error);
      return res.status(500).json({ error: 'Erro ao buscar histórico' });
    }

    return res.status(200).json({ logs });
  } catch (error) {
    console.error('Erro ao buscar histórico do exercício:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Busca estatísticas e evolução do usuário
 */
export const getStats = async (req, res) => {
  try {
    // Total de treinos completados
    const { count: totalWorkouts, error: workoutsError } = await supabase
      .from('workout_history')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.userId);

    if (workoutsError) {
      console.error('Erro ao buscar estatísticas:', workoutsError);
      return res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }

    // Treinos nos últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: recentWorkouts, error: recentError } = await supabase
      .from('workout_history')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.userId)
      .gte('completed_at', thirtyDaysAgo.toISOString());

    if (recentError) {
      console.error('Erro ao buscar treinos recentes:', recentError);
      return res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }

    return res.status(200).json({
      stats: {
        totalWorkouts: totalWorkouts || 0,
        last30Days: recentWorkouts || 0,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
