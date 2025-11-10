import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';

/**
 * Componente de badge de conquista
 *
 * @param {Object} props
 * @param {Object} props.achievement - Dados da conquista
 * @param {boolean} props.unlocked - Se está desbloqueada
 * @param {number} props.progress - Progresso atual
 * @param {number} props.percentage - Porcentagem de progresso
 * @param {function} props.onClick - Callback ao clicar
 * @param {boolean} props.showProgress - Se mostra barra de progresso
 * @param {string} props.size - Tamanho: 'sm', 'md', 'lg'
 */
const AchievementBadge = ({
  achievement,
  unlocked = false,
  progress = 0,
  percentage = 0,
  onClick,
  showProgress = true,
  size = 'md',
}) => {
  const Icon = Icons[achievement.icon] || Icons.Award;

  const sizes = {
    sm: 'w-12 h-12 text-xl',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-20 h-20 text-3xl',
  };

  const iconSize = sizes[size] || sizes.md;

  // Cores por categoria
  const categoryColors = {
    streak: 'from-orange-500 to-red-500',
    workout: 'from-blue-500 to-indigo-500',
    weight: 'from-purple-500 to-pink-500',
    calories: 'from-yellow-500 to-orange-500',
  };

  const gradient =
    categoryColors[achievement.category] || 'from-gray-500 to-gray-600';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        relative cursor-pointer
        ${unlocked ? '' : 'opacity-40 grayscale'}
      `}
    >
      {/* Badge circular */}
      <div
        className={`
          ${iconSize}
          rounded-full
          bg-gradient-to-br ${gradient}
          flex items-center justify-center
          shadow-lg
          relative
          ${unlocked ? 'ring-2 ring-white/20' : ''}
        `}
      >
        <Icon className="w-1/2 h-1/2 text-white" />

        {/* Efeito de brilho quando desbloqueada */}
        {unlocked && (
          <motion.div
            className="absolute inset-0 rounded-full bg-white"
            initial={{ opacity: 0.5, scale: 0.8 }}
            animate={{ opacity: 0, scale: 1.5 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              repeatDelay: 2,
            }}
          />
        )}

        {/* Pontos */}
        {unlocked && (
          <div className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {achievement.points}
          </div>
        )}
      </div>

      {/* Barra de progresso */}
      {!unlocked && showProgress && (
        <div className="mt-2 w-full bg-dark-200 rounded-full h-1 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary-500 to-primary-600"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      )}

      {/* Texto de progresso */}
      {!unlocked && showProgress && (
        <div className="mt-1 text-xs text-center text-dark-500">
          {progress}/{achievement.requirement_value}
        </div>
      )}
    </motion.div>
  );
};

export default AchievementBadge;
