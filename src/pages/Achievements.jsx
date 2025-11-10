import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Trophy, Star, Target, Zap, Lock } from 'lucide-react';
import AchievementBadge from '../components/AchievementBadge';
import Card from '../components/Card';
import BottomNav from '../components/BottomNav';
import { achievementsService } from '../services/api';

/**
 * Página de Conquistas
 */
const Achievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const response = await achievementsService.getProgress();
      setAchievements(response.data.achievements || []);
      setStats(response.data.stats || {});
    } catch (error) {
      console.error('Erro ao carregar conquistas:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', name: 'Todas', icon: Award },
    { id: 'workout', name: 'Treinos', icon: Target },
    { id: 'streak', name: 'Sequência', icon: Zap },
    { id: 'calories', name: 'Calorias', icon: Star },
    { id: 'weight', name: 'Peso', icon: Trophy },
  ];

  // Filtrar conquistas por categoria
  const filteredAchievements =
    selectedCategory === 'all'
      ? achievements
      : achievements.filter((a) => a.category === selectedCategory);

  // Calcular estatísticas de conquistas
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalPoints = achievements
    .filter((a) => a.unlocked)
    .reduce((sum, a) => sum + (a.points || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-dark-50">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dark-800 mb-2">Conquistas</h1>
          <p className="text-dark-500">Complete desafios e desbloqueie badges</p>
        </div>

        {/* Resumo de Conquistas */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="text-center">
              <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-dark-800">
                {unlockedCount}/{achievements.length}
              </p>
              <p className="text-xs text-dark-500">Desbloqueadas</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="text-center">
              <Star className="w-8 h-8 text-primary-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-dark-800">{totalPoints}</p>
              <p className="text-xs text-dark-500">Pontos</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="text-center">
              <Zap className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-dark-800">
                {Math.round((unlockedCount / achievements.length) * 100) || 0}%
              </p>
              <p className="text-xs text-dark-500">Progresso</p>
            </Card>
          </motion.div>
        </div>

        {/* Filtros de Categoria */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
                  whitespace-nowrap transition-all
                  ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-dark-200 text-dark-700 hover:bg-dark-300 border border-dark-300'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {category.name}
              </button>
            );
          })}
        </div>

        {/* Grid de Conquistas */}
        {filteredAchievements.length === 0 ? (
          <Card className="text-center py-12">
            <Lock className="w-16 h-16 text-dark-400 mx-auto mb-4" />
            <p className="text-dark-500">Nenhuma conquista nesta categoria</p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredAchievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex justify-center mb-3">
                    <AchievementBadge
                      achievement={achievement}
                      unlocked={achievement.unlocked}
                      progress={achievement.progress}
                      percentage={achievement.percentage}
                      showProgress={!achievement.unlocked}
                      size="lg"
                    />
                  </div>

                  <h3 className="font-bold text-dark-800 mb-1">
                    {achievement.name}
                  </h3>
                  <p className="text-xs text-dark-500 mb-2">
                    {achievement.description}
                  </p>

                  {/* Progresso ou Data de Desbloqueio */}
                  {achievement.unlocked ? (
                    <div className="mt-3 pt-3 border-t border-dark-200">
                      <p className="text-xs text-green-600 font-medium">
                        Desbloqueada!
                      </p>
                      {achievement.unlocked_at && (
                        <p className="text-xs text-dark-400">
                          {new Date(achievement.unlocked_at).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="mt-3 pt-3 border-t border-dark-200">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-dark-600">Progresso</span>
                        <span className="text-dark-600 font-medium">
                          {Math.round(achievement.percentage)}%
                        </span>
                      </div>
                      <div className="w-full bg-dark-200 rounded-full h-2 overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-primary-500 to-primary-600"
                          initial={{ width: 0 }}
                          animate={{ width: `${achievement.percentage}%` }}
                          transition={{ duration: 0.8, delay: index * 0.05 }}
                        />
                      </div>
                      <p className="text-xs text-dark-500 mt-1">
                        {achievement.progress}/{achievement.requirement_value}{' '}
                        {achievement.category === 'workout' && 'treinos'}
                        {achievement.category === 'streak' && 'dias'}
                        {achievement.category === 'calories' && 'kcal'}
                        {achievement.category === 'weight' && 'kg'}
                      </p>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Motivação */}
        {unlockedCount < achievements.length && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <Card className="bg-gradient-to-br from-primary-600 to-primary-700 text-white text-center py-8">
              <Trophy className="w-16 h-16 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Continue Treinando!</h2>
              <p className="text-primary-100">
                Você está a {achievements.length - unlockedCount} conquistas de
                completar todas!
              </p>
            </Card>
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Achievements;
