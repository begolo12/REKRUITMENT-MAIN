import { useState, useRef, useCallback, useEffect } from 'react';
import { RefreshCw, Loader2 } from 'lucide-react';
import './MobileDataList.css';

export default function MobileDataList({
  items,
  renderItem,
  keyExtractor,
  loading = false,
  hasMore = false,
  onLoadMore,
  onRefresh,
  emptyMessage = 'Tidak ada data',
  emptyAction,
  className = ''
}) {
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const listRef = useRef(null);
  const touchStartY = useRef(0);
  const pullThreshold = 80;

  // Handle infinite scroll
  const handleScroll = useCallback(() => {
    if (!listRef.current || !onLoadMore || !hasMore || loading) return;
    
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    const scrollBottom = scrollHeight - scrollTop - clientHeight;
    
    // Load more when within 100px of bottom
    if (scrollBottom < 100) {
      onLoadMore();
    }
  }, [onLoadMore, hasMore, loading]);

  useEffect(() => {
    const list = listRef.current;
    if (list) {
      list.addEventListener('scroll', handleScroll);
      return () => list.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Handle pull-to-refresh
  const handleTouchStart = useCallback((e) => {
    if (!onRefresh || !listRef.current) return;
    
    // Only enable pull when at top of list
    if (listRef.current.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, [onRefresh]);

  const handleTouchMove = useCallback((e) => {
    if (!isPulling || !onRefresh) return;

    const touchY = e.touches[0].clientY;
    const diff = touchY - touchStartY.current;

    // Only pull down (positive diff)
    if (diff > 0 && listRef.current && listRef.current.scrollTop === 0) {
      // Prevent native page scroll while pulling to refresh
      e.preventDefault();

      // Apply resistance to pull (smoother feel)
      const resistance = 0.4;
      setPullDistance(Math.min(diff * resistance, pullThreshold + 30));
    }
  }, [isPulling, onRefresh]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling || !onRefresh) return;
    
    setIsPulling(false);
    
    if (pullDistance >= pullThreshold) {
      setRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    }
    
    setPullDistance(0);
  }, [isPulling, onRefresh, pullDistance]);

  // Loading state
  if (loading && items.length === 0) {
    return (
      <div className={`mobile-data-list loading ${className}`} data-testid="loading-skeleton">
        <div className="skeleton-list">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-item">
              <div className="skeleton-avatar" />
              <div className="skeleton-content">
                <div className="skeleton-line" />
                <div className="skeleton-line short" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (!loading && items.length === 0) {
    return (
      <div className={`mobile-data-list empty ${className}`}>
        <div className="empty-state">
          <p>{emptyMessage}</p>
          {emptyAction && (
            <button className="empty-action-btn" onClick={emptyAction.onClick}>
              {emptyAction.label}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`mobile-data-list ${className}`}>
      {/* Pull-to-refresh indicator */}
      {(onRefresh || refreshing) && (
        <div 
          className={`refresh-indicator ${refreshing ? 'refreshing' : ''}`}
          style={{ 
            height: isPulling || refreshing ? Math.max(pullDistance, refreshing ? 60 : 0) : 0,
            opacity: isPulling || refreshing ? 1 : 0
          }}
          data-testid="refresh-indicator"
        >
          {refreshing ? (
            <Loader2 size={24} className="spin" />
          ) : (
            <RefreshCw 
              size={24} 
              style={{ 
                transform: `rotate(${Math.min(pullDistance / pullThreshold, 1) * 180}deg)`
              }}
            />
          )}
          <span>{refreshing ? 'Memuat...' : 'Tarik untuk refresh'}</span>
        </div>
      )}
      
      {/* List */}
      <ul 
        ref={listRef}
        className="data-list"
        role="list"
        aria-label="Data list"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {items.map((item, index) => (
          <li key={keyExtractor(item)} className="data-list-item" role="listitem">
            {renderItem(item, index)}
          </li>
        ))}
      </ul>
      
      {/* Load more indicator */}
      {hasMore && (
        <div className="load-more-indicator">
          <Loader2 size={20} className="spin" />
          <span>Memuat lebih banyak...</span>
        </div>
      )}
    </div>
  );
}
