import { createContext } from 'react';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
}

export interface SnackbarContextValue {
  showSnackbar: (message: string, type: Toast['type'], duration?: number) => void;
  hideSnackbar: (id: string) => void;
}

export const SnackbarContext = createContext<SnackbarContextValue | undefined>(undefined);
