/**
 * Navigation Footer Component
 * @param {Object} props
 * @param {boolean} props.canGoPrev - Bisa ke pertanyaan sebelumnya
 * @param {boolean} props.canGoNext - Bisa ke pertanyaan berikutnya
 * @param {boolean} props.isLastQuestion - Apakah pertanyaan terakhir
 * @param {boolean} props.isSaving - Sedang menyimpan
 * @param {Function} props.onPrev - Callback previous
 * @param {Function} props.onSkip - Callback skip
 * @param {Function} props.onNext - Callback next/save
 * @param {Function} props.onFinish - Callback finish
 * @param {boolean} props.isMobile - Apakah tampilan mobile
 */
import { ChevronLeft, ChevronRight, SkipForward, Save, CheckCircle } from 'lucide-react';

export function NavigationFooter({
  canGoPrev,
  canGoNext,
  isLastQuestion,
  isSaving,
  onPrev,
  onSkip,
  onNext,
  onFinish,
  isMobile = false,
}) {
  if (isMobile) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '16px',
        background: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        position: 'fixed',
        bottom: 'calc(64px + env(safe-area-inset-bottom))',
        left: 0,
        right: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onPrev}
            disabled={!canGoPrev || isSaving}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '12px',
              borderRadius: '10px',
              border: '2px solid #e2e8f0',
              background: '#ffffff',
              color: !canGoPrev ? '#94a3b8' : '#475569',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: !canGoPrev ? 'not-allowed' : 'pointer',
              opacity: !canGoPrev ? 0.6 : 1,
              transition: 'all 0.25s ease',
            }}
          >
            <ChevronLeft size={18} />
            Sebelumnya
          </button>
          
          <button
            onClick={onSkip}
            disabled={!canGoNext || isSaving}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '12px',
              borderRadius: '10px',
              border: '2px solid #fed7aa',
              background: '#fff7ed',
              color: !canGoNext ? '#94a3b8' : '#c2410c',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: !canGoNext ? 'not-allowed' : 'pointer',
              opacity: !canGoNext ? 0.6 : 1,
              transition: 'all 0.25s ease',
            }}
          >
            <SkipForward size={18} />
            Lewati
          </button>
        </div>
        
        {isLastQuestion ? (
          <button
            onClick={onFinish}
            disabled={isSaving}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '14px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#ffffff',
              fontSize: '0.9rem',
              fontWeight: '700',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              opacity: isSaving ? 0.7 : 1,
              boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
              transition: 'all 0.25s ease',
            }}
          >
            <CheckCircle size={20} />
            {isSaving ? 'Menyimpan...' : 'Selesai'}
          </button>
        ) : (
          <button
            onClick={onNext}
            disabled={!canGoNext || isSaving}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '14px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              color: '#ffffff',
              fontSize: '0.9rem',
              fontWeight: '700',
              cursor: !canGoNext || isSaving ? 'not-allowed' : 'pointer',
              opacity: !canGoNext || isSaving ? 0.7 : 1,
              boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
              transition: 'all 0.25s ease',
            }}
          >
            {isSaving ? (
              <>
                <div style={{
                  width: '18px',
                  height: '18px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#ffffff',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }} />
                Menyimpan...
              </>
            ) : (
              <>
                Simpan & Lanjut
                <ChevronRight size={20} />
              </>
            )}
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px 0',
      marginTop: '24px',
      borderTop: '1px solid #e2e8f0',
    }}>
      {/* Left Side - Previous */}
      <button
        onClick={onPrev}
        disabled={!canGoPrev || isSaving}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 20px',
          borderRadius: '10px',
          border: '2px solid #e2e8f0',
          background: '#ffffff',
          color: !canGoPrev ? '#94a3b8' : '#475569',
          fontSize: '0.85rem',
          fontWeight: '600',
          cursor: !canGoPrev ? 'not-allowed' : 'pointer',
          opacity: !canGoPrev ? 0.6 : 1,
          transition: 'all 0.25s ease',
        }}
        onMouseEnter={(e) => {
          if (canGoPrev) {
            e.currentTarget.style.borderColor = '#6366f1';
            e.currentTarget.style.color = '#6366f1';
            e.currentTarget.style.background = '#eef2ff';
          }
        }}
        onMouseLeave={(e) => {
          if (canGoPrev) {
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.color = '#475569';
            e.currentTarget.style.background = '#ffffff';
          }
        }}
      >
        <ChevronLeft size={18} />
        Sebelumnya
      </button>

      {/* Center - Skip */}
      <button
        onClick={onSkip}
        disabled={!canGoNext || isSaving}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 20px',
          borderRadius: '10px',
          border: '2px solid #fed7aa',
          background: '#fff7ed',
          color: !canGoNext ? '#94a3b8' : '#c2410c',
          fontSize: '0.85rem',
          fontWeight: '600',
          cursor: !canGoNext ? 'not-allowed' : 'pointer',
          opacity: !canGoNext ? 0.6 : 1,
          transition: 'all 0.25s ease',
        }}
        onMouseEnter={(e) => {
          if (canGoNext) {
            e.currentTarget.style.borderColor = '#f97316';
            e.currentTarget.style.background = '#ffedd5';
          }
        }}
        onMouseLeave={(e) => {
          if (canGoNext) {
            e.currentTarget.style.borderColor = '#fed7aa';
            e.currentTarget.style.background = '#fff7ed';
          }
        }}
      >
        <SkipForward size={18} />
        Lewati
      </button>

      {/* Right Side - Next/Finish */}
      {isLastQuestion ? (
        <button
          onClick={onFinish}
          disabled={isSaving}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            borderRadius: '10px',
            border: 'none',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#ffffff',
            fontSize: '0.9rem',
            fontWeight: '700',
            cursor: isSaving ? 'not-allowed' : 'pointer',
            opacity: isSaving ? 0.7 : 1,
            boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
            transition: 'all 0.25s ease',
          }}
          onMouseEnter={(e) => {
            if (!isSaving) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(16,185,129,0.45)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(16,185,129,0.35)';
          }}
        >
          <CheckCircle size={20} />
          {isSaving ? 'Menyimpan...' : 'Selesai'}
        </button>
      ) : (
        <button
          onClick={onNext}
          disabled={!canGoNext || isSaving}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            borderRadius: '10px',
            border: 'none',
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            color: '#ffffff',
            fontSize: '0.9rem',
            fontWeight: '700',
            cursor: !canGoNext || isSaving ? 'not-allowed' : 'pointer',
            opacity: !canGoNext || isSaving ? 0.7 : 1,
            boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
            transition: 'all 0.25s ease',
          }}
          onMouseEnter={(e) => {
            if (canGoNext && !isSaving) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,0.45)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(99,102,241,0.35)';
          }}
        >
          {isSaving ? (
            <>
              <div style={{
                width: '18px',
                height: '18px',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: '#ffffff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }} />
              Menyimpan...
            </>
          ) : (
            <>
              Simpan & Lanjut
              <ChevronRight size={20} />
            </>
          )}
        </button>
      )}
    </div>
  );
}

export default NavigationFooter;
