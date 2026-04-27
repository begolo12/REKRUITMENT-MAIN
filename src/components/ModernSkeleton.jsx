import { motion } from 'framer-motion';

const SkeletonPulse = ({ className, delay = 0 }) => (
  <motion.div
    className={`skeleton-pulse ${className}`}
    initial={{ opacity: 0.5 }}
    animate={{ opacity: [0.5, 1, 0.5] }}
    transition={{ 
      duration: 1.5, 
      repeat: Infinity, 
      delay,
      ease: "easeInOut"
    }}
  />
);

export const ModernSkeletonDashboard = () => {
  return (
    <motion.div 
      className="skeleton-modern"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Stats Row */}
      <div className="skeleton-stats">
        {[1, 2, 3, 4, 5].map((i) => (
          <SkeletonPulse key={i} className="skeleton-stat" delay={i * 0.1} />
        ))}
      </div>
      
      {/* Chart Area */}
      <div className="skeleton-chart-row">
        <SkeletonPulse className="skeleton-chart" delay={0.3} />
        <SkeletonPulse className="skeleton-chart-small" delay={0.4} />
      </div>
      
      {/* Table */}
      <SkeletonPulse className="skeleton-table" delay={0.5} />
    </motion.div>
  );
};

export const ModernSkeletonList = () => {
  return (
    <motion.div 
      className="skeleton-modern"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <SkeletonPulse className="skeleton-header" />
      <div className="skeleton-list">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SkeletonPulse key={i} className="skeleton-row" delay={i * 0.08} />
        ))}
      </div>
    </motion.div>
  );
};

export const ModernSkeletonCard = () => {
  return (
    <motion.div 
      className="skeleton-modern"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="skeleton-cards">
        {[1, 2, 3].map((i) => (
          <SkeletonPulse key={i} className="skeleton-card" delay={i * 0.1} />
        ))}
      </div>
    </motion.div>
  );
};
