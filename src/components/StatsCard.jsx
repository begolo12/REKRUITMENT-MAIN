import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StatsCard({ 
  title, 
  value, 
  icon, 
  color = 'primary', 
  trend = null,
  trendValue = null,
  delay = 0 
}) {
  const colors = {
    primary: { bg: 'linear-gradient(135deg, #6366f1, #818cf8)', shadow: 'rgba(99, 102, 241, 0.3)' },
    success: { bg: 'linear-gradient(135deg, #10b981, #34d399)', shadow: 'rgba(16, 185, 129, 0.3)' },
    warning: { bg: 'linear-gradient(135deg, #f59e0b, #fbbf24)', shadow: 'rgba(245, 158, 11, 0.3)' },
    danger: { bg: 'linear-gradient(135deg, #ef4444, #f87171)', shadow: 'rgba(239, 68, 68, 0.3)' },
    info: { bg: 'linear-gradient(135deg, #06b6d4, #22d3ee)', shadow: 'rgba(6, 182, 212, 0.3)' },
  };

  const theme = colors[color] || colors.primary;

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp size={14} />;
    if (trend === 'down') return <TrendingDown size={14} />;
    return <Minus size={14} />;
  };

  const getTrendColor = () => {
    if (trend === 'up') return '#10b981';
    if (trend === 'down') return '#ef4444';
    return '#94a3b8';
  };

  return (
    <motion.div
      className="stats-card"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      whileHover={{ 
        y: -5, 
        boxShadow: `0 20px 40px ${theme.shadow}`,
        transition: { duration: 0.2 }
      }}
    >
      <div className="stats-card-header">
        <motion.div 
          className="stats-card-icon"
          style={{ background: theme.bg }}
          whileHover={{ rotate: 10, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          {icon}
        </motion.div>
        {trend && (
          <motion.div 
            className="stats-trend"
            style={{ color: getTrendColor() }}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + 0.3 }}
          >
            {getTrendIcon()}
            <span>{trendValue}</span>
          </motion.div>
        )}
      </div>
      
      <motion.div 
        className="stats-card-value"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          duration: 0.5, 
          delay: delay + 0.1,
          type: "spring",
          stiffness: 200
        }}
      >
        {value}
      </motion.div>
      
      <motion.div 
        className="stats-card-title"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.2 }}
      >
        {title}
      </motion.div>
      
      <motion.div 
        className="stats-card-progress"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: delay + 0.3 }}
        style={{ originX: 0 }}
      >
        <div className="stats-card-progress-bar" style={{ background: theme.bg }} />
      </motion.div>
    </motion.div>
  );
}
