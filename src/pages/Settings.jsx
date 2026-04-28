import { useState } from 'react';
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
      <div className="p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <AlertTriangle size={28} className="text-yellow-600 sm:w-8 sm:h-8" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Akses Ditolak</h2>
            <p className="text-sm sm:text-base text-gray-600">Hanya Admin yang dapat mengakses halaman ini.</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-4 sm:space-y-6"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <SettingsIcon size={20} className="text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Pengaturan Sistem</h1>
            <p className="text-xs sm:text-sm text-gray-600 truncate">Kelola pengaturan dan data aplikasi</p>
          </div>
        </div>

        {/* Danger Zone Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-red-200 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-red-50 to-orange-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-red-200">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-600 flex-shrink-0" />
              <h2 className="text-base sm:text-lg font-semibold text-red-900">Danger Zone</h2>
            </div>
            <p className="text-xs sm:text-sm text-red-700 mt-1">Tindakan bersifat permanen dan tidak dapat dibatalkan</p>
          </div>

          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <Trash2 size={24} className="text-red-600" />
              </div>
              
              <div className="flex-1 min-w-0 w-full">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Reset Semua Data</h3>
                <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
                  Menghapus <strong>semua data kandidat, penilaian, dan kategori soal</strong> dari sistem. 
                  Data user tidak akan dihapus.
                </p>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={14} className="text-red-600 mt-0.5 flex-shrink-0 sm:w-4 sm:h-4" />
                    <p className="text-xs sm:text-sm text-red-800 leading-relaxed">
                      <strong>Peringatan:</strong> Tindakan ini tidak dapat dibatalkan! Pastikan backup data penting terlebih dahulu.
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowResetModal(true)}
                  className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 active:bg-red-800 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-sm hover:shadow-md text-sm sm:text-base"
                >
                  <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                  Reset Semua Data
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl border border-blue-200 p-4 sm:p-6"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <SettingsIcon size={18} className="text-blue-600 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Informasi Sistem</h3>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                Halaman ini menyediakan pengaturan tingkat sistem yang hanya dapat diakses oleh Administrator. 
                Pastikan Anda memahami dampak dari setiap tindakan sebelum melanjutkan.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

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
    </div>
  );
}
