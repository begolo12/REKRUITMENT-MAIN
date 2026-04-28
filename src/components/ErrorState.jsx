import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  RefreshCw, 
  Mail, 
  AlertCircle, 
  WifiOff, 
  ServerCrash, 
  Info,
  ShieldAlert
} from 'lucide-react';
import { useIsMobile } from '../hooks/useIsMobile';

/**
 * Variant configurations for different error types
 * Each variant has specific icon, colors, and default title
 */
const VARIANTS = {
  error: {
    icon: AlertCircle,
    defaultTitle: 'Terjadi Kesalahan',
    iconColor: '#dc2626',
    bgGradient: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
    borderColor: '#fecaca',
    shadowColor: 'rgba(239, 68, 68, 0.3)'
  },
  warning: {
    icon: AlertTriangle,
    defaultTitle: 'Perhatian',
    iconColor: '#d97706',
    bgGradient: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    borderColor: '#fde68a',
    shadowColor: 'rgba(245, 158, 11, 0.3)'
  },
  network: {
    icon: WifiOff,
    defaultTitle: 'Koneksi Terputus',
    iconColor: '#7c3aed',
    bgGradient: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
    borderColor: '#ddd6fe',
    shadowColor: 'rgba(124, 58, 237, 0.3)'
  },
  server: {
    icon: ServerCrash,
    defaultTitle: 'Server Error',
    iconColor: '#dc2626',
    bgGradient: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
    borderColor: '#fecaca',
    shadowColor: 'rgba(239, 68, 68, 0.3)'
  },
  info: {
    icon: Info,
    defaultTitle: 'Informasi',
    iconColor: '#0284c7',
    bgGradient: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
    borderColor: '#bae6fd',
    shadowColor: 'rgba(14, 165, 233, 0.3)'
  },
  auth: {
    icon: ShieldAlert,
    defaultTitle: 'Akses Ditolak',
    iconColor: '#be123c',
    bgGradient: 'linear-gradient(135deg, #ffe4e6 0%, #fecdd3 100%)',
    borderColor: '#fecdd3',
    shadowColor: 'rgba(190, 18, 60, 0.3)'
  }
};

/**
 * ErrorState Component
 * 
 * Displays error states with context-aware variants and retry functionality.
 * Supports multiple error types: error, warning, network, server, info, auth
 * 
 * @param {string} error - Error message to display
 * @param {function} onRetry - Callback function for retry button
 * @param {boolean} showSupport - Whether to show support contact button
 * @param {string} title - Custom title (optional, uses variant default if not provided)
 * @param {string} supportEmail - Support email for contact button
 * @param {string} variant - Error variant: 'error' | 'warning' | 'network' | 'server' | 'info' | 'auth'
 * @param {React.Component} icon - Custom icon component (optional)
 */
export default function ErrorState({ 
  error, 
  onRetry,
  showSupport = true,
  title,
  supportEmail = 'support@example.com',
  variant = 'error',
  icon: CustomIcon
}) {
  const isMobile = useIsMobile();
  
  // Get variant configuration
  const config = VARIANTS[variant] || VARIANTS.error;
  const IconComponent = CustomIcon || config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '48px 24px' : '80px 48px',
        textAlign: 'center',
        background: '#ffffff',
        borderRadius: isMobile ? '16px' : '24px',
        border: `2px solid ${config.borderColor}`,
        minHeight: '400px'
      }}
      data-testid="error-state"
    >
      {/* Error Icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        style={{
          width: isMobile ? '80px' : '120px',
          height: isMobile ? '80px' : '120px',
          borderRadius: '50%',
          background: config.bgGradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: isMobile ? '24px' : '32px',
          boxShadow: `0 8px 24px -8px ${config.shadowColor}`
        }}
      >
        <IconComponent 
          size={isMobile ? 40 : 56} 
          strokeWidth={2}
          style={{ color: config.iconColor }}
        />
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{
          fontSize: isMobile ? '20px' : '24px',
          fontWeight: 700,
          color: '#1e293b',
          marginBottom: '12px',
          lineHeight: 1.3
        }}
      >
        {title || config.defaultTitle}
      </motion.h3>

      {/* Error Message */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        style={{
          fontSize: isMobile ? '14px' : '16px',
          color: '#64748b',
          marginBottom: '32px',
          maxWidth: '480px',
          lineHeight: 1.6
        }}
      >
        {error || 'Gagal memuat data. Silakan coba lagi.'}
      </motion.p>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}
      >
        {/* Retry Button */}
        {onRetry && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRetry}
            style={{
              padding: isMobile ? '12px 24px' : '14px 32px',
              fontSize: isMobile ? '14px' : '16px',
              fontWeight: 600,
              color: '#ffffff',
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              boxShadow: '0 4px 16px -4px rgba(99, 102, 241, 0.4)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <RefreshCw size={18} />
            Coba Lagi
          </motion.button>
        )}

        {/* Support Link */}
        {showSupport && (
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href={`mailto:${supportEmail}`}
            style={{
              padding: isMobile ? '12px 24px' : '14px 32px',
              fontSize: isMobile ? '14px' : '16px',
              fontWeight: 600,
              color: '#64748b',
              background: '#f8fafc',
              border: '2px solid #e2e8f0',
              borderRadius: '12px',
              cursor: 'pointer',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Mail size={18} />
            Hubungi Support
          </motion.a>
        )}
      </motion.div>
    </motion.div>
  );
}
