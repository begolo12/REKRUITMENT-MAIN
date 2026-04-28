import { Play, Pause, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import ConfirmModal from '../ConfirmModal';

/**
 * Timer Component untuk wawancara
 * @param {Object} props
 * @param {string} props.formattedTime - Waktu yang diformat (HH:MM:SS atau MM:SS)
 * @param {boolean} props.isRunning - Status timer berjalan atau tidak
 * @param {string} props.status - Status timer (normal, warning, critical)
 * @param {Function} props.onToggle - Callback saat timer di-toggle
 * @param {Function} props.onReset - Callback saat timer di-reset
 */
export function Timer({ formattedTime, isRunning, status, onToggle, onReset }) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Get styles berdasarkan status
  const getContainerStyles = () => {
    const baseStyles = {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 14px',
      borderRadius: '10px',
      fontFamily: 'monospace',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.25s cubic-bezier(.4,0,.2,1)',
      border: '2px solid transparent',
      userSelect: 'none',
    };

    switch (status) {
      case 'critical':
        return {
          ...baseStyles,
          background: '#fee2e2',
          color: '#ef4444',
          borderColor: '#fecaca',
          animation: 'pulse 2s infinite',
        };
      case 'warning':
        return {
          ...baseStyles,
          background: '#fef3c7',
          color: '#f59e0b',
          borderColor: '#fde68a',
        };
      default:
        return {
          ...baseStyles,
          background: '#f1f5f9',
          color: '#64748b',
          borderColor: '#e2e8f0',
        };
    }
  };

  // Handle right-click untuk reset
  const handleContextMenu = (e) => {
    e.preventDefault();
    setShowResetConfirm(true);
  };

  return (
    <>
      <div
        style={getContainerStyles()}
        onClick={onToggle}
        onContextMenu={handleContextMenu}
        title="Klik untuk pause/play, right-click untuk reset"
        role="button"
        aria-label={`Waktu wawancara: ${formattedTime}. Klik untuk ${isRunning ? 'pause' : 'play'}`}
      >
        <span style={{ 
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
        }}>
          {isRunning ? (
            <Pause size={16} style={{ opacity: 0.7 }} />
          ) : (
            <Play size={16} style={{ opacity: 0.7 }} />
          )}
        </span>
        <span style={{ 
          letterSpacing: '0.5px',
          minWidth: '70px',
          textAlign: 'center',
        }}>
          {formattedTime}
        </span>
      </div>

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={showResetConfirm}
        onConfirm={() => {
          onReset();
          setShowResetConfirm(false);
        }}
        onCancel={() => setShowResetConfirm(false)}
        title="Reset Timer"
        message="Apakah Anda yakin ingin mereset timer?"
        confirmText="Ya, Reset"
        cancelText="Batal"
        type="warning"
      />
    </>
  );
}

/**
 * Compact Timer untuk mobile/tablet
 */
export function TimerCompact({ formattedTime, isRunning, status, onToggle }) {
  const getStyles = () => {
    const baseStyles = {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      padding: '6px 10px',
      borderRadius: '8px',
      fontFamily: 'monospace',
      fontSize: '0.85rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.25s ease',
    };

    switch (status) {
      case 'critical':
        return { ...baseStyles, background: '#fee2e2', color: '#ef4444' };
      case 'warning':
        return { ...baseStyles, background: '#fef3c7', color: '#f59e0b' };
      default:
        return { ...baseStyles, background: '#f1f5f9', color: '#64748b' };
    }
  };

  return (
    <div
      style={getStyles()}
      onClick={onToggle}
      role="button"
      aria-label={`Waktu: ${formattedTime}`}
    >
      {isRunning ? <Pause size={14} /> : <Play size={14} />}
      <span>{formattedTime}</span>
    </div>
  );
}

export default Timer;
