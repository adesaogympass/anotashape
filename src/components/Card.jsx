import { motion } from 'framer-motion';

/**
 * Componente de card reutilizável
 */
const Card = ({ children, className = '', animate = true, ...props }) => {
  const baseClasses = 'bg-dark-100 rounded-xl p-6 shadow-lg border border-dark-200';

  const Component = animate ? motion.div : 'div';

  const animationProps = animate
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        transition: { duration: 0.3 },
      }
    : {};

  return (
    <Component className={`${baseClasses} ${className}`} {...animationProps} {...props}>
      {children}
    </Component>
  );
};

export default Card;
