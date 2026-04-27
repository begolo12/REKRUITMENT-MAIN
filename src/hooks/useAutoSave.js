import { useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';

/**
 * Hook untuk auto-save jawaban ke localStorage
 * @param {string} candidateId - ID kandidat
 * @param {string} assessorId - ID assessor
 * @param {Object} answers - State jawaban
 * @param {number} currentQuestionIndex - Index pertanyaan aktif
 * @param {Function} onSave - Callback saat save ke server
 * @returns {Object} - Auto-save state dan controls
 */
export function useAutoSave(candidateId, assessorId, answers, currentQuestionIndex, onSave) {
  const STORAGE_KEY = `interview_autosave_${candidateId}_${assessorId}`;
  const debounceRef = useRef(null);
  const lastSavedRef = useRef(null);

  // Load saved data dari localStorage saat mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        console.log('Auto-save data loaded:', data);
      } catch (e) {
        console.error('Failed to load auto-save:', e);
      }
    }
  }, [STORAGE_KEY]);

  // Auto-save ke localStorage saat answers berubah
  useEffect(() => {
    // Clear timeout sebelumnya
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce save selama 500ms
    debounceRef.current = setTimeout(() => {
      const dataToSave = {
        answers,
        currentQuestionIndex,
        timestamp: Date.now(),
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      lastSavedRef.current = Date.now();
      
      // Show subtle toast (hanya setiap 10 detik)
      const timeSinceLastToast = Date.now() - (window.lastAutoSaveToast || 0);
      if (timeSinceLastToast > 10000) {
        toast.success('Jawaban tersimpan', {
          duration: 1500,
          style: {
            fontSize: '0.75rem',
            padding: '8px 12px',
          },
        });
        window.lastAutoSaveToast = Date.now();
      }
    }, 500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [answers, currentQuestionIndex, STORAGE_KEY]);

  // Manual save trigger
  const triggerManualSave = useCallback(async () => {
    if (onSave) {
      try {
        await onSave();
        toast.success('Semua jawaban berhasil disimpan!', {
          duration: 2500,
        });
      } catch (error) {
        toast.error('Gagal menyimpan: ' + error.message, {
          duration: 3000,
        });
      }
    }
  }, [onSave]);

  // Clear saved data (setelah berhasil submit)
  const clearSavedData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    lastSavedRef.current = null;
  }, [STORAGE_KEY]);

  // Restore data dari localStorage
  const restoreSavedData = useCallback(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to restore auto-save:', e);
        return null;
      }
    }
    return null;
  }, [STORAGE_KEY]);

  // Get last saved time
  const getLastSavedTime = useCallback(() => {
    if (lastSavedRef.current) {
      const date = new Date(lastSavedRef.current);
      return date.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    return null;
  }, []);

  return {
    triggerManualSave,
    clearSavedData,
    restoreSavedData,
    getLastSavedTime,
    hasSavedData: !!localStorage.getItem(STORAGE_KEY),
  };
}

export default useAutoSave;
