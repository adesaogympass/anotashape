import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dumbbell, Activity, Award, TrendingUp, Settings } from 'lucide-react';

/**
 * Barra de navegação inferior fixa
 */
const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    { path: '/activity', icon: Activity, label: 'Atividade' },
    { path: '/workouts', icon: Dumbbell, label: 'Treinos' },
    { path: '/achievements', icon: Award, label: 'Conquistas' },
    { path: '/evolution', icon: TrendingUp, label: 'Evolução' },
    { path: '/settings', icon: Settings, label: 'Config' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-dark-100 border-t border-dark-200 safe-bottom z-40">
      <div className="max-w-md mx-auto px-4">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative flex flex-col items-center justify-center flex-1 h-full group"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={`flex flex-col items-center justify-center transition-colors ${
                    isActive ? 'text-primary-500' : 'text-dark-500 group-hover:text-dark-700'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs mt-1 font-medium">{item.label}</span>
                </motion.div>

                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary-500 rounded-b-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
