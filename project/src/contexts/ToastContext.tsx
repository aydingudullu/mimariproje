'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { ToastContainer, ToastProps } from '@/components/error-toast';

interface ToastContextValue {
  toasts: ToastProps[];
  addToast: (toast: Omit<ToastProps, 'id'>) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
  showError: (message: string, options?: Partial<ToastProps>) => string;
  showWarning: (message: string, options?: Partial<ToastProps>) => string;
  showSuccess: (message: string, options?: Partial<ToastProps>) => string;
  showInfo: (message: string, options?: Partial<ToastProps>) => string;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = useCallback((toast: Omit<ToastProps, 'id'>) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newToast: ToastProps = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const showError = useCallback((message: string, options?: Partial<ToastProps>) => {
    return addToast({ ...options, message, type: 'error' });
  }, [addToast]);

  const showWarning = useCallback((message: string, options?: Partial<ToastProps>) => {
    return addToast({ ...options, message, type: 'warning' });
  }, [addToast]);

  const showSuccess = useCallback((message: string, options?: Partial<ToastProps>) => {
    return addToast({ ...options, message, type: 'success' });
  }, [addToast]);

  const showInfo = useCallback((message: string, options?: Partial<ToastProps>) => {
    return addToast({ ...options, message, type: 'info' });
  }, [addToast]);

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        clearAllToasts,
        showError,
        showWarning,
        showSuccess,
        showInfo,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Re-export types
export type { ToastProps };
