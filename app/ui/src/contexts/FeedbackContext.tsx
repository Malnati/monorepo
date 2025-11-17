// app/ui/src/contexts/FeedbackContext.tsx
import { createContext, useState, useCallback, ReactNode } from 'react';
import FeedbackToast from '../components/FeedbackToast';
import ActionDialog from '../components/ActionDialog';

type FeedbackVariant = 'error' | 'warning' | 'success' | 'info';

interface ToastOptions {
  variant: FeedbackVariant;
  title: string;
  description?: string;
  duration?: number;
}

interface DialogOptions {
  title: string;
  description?: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
}

interface FeedbackContextType {
  showToast: (options: ToastOptions) => void;
  showDialog: (options: DialogOptions) => void;
  hideDialog: () => void;
}

export const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastOptions | null>(null);
  const [dialog, setDialog] = useState<DialogOptions | null>(null);

  const showToast = useCallback((options: ToastOptions) => {
    setToast(options);
    const duration = options.duration || 3000;
    setTimeout(() => {
      setToast(null);
    }, duration);
  }, []);

  const showDialog = useCallback((options: DialogOptions) => {
    setDialog(options);
  }, []);

  const hideDialog = useCallback(() => {
    setDialog(null);
  }, []);

  return (
    <FeedbackContext.Provider value={{ showToast, showDialog, hideDialog }}>
      {children}
      {toast && (
        <FeedbackToast
          variant={toast.variant}
          title={toast.title}
          description={toast.description}
          onClose={() => setToast(null)}
        />
      )}
      {dialog && (
        <ActionDialog
          isOpen={true}
          title={dialog.title}
          description={dialog.description}
          primaryAction={dialog.primaryAction}
          secondaryAction={dialog.secondaryAction}
          onClose={() => {
            setDialog(null);
            dialog.onClose?.();
          }}
        />
      )}
    </FeedbackContext.Provider>
  );
}
