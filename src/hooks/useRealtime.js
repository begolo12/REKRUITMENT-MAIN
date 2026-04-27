import { useEffect, useCallback } from 'react';
import { useToast } from '../context/ToastContext';

export function useRealtime() {
  const { success, error, info } = useToast();

  const notifyCandidateAdded = useCallback((candidateName) => {
    success(`Kandidat baru ditambahkan: ${candidateName}`);
  }, [success]);

  const notifyAssessmentCompleted = useCallback((candidateName) => {
    success(`Assessment selesai untuk ${candidateName}`);
  }, [success]);

  const notifyStatusChanged = useCallback((candidateName, newStatus) => {
    info(`Status ${candidateName} berubah menjadi ${newStatus}`);
  }, [info]);

  const notifyExportReady = useCallback((filename) => {
    success(`Export ${filename} siap diunduh`);
  }, [success]);

  const notifyError = useCallback((message) => {
    error(message);
  }, [error]);

  return {
    notifyCandidateAdded,
    notifyAssessmentCompleted,
    notifyStatusChanged,
    notifyExportReady,
    notifyError
  };
}

export default useRealtime;
