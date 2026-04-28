import { motion } from 'framer-motion';
import { useIsMobile } from '../hooks/useIsMobile';
import { Inbox, Search, FileX, AlertCircle } from 'lucide-react';

// Variant configurations with context-aware defaults
const variants = {
  'no-data': {
    icon: Inbox,
    defaultTitle: 'Tidak ada data',
    defaultDesc: 'Belum ada data yang tersedia'
  },
  'no-results': {
    icon: Search,
    defaultTitle: 'Tidak ada hasil',
    defaultDesc: 'Coba ubah kata kunci pencarian'
  },
  'no-search': {
    icon: Search,
    defaultTitle: 'Cari data',
    defaultDesc: 'Masukkan kata kunci untuk mencari'
  },
  'error': {
    icon: AlertCircle,
    defaultTitle: 'Terjadi kesalahan',
    defaultDesc: 'Silakan coba lagi nanti'
  },
  'empty': {
    icon: FileX,
    defaultTitle: 'Data kosong',
    defaultDesc: 'Tidak ada item untuk ditampilkan'
  }
};

export default function EmptyState({ 
  variant = 'no-data',
  icon: CustomIcon,
  title,
  description,
  action,
  actionLabel,
  onAction,
  illustration 
}) {
  const isMobile = useIsMobile();
  
  // Get variant configuration
  const config = variants[variant] || variants['no-data'];
  const Icon = CustomIcon || config.icon;
  
  // Determine final title and description
  const finalTitle = title || config.defaultTitle;
  const finalDescription = description || config.defaultDesc;
  
  // Support both old API (action object) and new API (actionLabel + onAction)
  const hasAction = action || (actionLabel && onAction);
  const actionText = action?.label || actionLabel;
  const actionHandler = action?.onClick || onAction;

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
        border: '2px dashed #e2e8f0',
        minHeight: '400px'
      }}
      data-testid="empty-state"
    >
      {/* Icon or Illustration */}
      {Icon && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          style={{
            width: isMobile ? '80px' : '120px',
            height: isMobile ? '80px' : '120px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: isMobile ? '24px' : '32px',
            boxShadow: '0 8px 24px -8px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Icon 
            size={isMobile ? 40 : 56} 
            strokeWidth={1.5}
            style={{ color: '#94a3b8' }}
          />
        </motion.div>
      )}

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
        {finalTitle}
      </motion.h3>

      {/* Description */}
      {finalDescription && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{
            fontSize: isMobile ? '14px' : '16px',
            color: '#64748b',
            marginBottom: hasAction ? '32px' : '0',
            maxWidth: '480px',
            lineHeight: 1.6
          }}
        >
          {finalDescription}
        </motion.p>
      )}

      {/* Action Button */}
      {hasAction && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={actionHandler}
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
            transition: 'all 0.3s ease'
          }}
        >
          {actionText}
        </motion.button>
      )}
    </motion.div>
  );
}
