import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * Componente de anéis de atividade estilo Apple Fitness
 *
 * @param {Object} props
 * @param {number} props.calories - Calorias queimadas hoje
 * @param {number} props.caloriesGoal - Meta de calorias
 * @param {number} props.workouts - Treinos completados hoje
 * @param {number} props.workoutsGoal - Meta de treinos
 * @param {number} props.streak - Dias de sequência atual
 * @param {number} props.streakGoal - Meta de streak
 * @param {string} props.size - Tamanho: 'sm', 'md', 'lg'
 */
const ActivityRings = ({
  calories = 0,
  caloriesGoal = 500,
  workouts = 0,
  workoutsGoal = 1,
  streak = 0,
  streakGoal = 7,
  size = 'md',
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Delay para animação de entrada
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Configurações de tamanho
  const sizes = {
    sm: {
      width: 120,
      height: 120,
      strokeWidth: 8,
      radius: 40,
    },
    md: {
      width: 200,
      height: 200,
      strokeWidth: 12,
      radius: 70,
    },
    lg: {
      width: 280,
      height: 280,
      strokeWidth: 16,
      radius: 100,
    },
  };

  const config = sizes[size] || sizes.md;
  const { width, height, strokeWidth, radius } = config;

  // Calcular porcentagens
  const caloriesPercent = Math.min((calories / caloriesGoal) * 100, 100);
  const workoutsPercent = Math.min((workouts / workoutsGoal) * 100, 100);
  const streakPercent = Math.min((streak / streakGoal) * 100, 100);

  // Calcular circunferência
  const getCircumference = (r) => 2 * Math.PI * r;

  // Configuração dos anéis (de fora para dentro)
  const rings = [
    {
      color: '#FF3B30', // Vermelho (Calorias)
      radius: radius,
      percent: caloriesPercent,
      value: calories,
      goal: caloriesGoal,
      label: 'Calorias',
    },
    {
      color: '#30D158', // Verde (Treinos)
      radius: radius - strokeWidth - 4,
      percent: workoutsPercent,
      value: workouts,
      goal: workoutsGoal,
      label: 'Treinos',
    },
    {
      color: '#0A84FF', // Azul (Streak)
      radius: radius - (strokeWidth + 4) * 2,
      percent: streakPercent,
      value: streak,
      goal: streakGoal,
      label: 'Sequência',
    },
  ];

  return (
    <div className="relative flex items-center justify-center">
      <svg width={width} height={height} className="transform -rotate-90">
        {rings.map((ring, index) => {
          const circumference = getCircumference(ring.radius);
          const strokeDashoffset =
            circumference - (ring.percent / 100) * circumference;

          return (
            <g key={index}>
              {/* Anel de fundo (cinza escuro mais visível) */}
              <circle
                cx={width / 2}
                cy={height / 2}
                r={ring.radius}
                fill="none"
                stroke="rgba(63, 63, 70, 0.3)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />

              {/* Anel de progresso (colorido) */}
              <motion.circle
                cx={width / 2}
                cy={height / 2}
                r={ring.radius}
                fill="none"
                stroke={ring.color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{
                  strokeDashoffset: mounted ? strokeDashoffset : circumference,
                }}
                transition={{
                  duration: 1.5,
                  delay: index * 0.2,
                  ease: 'easeOut',
                }}
                style={{
                  filter: ring.percent >= 100 ? `drop-shadow(0 0 8px ${ring.color})` : 'none',
                }}
              />
            </g>
          );
        })}
      </svg>

      {/* Centro com informações */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="text-3xl font-bold text-dark-800">{calories}</div>
          <div className="text-xs text-dark-500 uppercase tracking-wide">
            Calorias
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ActivityRings;
