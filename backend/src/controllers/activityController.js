import supabase from '../config/supabase.js';

// Buscar atividade diária do usuário (anéis de atividade)
export const getDailyActivity = async (req, res) => {
  try {
    const userId = req.userId;
    const today = new Date().toISOString().split('T')[0];

    // Buscar metas do usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('activity_goal_move, activity_goal_exercise, activity_goal_stand')
      .eq('user_id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      throw profileError;
    }

    // Metas padrão
    const goals = {
      move: profile?.activity_goal_move || 600, // calorias
      exercise: profile?.activity_goal_exercise || 30, // minutos
      stand: profile?.activity_goal_stand || 12 // horas (1 treino = 1 hora)
    };

    // Buscar treinos de hoje
    const { data: workouts, error: workoutsError } = await supabase
      .from('workout_history')
      .select('id, duration, exercises_data')
      .eq('user_id', userId)
      .gte('completed_at', `${today}T00:00:00`)
      .lte('completed_at', `${today}T23:59:59`);

    if (workoutsError) throw workoutsError;

    // Calcular atividade do dia
    let totalDuration = 0;
    let totalCalories = 0;
    let totalExercises = 0;

    workouts.forEach(workout => {
      totalDuration += workout.duration || 0;
      totalExercises += 1;

      // Estimar calorias (aproximado: 5 cal/min de treino)
      if (workout.duration) {
        totalCalories += Math.round((workout.duration / 60) * 5);
      }
    });

    // Calcular progresso
    const activity = {
      move: {
        current: totalCalories,
        goal: goals.move,
        percentage: Math.min((totalCalories / goals.move) * 100, 100)
      },
      exercise: {
        current: Math.floor(totalDuration / 60), // converter segundos em minutos
        goal: goals.exercise,
        percentage: Math.min((Math.floor(totalDuration / 60) / goals.exercise) * 100, 100)
      },
      stand: {
        current: totalExercises,
        goal: goals.stand,
        percentage: Math.min((totalExercises / goals.stand) * 100, 100)
      },
      workouts_today: workouts.length,
      date: today
    };

    res.json(activity);
  } catch (error) {
    console.error('Erro ao buscar atividade diária:', error);
    res.status(500).json({ error: 'Erro ao buscar atividade diária' });
  }
};

// Atualizar metas de atividade
export const updateActivityGoals = async (req, res) => {
  try {
    const userId = req.userId;
    const { move, exercise, stand } = req.body;

    // Validar valores
    if (move && (move < 0 || move > 2000)) {
      return res.status(400).json({ error: 'Meta de movimento inválida (0-2000)' });
    }
    if (exercise && (exercise < 0 || exercise > 120)) {
      return res.status(400).json({ error: 'Meta de exercício inválida (0-120 minutos)' });
    }
    if (stand && (stand < 0 || stand > 24)) {
      return res.status(400).json({ error: 'Meta de stand inválida (0-24 horas)' });
    }

    // Atualizar perfil
    const updates = {};
    if (move !== undefined) updates.activity_goal_move = move;
    if (exercise !== undefined) updates.activity_goal_exercise = exercise;
    if (stand !== undefined) updates.activity_goal_stand = stand;

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: 'Metas atualizadas com sucesso',
      goals: {
        move: data.activity_goal_move,
        exercise: data.activity_goal_exercise,
        stand: data.activity_goal_stand
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar metas:', error);
    res.status(500).json({ error: 'Erro ao atualizar metas de atividade' });
  }
};

// Buscar histórico de atividade (últimos N dias)
export const getActivityHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const days = parseInt(req.query.days) || 30;

    if (days < 1 || days > 365) {
      return res.status(400).json({ error: 'Dias deve estar entre 1 e 365' });
    }

    // Calcular data inicial
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    // Buscar treinos do período
    const { data: workouts, error } = await supabase
      .from('workout_history')
      .select('completed_at, duration, exercises_data')
      .eq('user_id', userId)
      .gte('completed_at', startDateStr)
      .order('completed_at', { ascending: true });

    if (error) throw error;

    // Buscar metas
    const { data: profile } = await supabase
      .from('profiles')
      .select('activity_goal_move, activity_goal_exercise, activity_goal_stand')
      .eq('user_id', userId)
      .single();

    const goals = {
      move: profile?.activity_goal_move || 600,
      exercise: profile?.activity_goal_exercise || 30,
      stand: profile?.activity_goal_stand || 12
    };

    // Agrupar por dia
    const dayMap = new Map();

    workouts.forEach(workout => {
      const date = workout.completed_at.split('T')[0];

      if (!dayMap.has(date)) {
        dayMap.set(date, {
          date,
          workouts: 0,
          duration: 0,
          calories: 0
        });
      }

      const day = dayMap.get(date);
      day.workouts += 1;
      day.duration += workout.duration || 0;
      day.calories += Math.round(((workout.duration || 0) / 60) * 5);
    });

    // Converter para array e adicionar metas atingidas
    const history = Array.from(dayMap.values()).map(day => ({
      ...day,
      goals_met: {
        move: day.calories >= goals.move,
        exercise: Math.floor(day.duration / 60) >= goals.exercise,
        stand: day.workouts >= goals.stand
      },
      all_goals_met:
        day.calories >= goals.move &&
        Math.floor(day.duration / 60) >= goals.exercise &&
        day.workouts >= goals.stand
    }));

    res.json(history);
  } catch (error) {
    console.error('Erro ao buscar histórico de atividade:', error);
    res.status(500).json({ error: 'Erro ao buscar histórico de atividade' });
  }
};
