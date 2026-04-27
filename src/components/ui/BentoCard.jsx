import { motion } from 'framer-motion';
import { cardHover } from '../../utils/animations';

const variantStyles = {
  default: {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow)'
  },
  gradient: {
    background: 'linear-gradient(135deg, var(--primary-500) 0%, var(--primary-700) 100%)',
    border: 'none',
    boxShadow: 'var(--shadow-lg)',
    color: '#fff'
  },
  glass: {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: 'var(--shadow)'
  },
  interactive: {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow)',
    cursor: 'pointer'
  }
};

const sizeStyles = {
  sm: { padding: 'var(--space-4)', borderRadius: 'var(--radius-md)' },
  md: { padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)' },
  lg: { padding: 'var(--space-8)', borderRadius: 'var(--radius-xl)' }
};

export default function BentoCard({
  children,
  variant = 'default',
  size = 'md',
  title,
  subtitle,
  icon,
  onClick,
  className = '',
  animate = true,
  ...props
}) {
  const baseStyles = {
    ...variantStyles[variant],
    ...sizeStyles[size],
    transition: 'all var(--duration-normal) var(--ease-out)'
  };

  const Component = animate ? motion.div : 'div';
  const animationProps = animate ? {
    initial: "rest",
    whileHover: variant === 'interactive' || onClick ? "hover" : undefined,
    variants: cardHover
  } : {};

  return (
    <Component
      className={`bento-card ${className}`}
      style={baseStyles}
      onClick={onClick}
      {...animationProps}
      {...props}
    >
      {(title || icon) && (
        <div className="bento-card-header" style={{ marginBottom: 'var(--space-4)' }}>
          {icon && (
            <div 
              className="bento-card-icon" 
              style={{ 
                marginBottom: title ? 'var(--space-3)' : 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                background: variant === 'gradient' ? 'rgba(255,255,255,0.2)' : 'var(--primary-100)',
                color: variant === 'gradient' ? '#fff' : 'var(--primary-600)'
              }}
            >
              {icon}
            </div>
          )}
          {title && (
            <div>
              <h3 
                className="bento-card-title" 
                style={{ 
                  margin: 0, 
                  fontSize: '1.125rem', 
                  fontWeight: 700,
                  color: variant === 'gradient' ? '#fff' : 'var(--text)'
                }}
              >
                {title}
              </h3>
              {subtitle && (
                <p 
                  className="bento-card-subtitle" 
                  style={{ 
                    margin: 'var(--space-1) 0 0', 
                    fontSize: '0.875rem',
                    color: variant === 'gradient' ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)'
                  }}
                >
                  {subtitle}
                </p>
              )}
            </div>
          )}
        </div>
      )}
      <div className="bento-card-content">
        {children}
      </div>
    </Component>
  );
}

// Preset configurations untuk common use cases
export const BentoCardPresets = {
  Stat: ({ value, label, trend, trendUp, icon, ...props }) => (
    <BentoCard 
      variant="default" 
      icon={icon}
      {...props}
    >
      <div style={{ textAlign: 'center' }}>
        <div 
          style={{ 
            fontSize: '2.5rem', 
            fontWeight: 800, 
            color: 'var(--primary-700)',
            lineHeight: 1
          }}
        >
          {value}
        </div>
        <div style={{ 
          fontSize: '0.875rem', 
          color: 'var(--text-muted)', 
          marginTop: 'var(--space-2)',
          fontWeight: 500
        }}>
          {label}
        </div>
        {trend && (
          <div style={{ 
            fontSize: '0.75rem', 
            color: trendUp ? 'var(--success)' : 'var(--danger)',
            marginTop: 'var(--space-2)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px'
          }}>
            {trendUp ? '↑' : '↓'} {trend}
          </div>
        )}
      </div>
    </BentoCard>
  ),

  Action: ({ title, description, icon, onClick, ...props }) => (
    <BentoCard 
      variant="interactive" 
      title={title}
      subtitle={description}
      icon={icon}
      onClick={onClick}
      {...props}
    />
  ),

  Info: ({ title, children, ...props }) => (
    <BentoCard 
      variant="glass" 
      title={title}
      {...props}
    >
      {children}
    </BentoCard>
  ),

  Highlight: ({ title, children, ...props }) => (
    <BentoCard 
      variant="gradient" 
      title={title}
      {...props}
    >
      {children}
    </BentoCard>
  )
};
