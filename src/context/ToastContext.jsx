import { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext(null);

// Constants for toast management
const MAX_TOASTS = 3;
const DEFAULT_DURATION = 5000;
const DEDUPLICATION_WINDOW = 3000; // 3 seconds window for deduplication

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  // Use ref to track recent toast messages for deduplication
  const recentToastsRef = useRef(new Map());
  // Track active timeout IDs for cleanup
  const timeoutRefs = useRef(new Map());

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    // Clear timeout if exists
    if (timeoutRefs.current.has(id)) {
      clearTimeout(timeoutRefs.current.get(id));
      timeoutRefs.current.delete(id);
    }
    // Remove from recent toasts tracking
    for (const [key, value] of recentToastsRef.current.entries()) {
      if (value.id === id) {
        recentToastsRef.current.delete(key);
        break;
      }
    }
  }, []);

  const addToast = useCallback((message, options = {}) => {
    const now = Date.now();
    const dedupeKey = `${message}-${options.type || 'info'}`;
    
    // Deduplication: Check if similar toast was shown recently
    const recentToast = recentToastsRef.current.get(dedupeKey);
    if (recentToast && (now - recentToast.timestamp) < DEDUPLICATION_WINDOW) {
      console.log('Toast deduplicated:', message);
      return recentToast.id; // Return existing toast ID
    }
    
    const id = now + Math.random();
    const toast = {
      id,
      message,
      type: options.type || 'info',
      duration: options.duration !== undefined ? options.duration : DEFAULT_DURATION,
      action: options.action,
      ...options
    };
    
    // Track this toast for deduplication
    recentToastsRef.current.set(dedupeKey, { id, timestamp: now });
    
    // Limit max toasts: Keep only the most recent MAX_TOASTS - 1 toasts, then add new one
    setToasts(prev => {
      const trimmed = prev.slice(-(MAX_TOASTS - 1));
      return [...trimmed, toast];
    });
    
    // Auto-dismiss after duration (if duration is not 0)
    if (toast.duration > 0) {
      const timeoutId = setTimeout(() => {
        removeToast(id);
      }, toast.duration);
      timeoutRefs.current.set(id, timeoutId);
    }
    
    // Cleanup old deduplication entries periodically
    setTimeout(() => {
      const currentTime = Date.now();
      for (const [key, value] of recentToastsRef.current.entries()) {
        if (currentTime - value.timestamp > DEDUPLICATION_WINDOW) {
          recentToastsRef.current.delete(key);
        }
      }
    }, DEDUPLICATION_WINDOW);
    
    return id;
  }, [removeToast]);

  const success = useCallback((message, options) => 
    addToast(message, { ...options, type: 'success' }), [addToast]);
  
  const error = useCallback((message, options) => 
    addToast(message, { ...options, type: 'error' }), [addToast]);
  
  const warning = useCallback((message, options) => 
    addToast(message, { ...options, type: 'warning' }), [addToast]);
  
  const info = useCallback((message, options) => 
    addToast(message, { ...options, type: 'info' }), [addToast]);
  
  const loading = useCallback((message, options) => 
    addToast(message, { ...options, type: 'loading', duration: 0 }), [addToast]);

  const value = {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
    loading
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

export default ToastContext;
