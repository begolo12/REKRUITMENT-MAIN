import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook for pull-to-refresh functionality
 * @param {Function} onRefresh - Callback function to execute on refresh
 * @param {Object} options - Configuration options
 * @param {number} options.threshold - Pull distance threshold in pixels (default: 80)
 * @param {number} options.resistance - Pull resistance factor (default: 2.5)
 * @param {boolean} options.enabled - Enable/disable pull-to-refresh (default: true)
 * @returns {Object} - { pullDistance, isRefreshing, containerRef }
 */
export function usePullToRefresh(onRefresh, options = {}) {
  const {
    threshold = 80,
    resistance = 2.5,
    enabled = true
  } = options;

  const containerRef = useRef(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  
  const touchStartY = useRef(0);
  const touchCurrentY = useRef(0);
  const scrollTop = useRef(0);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;

    const handleTouchStart = (e) => {
      // Only start if scrolled to top
      scrollTop.current = container.scrollTop || window.scrollY;
      if (scrollTop.current > 0) return;

      touchStartY.current = e.touches[0].clientY;
      touchCurrentY.current = touchStartY.current;
      setIsPulling(true);
    };

    const handleTouchMove = (e) => {
      if (!isPulling || isRefreshing) return;

      touchCurrentY.current = e.touches[0].clientY;
      const diff = touchCurrentY.current - touchStartY.current;

      // Only pull down
      if (diff > 0 && scrollTop.current === 0) {
        // Prevent default scroll behavior
        e.preventDefault();
        
        // Apply resistance
        const distance = Math.min(diff / resistance, threshold * 1.5);
        setPullDistance(distance);
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling) return;

      setIsPulling(false);

      if (pullDistance >= threshold && !isRefreshing) {
        setIsRefreshing(true);
        setPullDistance(threshold); // Lock at threshold during refresh

        try {
          await onRefresh();
        } catch (error) {
          console.error('Pull-to-refresh error:', error);
        } finally {
          setIsRefreshing(false);
          setPullDistance(0);
        }
      } else {
        // Animate back to 0
        setPullDistance(0);
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [enabled, isPulling, isRefreshing, pullDistance, threshold, resistance, onRefresh]);

  return {
    pullDistance,
    isRefreshing,
    isPulling,
    containerRef
  };
}
