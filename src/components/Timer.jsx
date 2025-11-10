import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, SkipForward } from 'lucide-react';
import Button from './Button';

/**
 * Componente de timer para descanso entre exercícios
 */
const Timer = ({ duration = 120, onComplete, onSkip }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    if (!isRunning || timeLeft === 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsRunning(false);
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, onComplete]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const percentage = ((duration - timeLeft) / duration) * 100;

  const handleSkip = () => {
    setIsRunning(false);
    onSkip?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-dark-50/95 backdrop-blur-sm"
    >
      <div className="card max-w-md w-full mx-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Clock className="w-6 h-6 text-primary-500" />
          <h2 className="text-2xl font-bold text-dark-800">Tempo de Descanso</h2>
        </div>

        {/* Timer circular */}
        <div className="relative w-64 h-64 mx-auto mb-8">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-dark-200"
            />
            {/* Progress circle */}
            <motion.circle
              cx="128"
              cy="128"
              r="120"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-primary-500"
              strokeDasharray={`${2 * Math.PI * 120}`}
              strokeDashoffset={`${2 * Math.PI * 120 * (1 - percentage / 100)}`}
              strokeLinecap="round"
              initial={{ strokeDashoffset: 2 * Math.PI * 120 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 120 * (1 - percentage / 100) }}
              transition={{ duration: 1, ease: 'linear' }}
            />
          </svg>

          {/* Timer display */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              key={timeLeft}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="text-6xl font-bold text-dark-800"
            >
              {formatTime(timeLeft)}
            </motion.div>
          </div>
        </div>

        {/* Skip button */}
        <Button
          variant="secondary"
          fullWidth
          onClick={handleSkip}
          className="flex items-center justify-center gap-2"
        >
          <SkipForward className="w-5 h-5" />
          Pular Descanso
        </Button>
      </div>
    </motion.div>
  );
};

export default Timer;
