import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((message, options = {}) => {
    const id = Date.now() + Math.random();
    const toast = {
      id,
      message,
      type: options.type || 'info',
      duration: options.duration || 5000,
      action: options.action,
      ...options
    };
    
    setToasts(prev => [...prev.slice(-2), toast]);
    
    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration);
    }
    
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
