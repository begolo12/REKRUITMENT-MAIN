import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function ModernModal({ 
  isOpen, 
  onClose, 
  title, 
  subtitle,
  children, 
  size = 'md',
  showCloseButton = true 
}) {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          
          {/* Modal Container */}
          <div className="modal-container">
            <motion.div
              className={`modal-content ${sizes[size]}`}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ 
                type: "spring",
                stiffness: 400,
                damping: 30
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="modal-header">
                <div>
                  <motion.h3 
                    className="modal-title"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {title}
                  </motion.h3>
                  {subtitle && (
                    <motion.p
                      className="modal-subtitle"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.18 }}
                    >
                      {subtitle}
                    </motion.p>
                  )}
                </div>
                {showCloseButton && (
                  <motion.button
                    className="modal-close"
                    onClick={onClose}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                  >
                    <X size={20} />
                  </motion.button>
                )}
              </div>
              
              {/* Body */}
              <motion.div 
                className="modal-body"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {children}
              </motion.div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  type = 'danger'
}) => {
  const typeColors = {
    danger: { bg: '#ef4444', hover: '#dc2626' },
    warning: { bg: '#f59e0b', hover: '#d97706' },
    success: { bg: '#10b981', hover: '#059669' },
    info: { bg: '#6366f1', hover: '#4f46e5' }
  };

  const colors = typeColors[type];

  return (
    <ModernModal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="confirm-modal-content">
        <motion.p 
          className="confirm-message"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {message}
        </motion.p>
        <div className="confirm-actions">
          <motion.button
            className="btn btn-o"
            onClick={onClose}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {cancelText}
          </motion.button>
          <motion.button
            className="btn"
            onClick={onConfirm}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ 
              backgroundColor: colors.bg,
              color: '#fff'
            }}
          >
            {confirmText}
          </motion.button>
        </div>
      </div>
    </ModernModal>
  );
};
