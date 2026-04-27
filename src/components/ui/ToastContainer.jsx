import { useToast } from '../../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, Loader2 } from 'lucide-react';

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  loading: Loader2
};

const toastColors = {
  success: { bg: 'var(--success-bg)', border: 'var(--success)', icon: 'var(--success)' },
  error: { bg: 'var(--danger-bg)', border: 'var(--danger)', icon: 'var(--danger)' },
  warning: { bg: 'var(--warning-bg)', border: 'var(--warning)', icon: 'var(--warning)' },
  info: { bg: 'var(--info-bg)', border: 'var(--info)', icon: 'var(--info)' },
  loading: { bg: 'var(--gray-100)', border: 'var(--gray-400)', icon: 'var(--gray-600)' }
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }}>
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = toastIcons[toast.type];
          const colors = toastColors[toast.type];
          
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px 20px',
                background: colors.bg,
                border: `1px solid ${colors.border}`,
                borderRadius: '12px',
                boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
                minWidth: '300px',
                maxWidth: '400px'
              }}
            >
              <Icon 
                size={20} 
                color={colors.icon}
                style={toast.type === 'loading' ? { animation: 'spin 1s linear infinite' } : {}}
              />
              <span style={{ 
                flex: 1, 
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'var(--gray-800)'
              }}>
                {toast.message}
              </span>
              <button
                onClick={() => removeToast(toast.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  color: 'var(--gray-500)'
                }}
              >
                <X size={16} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
