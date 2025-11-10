import supabase from '../config/supabase.js';

// Buscar todas as conquistas disponíveis
export const getAllAchievements = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('category', { ascending: true })
      .order('required_count', { ascending: true });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar conquistas:', error);
    res.status(500).json({ error: 'Erro ao buscar conquistas' });
  }
};

// Buscar conquistas do usuário (já desbloqueadas)
export const getUserAchievements = async (req, res) => {
  try {
    const userId = req.userId;

    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievement:achievements(*)
      `)
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar conquistas do usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar conquistas do usuário' });
  }
};

// Buscar progresso de todas as conquistas para o usuário
export const getAchievementsProgress = async (req, res) => {
  try {
    const userId = req.userId;

    // Buscar todas as conquistas
    const { data: allAchievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('*')
      .order('category', { ascending: true });

    if (achievementsError) throw achievementsError;

    // Buscar conquistas já desbloqueadas
    const { data: unlockedAchievements, error: unlockedError } = await supabase
      .from('user_achievements')
      .select('achievement_id, unlocked_at')
      .eq('user_id', userId);

    if (unlockedError) throw unlockedError;

    // Buscar estatísticas do usuário para calcular progresso
    const { data: stats, error: statsError } = await supabase
      .rpc('get_user_stats', { user_id_param: userId });

    if (statsError) {
      console.error('Erro ao buscar stats:', statsError);
      // Se a função não existir, retornar dados básicos
      const { count: workoutsCount } = await supabase
        .from('workout_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      const progress = allAchievements.map(achievement => {
        const unlocked = unlockedAchievements.find(
          ua => ua.achievement_id === achievement.id
        );

        let currentCount = 0;

        // Calcular progresso baseado na categoria
        if (achievement.category === 'workouts_completed') {
          currentCount = workoutsCount || 0;
        }

        return {
          ...achievement,
          unlocked: !!unlocked,
          unlocked_at: unlocked?.unlocked_at || null,
          progress: Math.min(currentCount, achievement.required_count),
          percentage: Math.min((currentCount / achievement.required_count) * 100, 100)
        };
      });

      return res.json(progress);
    }

    // Mapear progresso com base nas estatísticas
    const unlockedMap = new Map(
      unlockedAchievements.map(ua => [ua.achievement_id, ua.unlocked_at])
    );

    const progress = allAchievements.map(achievement => {
      const unlocked = unlockedMap.has(achievement.id);
      let currentCount = 0;

      // Determinar contagem atual baseado na categoria
      switch (achievement.category) {
        case 'workouts_completed':
          currentCount = stats.total_workouts || 0;
          break;
        case 'exercises_completed':
          currentCount = stats.total_exercises || 0;
          break;
        case 'streak':
          currentCount = stats.current_streak || 0;
          break;
        case 'weight_lifted':
          currentCount = stats.total_weight || 0;
          break;
        default:
          currentCount = 0;
      }

      return {
        ...achievement,
        unlocked,
        unlocked_at: unlockedMap.get(achievement.id) || null,
        progress: Math.min(currentCount, achievement.required_count),
        percentage: Math.min((currentCount / achievement.required_count) * 100, 100)
      };
    });

    res.json(progress);
  } catch (error) {
    console.error('Erro ao buscar progresso de conquistas:', error);
    res.status(500).json({ error: 'Erro ao buscar progresso de conquistas' });
  }
};
