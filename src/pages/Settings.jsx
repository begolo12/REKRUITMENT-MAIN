import { useState } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';
import { motion } from 'framer-motion';
import { Trash2, AlertTriangle, Settings as SettingsIcon } from 'lucide-react';
import { resetAllData } from '../services/db';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';

export default function Settings() {
  const { user } = useAuth();
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const isMobile = useIsMobile();

  const isAdmin = user?.role?.toLowerCase() === 'admin';

  const handleResetAllData = async () => {
    setIsResetting(true);
    try {
      await resetAllData();
      toast.success('Semua data berhasil dihapus');
      setShowResetModal(false);
    } catch (error) {
      console.error('Error resetting data:', error);
      toast.error('Gagal menghapus data: ' + error.message);
    } finally {
      setIsResetting(false);
    }
  };

  if (!isAdmin) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ padding: '24px' }}
      >
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          background: '#ffffff',
          borderRadius: isMobile ? '16px' : '24px',
          boxShadow: '0 8px 40px -12px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(226, 232, 240, 0.8)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          padding: isMobile ? '32px 20px' : '48px',
          textAlign: 'center'
        }}>
          <div style={{
            width: isMobile ? '56px' : '80px',
            height: isMobile ? '56px' : '80px',
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 8px 20px -6px rgba(245, 158, 11, 0.3)'
          }}>
            <AlertTriangle size={36} style={{ color: '#d97706' }} />
          </div>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#0f172a',
            marginBottom: '12px'
          }}>Akses Ditolak</h2>
          <p style={{ color: '#64748b', fontSize: '1rem' }}>Hanya Admin yang dapat mengakses halaman ini.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ padding: '24px' }}
    >
      {/* Premium Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          marginBottom: '32px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)',
          padding: isMobile ? '20px' : '32px 40px',
          borderRadius: isMobile ? '16px' : '24px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 60px -20px rgba(15, 23, 42, 0.3)'
        }}
      >
        {/* Decorative elements */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-10%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: isMobile ? '48px' : '64px',
            height: isMobile ? '48px' : '64px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px -6px rgba(79, 70, 229, 0.4)'
          }}>
            <SettingsIcon size={isMobile ? 24 : 32} style={{ color: '#fff' }} />
          </div>
          <div>
            <h1 style={{
              fontSize: isMobile ? '1.25rem' : '1.75rem',
              fontWeight: 800,
              margin: '0 0 8px 0',
              color: '#fff',
              letterSpacing: '-0.02em'
            }}>
              Pengaturan Sistem
            </h1>
            <p style={{
              margin: 0,
              color: 'rgba(255,255,255,0.7)',
              fontSize: '0.95rem'
            }}>
              Kelola pengaturan dan data aplikasi
            </p>
          </div>
        </div>
      </motion.div>

      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Danger Zone Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            background: '#ffffff',
            borderRadius: isMobile ? '16px' : '24px',
            boxShadow: '0 8px 40px -12px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(226, 232, 240, 0.8)',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            overflow: 'hidden'
          }}
        >
          <div style={{
            background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
            padding: isMobile ? '16px 20px' : '24px 32px',
            borderBottom: '1px solid #fecaca'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <AlertTriangle size={20} style={{ color: '#fff' }} />
              </div>
              <div>
                <h2 style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: '#991b1b',
                  margin: '0 0 4px 0'
                }}>Danger Zone</h2>
                <p style={{ margin: 0, color: '#dc2626', fontSize: '0.875rem' }}>Tindakan bersifat permanen dan tidak dapat dibatalkan</p>
              </div>
            </div>
          </div>

          <div style={{ padding: isMobile ? '20px' : '32px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: isMobile ? '16px' : '24px', flexDirection: isMobile ? 'column' : 'row' }}>
              <div style={{
                width: isMobile ? '48px' : '64px',
                height: isMobile ? '48px' : '64px',
                background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 12px -4px rgba(220, 38, 38, 0.2)'
              }}>
                <Trash2 size={28} style={{ color: '#dc2626' }} />
              </div>

              <div style={{ flex: 1 }}>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  color: '#0f172a',
                  margin: '0 0 12px 0'
                }}>Reset Semua Data</h3>
                <p style={{
                  color: '#64748b',
                  fontSize: '0.95rem',
                  margin: '0 0 20px 0',
                  lineHeight: 1.6
                }}>
                  Menghapus <strong style={{ color: '#dc2626' }}>semua data kandidat, penilaian, dan kategori soal</strong> dari sistem.
                  Data user tidak akan dihapus.
                </p>

                <div style={{
                  background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                  border: '1px solid #fecaca',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  marginBottom: '24px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <AlertTriangle size={18} style={{ color: '#dc2626', marginTop: '2px', flexShrink: 0 }} />
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#991b1b', lineHeight: 1.5 }}>
                      <strong>Peringatan:</strong> Tindakan ini tidak dapat dibatalkan! Pastikan backup data penting terlebih dahulu.
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowResetModal(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: isMobile ? '12px 20px' : '14px 28px',
                    width: isMobile ? '100%' : 'auto',
                    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    boxShadow: '0 8px 24px -6px rgba(220, 38, 38, 0.4)'
                  }}
                >
                  <Trash2 size={18} />
                  Reset Semua Data
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            borderRadius: isMobile ? '16px' : '24px',
            border: '1px solid #bfdbfe',
            padding: isMobile ? '20px' : '28px 32px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
            <div style={{
              width: isMobile ? '44px' : '56px',
              height: isMobile ? '44px' : '56px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 8px 20px -6px rgba(59, 130, 246, 0.3)'
            }}>
              <SettingsIcon size={26} style={{ color: '#fff' }} />
            </div>
            <div>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: 700,
                color: '#1e40af',
                margin: '0 0 8px 0'
              }}>Informasi Sistem</h3>
              <p style={{
                fontSize: '0.95rem',
                color: '#3b82f6',
                margin: 0,
                lineHeight: 1.6
              }}>
                Halaman ini menyediakan pengaturan tingkat sistem yang hanya dapat diakses oleh Administrator.
                Pastikan Anda memahami dampak dari setiap tindakan sebelum melanjutkan.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <ConfirmModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleResetAllData}
        title="Reset Semua Data?"
        message="Apakah Anda yakin ingin menghapus SEMUA data kandidat, penilaian, dan kategori soal? Tindakan ini tidak dapat dibatalkan dan akan menghapus seluruh data sistem kecuali data user."
        confirmText="Ya, Hapus Semua"
        cancelText="Batal"
        type="danger"
        loading={isResetting}
      />
    </motion.div>
  );
}
