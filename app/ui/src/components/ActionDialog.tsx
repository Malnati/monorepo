// app/ui/src/components/ActionDialog.tsx
import { useEffect } from 'react';
import ContainedButton from './ContainedButton';
import OutlinedButton from './OutlinedButton';

interface ActionDialogProps {
  isOpen: boolean;
  title: string;
  description?: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: string;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: string;
  };
  onClose: () => void;
}

export default function ActionDialog({
  isOpen,
  title,
  description,
  primaryAction,
  secondaryAction,
  onClose,
}: ActionDialogProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 animate-fade-in-up"
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <div
        className="relative w-full max-w-lg rounded-t-2xl bg-card-light dark:bg-card-dark p-6 space-y-4 shadow-xl animate-fade-in-up"
      >
        <div>
          <h2
            id="dialog-title"
            className="text-sm font-semibold text-text-light-primary dark:text-text-dark-primary"
          >
            {title}
          </h2>
          {description && (
            <p className="text-sm mt-2 text-text-light-primary dark:text-text-dark-primary opacity-70 leading-snug">
              {description}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 pt-2">
          {primaryAction && (
            <ContainedButton
              onClick={() => {
                primaryAction.onClick();
                onClose();
              }}
              fullWidth
              size="large"
              variant="primary"
              icon={primaryAction.icon}
            >
              {primaryAction.label}
            </ContainedButton>
          )}
          {secondaryAction && (
            <OutlinedButton
              onClick={() => {
                secondaryAction.onClick();
                onClose();
              }}
              fullWidth
              size="large"
              variant="secondary"
              icon={secondaryAction.icon}
            >
              {secondaryAction.label}
            </OutlinedButton>
          )}
          {!primaryAction && !secondaryAction && (
            <ContainedButton
              onClick={onClose}
              fullWidth
              size="large"
              variant="primary"
            >
              Fechar
            </ContainedButton>
          )}
        </div>
      </div>
    </div>
  );
}
