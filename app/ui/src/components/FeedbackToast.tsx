// app/ui/src/components/FeedbackToast.tsx
import { ICON_SOLID_MAP, ICON_MAP } from '../utils/icons';

type FeedbackVariant = 'error' | 'warning' | 'success' | 'info';

interface FeedbackToastProps {
  variant: FeedbackVariant;
  title: string;
  description?: string;
  onClose?: () => void;
}

const VARIANT_CONFIG = {
  error: {
    bgColor: 'bg-red-100 dark:bg-red-900/90',
    borderColor: 'border-red-200 dark:border-red-800',
    textColor: 'text-red-700 dark:text-red-300',
    icon: ICON_SOLID_MAP.error,
  },
  warning: {
    bgColor: 'bg-amber-100 dark:bg-amber-900/90',
    borderColor: 'border-amber-200 dark:border-amber-800',
    textColor: 'text-dark-gray dark:text-amber-200',
    icon: ICON_SOLID_MAP.warning,
  },
  success: {
    bgColor: 'bg-green-100 dark:bg-green-900/90',
    borderColor: 'border-green-200 dark:border-green-800',
    textColor: 'text-primary dark:text-green-300',
    icon: ICON_SOLID_MAP.success,
  },
  info: {
    bgColor: 'bg-blue-100 dark:bg-blue-900/90',
    borderColor: 'border-blue-200 dark:border-blue-800',
    textColor: 'text-blue-700 dark:text-blue-300',
    icon: ICON_SOLID_MAP.info,
  },
};

export default function FeedbackToast({
  variant,
  title,
  description,
  onClose,
}: FeedbackToastProps) {
  const config = VARIANT_CONFIG[variant];
  const IconComponent = config.icon;
  const CloseIcon = ICON_SOLID_MAP.error; // Using XMarkIcon from outline map

  return (
    <div
      className="fixed bottom-6 inset-x-4 z-50 animate-fade-in-up"
      role="status"
      aria-live="polite"
    >
      <div
        className={`shadow-lg rounded-xl border px-4 py-3 flex items-start gap-3 ${config.bgColor} ${config.borderColor}`}
      >
        <IconComponent 
          className={`h-5 w-5 flex-shrink-0 ${config.textColor}`}
          aria-hidden="true"
        />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${config.textColor} leading-snug`}>
            {title}
          </p>
          {description && (
            <p className={`text-sm mt-1 ${config.textColor} opacity-80 leading-snug`}>
              {description}
            </p>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`${config.textColor} opacity-60 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary rounded`}
            aria-label="Fechar notificação"
          >
            <ICON_MAP.close className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
