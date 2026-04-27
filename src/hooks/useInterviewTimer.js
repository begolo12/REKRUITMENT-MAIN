import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';

/**
 * Hook untuk mengelola timer wawancara
 * @param {string} candidateId - ID kandidat untuk localStorage key
 * @returns {Object} - Timer state dan controls
 */
export function useInterviewTimer(candidateId) {
  const STORAGE_KEY = `interview_timer_${candidateId}`;
  
  // Timer states
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [status, setStatus] = useState('normal'); // normal, warning, critical
  const intervalRef = useRef(null);
  const lastAlertRef = useRef(0);

  // Load timer dari localStorage saat mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setSeconds(data.seconds || 0);
        setIsRunning(data.isRunning !== false);
      } catch (e) {
        console.error('Failed to load timer:', e);
      }
    }
  }, [STORAGE_KEY]);

  // Save timer ke localStorage saat berubah
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      seconds,
      isRunning,
      lastUpdated: Date.now()
    }));
  }, [seconds, isRunning, STORAGE_KEY]);

  // Timer interval
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  // Update status dan alerts berdasarkan waktu
  useEffect(() => {
    const minutes = Math.floor(seconds / 60);
    
    // Update status
    if (minutes >= 45) {
      setStatus('critical');
    } else if (minutes >= 30) {
      setStatus('warning');
    } else {
      setStatus('normal');
    }

    // Alerts setiap 15 menit
    if (minutes > 0 && minutes % 15 === 0 && minutes !== lastAlertRef.current) {
      lastAlertRef.current = minutes;
      
      if (minutes === 60) {
        toast.error('⏰ Wawancara sudah berlangsung 1 jam! Pertimbangkan untuk di-pause.', {
          duration: 5000,
        });
        // Auto-pause
        setIsRunning(false);
      } else if (minutes >= 45) {
        toast.error(`⏰ Wawancara sudah berlangsung ${minutes} menit!`, {
          duration: 4000,
        });
      } else if (minutes >= 30) {
        toast(`⏱️ Wawancara sudah berlangsung ${minutes} menit`, {
          icon: '⚠️',
          duration: 3000,
        });
      } else {
        toast(`⏱️ ${minutes} menit berlalu`, {
          duration: 2000,
        });
      }
    }
  }, [seconds]);

  // Format waktu ke HH:MM:SS
  const formatTime = useCallback(() => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, [seconds]);

  // Toggle pause/play
  const toggleTimer = useCallback(() => {
    setIsRunning(prev => {
      const newState = !prev;
      if (newState) {
        toast.success('Timer dilanjutkan', { duration: 1500 });
      } else {
        toast('Timer di-pause', { icon: '⏸️', duration: 1500 });
      }
      return newState;
    });
  }, []);

  // Reset timer dengan konfirmasi
  const resetTimer = useCallback(() => {
    setSeconds(0);
    setIsRunning(true);
    setStatus('normal');
    lastAlertRef.current = 0;
    toast.success('Timer direset', { duration: 2000 });
  }, []);

  // Get timer color berdasarkan status
  const getTimerColor = useCallback(() => {
    switch (status) {
      case 'critical':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      default:
        return '#64748b';
    }
  }, [status]);

  // Get timer background color
  const getTimerBgColor = useCallback(() => {
    switch (status) {
      case 'critical':
        return '#fee2e2';
      case 'warning':
        return '#fef3c7';
      default:
        return '#f1f5f9';
    }
  }, [status]);

  return {
    seconds,
    isRunning,
    status,
    formattedTime: formatTime(),
    toggleTimer,
    resetTimer,
    getTimerColor,
    getTimerBgColor,
  };
}

export default useInterviewTimer;
