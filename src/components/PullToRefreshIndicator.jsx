import { RefreshCw } from 'lucide-react';

/**
 * PullToRefresh indicator component
 * Shows visual feedback during pull-to-refresh gesture
 */
export default function PullToRefreshIndicator({ pullDistance, isRefreshing, threshold = 80 }) {
  const progress = Math.min((pullDistance / threshold) * 100, 100);
  const isReady = pullDistance >= threshold;

  if (pullDistance === 0 && !isRefreshing) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: Math.max(pullDistance, isRefreshing ? threshold : 0),
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingBottom: '12px',
        background: 'linear-gradient(180deg, rgba(79, 70, 229, 0.05) 0%, transparent 100%)',
        transition: isRefreshing ? 'height 0.3s ease' : 'none',
        pointerEvents: 'none',
        zIndex: 50
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: isReady ? '#4f46e5' : '#64748b',
          fontSize: '0.875rem',
          fontWeight: 500,
          transition: 'color 0.2s ease'
        }}
      >
        <RefreshCw
          size={20}
          style={{
            animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
            transform: `rotate(${progress * 3.6}deg)`,
            transition: isRefreshing ? 'none' : 'transform 0.1s ease'
          }}
        />
        <span>
          {isRefreshing ? 'Memuat ulang...' : isReady ? 'Lepas untuk memuat ulang' : 'Tarik untuk memuat ulang'}
        </span>
      </div>
    </div>
  );
}
