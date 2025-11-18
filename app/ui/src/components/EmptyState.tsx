// app/ui/src/components/EmptyState.tsx
import ContainedButton from "./ContainedButton";
import React from "react";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <div className="text-text-light-secondary dark:text-text-dark-secondary">
        {React.cloneElement(icon as React.ReactElement, {
          className: "h-12 w-12",
          "aria-hidden": "true",
        })}
      </div>
      <h2 className="text-sm font-bold text-text-light-primary dark:text-text-dark-primary">
        {title}
      </h2>
      <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary text-center px-8">
        {description}
      </p>
      {action && (
        <ContainedButton
          onClick={action.onClick}
          variant="primary"
          size="medium"
          icon={action.icon}
        >
          {action.label}
        </ContainedButton>
      )}
    </div>
  );
}
