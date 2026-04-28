import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Trash2, RotateCcw } from 'lucide-react';

export default function ConfirmModal({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  title = 'Konfirmasi',
  message = 'Apakah Anda yakin?',
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  type = 'warning', // 'warning', 'danger', 'info', 'success'
  icon = null,
  loading = false
}) {
  const typeConfig = {
    warning: {
      bgColor: '#fef3c7',
      borderColor: '#fcd34d',
      textColor: '#92400e',
      buttonColor: '#d97706',
      icon: AlertCircle
    },
    danger: {
      bgColor: '#fee2e2',
      borderColor: '#fca5a5',
      textColor: '#991b1b',
      buttonColor: '#dc2626',
      icon: Trash2
    },
    info: {
      bgColor: '#dbeafe',
      borderColor: '#93c5fd',
      textColor: '#1e40af',
      buttonColor: '#2563eb',
      icon: AlertCircle
    },
    success: {
      bgColor: '#d1fae5',
      borderColor: '#6ee7b7',
      textColor: '#065f46',
      buttonColor: '#059669',
      icon: CheckCircle
    }
  };

  const config = typeConfig[type];
  const IconComponent = icon || config.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 999,
              backdropFilter: 'blur(4px)'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onCancel}
          />
          
          {/* Modal */}
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            pointerEvents: 'none'
          }}>
            <motion.div
              style={{
                background: '#ffffff',
                borderRadius: '20px',
                padding: '32px',
                boxShadow: '0 20px 60px -20px rgba(0, 0, 0, 0.3)',
                maxWidth: '420px',
                width: '90%',
                pointerEvents: 'auto',
                border: `2px solid ${config.borderColor}`
              }}
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 20 }}
              transition={{ 
                type: "spring",
                stiffness: 400,
                damping: 30
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Icon */}
              <motion.div
                style={{
                  width: '64px',
                  height: '64px',
                  background: config.bgColor,
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  color: config.textColor
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
              >
                <IconComponent size={32} strokeWidth={2} />
              </motion.div>

              {/* Title */}
              <motion.h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: '#0f172a',
                  textAlign: 'center',
                  marginBottom: '12px'
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                {title}
              </motion.h3>

              {/* Message */}
              <motion.p
                style={{
                  fontSize: '0.95rem',
                  color: '#64748b',
                  textAlign: 'center',
                  marginBottom: '28px',
                  lineHeight: 1.6
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {message}
              </motion.p>

              {/* Actions */}
              <motion.div
                style={{
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'center'
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <button
                  onClick={onCancel}
                  disabled={loading}
                  style={{
                    padding: '10px 24px',
                    background: '#f1f5f9',
                    color: '#64748b',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    transition: 'all 0.2s',
                    opacity: loading ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => !loading && (e.target.style.background = '#e2e8f0')}
                  onMouseLeave={(e) => !loading && (e.target.style.background = '#f1f5f9')}
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  style={{
                    padding: '10px 24px',
                    background: config.buttonColor,
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    transition: 'all 0.2s',
                    opacity: loading ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => !loading && (e.target.style.opacity = '0.9')}
                  onMouseLeave={(e) => !loading && (e.target.style.opacity = '1')}
                >
                  {loading && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      style={{ display: 'flex' }}
                    >
                      <RotateCcw size={16} />
                    </motion.div>
                  )}
                  {confirmText}
                </button>
              </motion.div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
