// app/ui/src/components/FeedbackBanner.tsx
import { ReactNode } from "react";
import { ICON_SOLID_MAP, ICON_MAP } from "../utils/icons";

type FeedbackVariant = "error" | "warning" | "success" | "info";

interface FeedbackBannerProps {
  variant: FeedbackVariant;
  message: string;
  description?: string;
  actions?: ReactNode;
  onClose?: () => void;
}

const VARIANT_CONFIG = {
  error: {
    bgColor: "bg-red-100 dark:bg-red-900/20",
    borderColor: "border-red-200 dark:border-red-800",
    textColor: "text-red-700 dark:text-red-400",
    icon: ICON_SOLID_MAP.error,
    role: "alert" as const,
  },
  warning: {
    bgColor: "bg-amber-100 dark:bg-amber-900/20",
    borderColor: "border-amber-200 dark:border-amber-800",
    textColor: "text-dark-gray dark:text-amber-300",
    icon: ICON_SOLID_MAP.warning,
    role: "status" as const,
  },
  success: {
    bgColor: "bg-green-100 dark:bg-green-900/20",
    borderColor: "border-green-200 dark:border-green-800",
    textColor: "text-primary dark:text-green-400",
    icon: ICON_SOLID_MAP.success,
    role: "status" as const,
  },
  info: {
    bgColor: "bg-blue-100 dark:bg-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800",
    textColor: "text-blue-700 dark:text-blue-400",
    icon: ICON_SOLID_MAP.info,
    role: "status" as const,
  },
};

export default function FeedbackBanner({
  variant,
  message,
  description,
  actions,
  onClose,
}: FeedbackBannerProps) {
  const config = VARIANT_CONFIG[variant];
  const IconComponent = config.icon;

  return (
    <div
      className={`rounded-lg border p-4 flex items-start gap-3 ${config.bgColor} ${config.borderColor}`}
      role={config.role}
      aria-live="polite"
    >
      <IconComponent
        className={`h-5 w-5 flex-shrink-0 ${config.textColor}`}
        aria-hidden="true"
      />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${config.textColor} leading-snug`}>
          {message}
        </p>
        {description && (
          <p
            className={`text-sm mt-1 ${config.textColor} opacity-80 leading-snug`}
          >
            {description}
          </p>
        )}
        {actions && <div className="mt-3 flex flex-wrap gap-2">{actions}</div>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={`${config.textColor} opacity-60 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary rounded`}
          aria-label="Fechar mensagem"
        >
          <ICON_MAP.close className="h-5 w-5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
