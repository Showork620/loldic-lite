import { createContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { Snackbar } from './Snackbar';
import styles from './SnackbarProvider.module.css';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
}

interface SnackbarContextValue {
  showSnackbar: (message: string, type: Toast['type'], duration?: number) => void;
  hideSnackbar: (id: string) => void;
}

export const SnackbarContext = createContext<SnackbarContextValue | undefined>(undefined);

interface SnackbarProviderProps {
  children: ReactNode;
}

const MAX_TOASTS = 5;

export function SnackbarProvider({ children }: SnackbarProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showSnackbar = useCallback((message: string, type: Toast['type'], duration = 3000) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: Toast = { id, message, type, duration };

    setToasts((prev) => {
      const updated = [...prev, newToast];
      // 最大数を超えたら古いものから削除
      if (updated.length > MAX_TOASTS) {
        return updated.slice(-MAX_TOASTS);
      }
      return updated;
    });
  }, []);

  const hideSnackbar = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <SnackbarContext.Provider value={{ showSnackbar, hideSnackbar }}>
      {children}
      <div className={styles.snackbarContainer}>
        {toasts.map((toast) => (
          <Snackbar
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => hideSnackbar(toast.id)}
          />
        ))}
      </div>
    </SnackbarContext.Provider>
  );
}
