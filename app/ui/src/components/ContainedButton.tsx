// app/ui/src/components/ContainedButton.tsx
import React from "react";

interface ContainedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  variant?: "primary" | "secondary";
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
}

const ContainedButton = React.forwardRef<
  HTMLButtonElement,
  ContainedButtonProps
>(
  (
    {
      children,
      icon,
      iconPosition = "left",
      variant = "primary",
      size = "medium",
      fullWidth = false,
      disabled,
      className = "",
      ...props
    },
    ref,
  ) => {
    const baseClasses = `
      inline-flex items-center justify-center gap-2
      font-medium uppercase tracking-wide
      transition-all duration-150 ease-out
      focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
      disabled:pointer-events-none disabled:opacity-[0.38]
      relative overflow-hidden
    `;

    const sizeClasses = {
      small: "h-8 px-3 text-xs rounded-md",
      medium: "h-10 px-4 text-sm rounded-md",
      large: "h-12 px-6 text-base rounded-md",
    };

    const variantClasses = {
      primary: `
        bg-primary text-white
        shadow-md
        hover:shadow-lg hover:bg-primary/90
        focus-visible:ring-primary
        active:shadow-sm active:bg-primary/95
      `,
      secondary: `
        bg-card-dark dark:bg-card-light
        text-text-dark-primary dark:text-text-light-primary
        shadow-sm
        hover:shadow-md hover:bg-opacity-90
        focus-visible:ring-primary
        active:shadow-sm active:bg-opacity-95
      `,
    };

    const widthClass = fullWidth ? "w-full" : "";

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`
          ${baseClasses}
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${widthClass}
          ${className}
        `
          .trim()
          .replace(/\s+/g, " ")}
        {...props}
      >
        {/* Ripple effect overlay */}
        <span
          className="absolute inset-0 bg-white opacity-0 hover:opacity-[0.08] active:opacity-[0.12] transition-opacity duration-150"
          aria-hidden="true"
        />

        {/* Content */}
        <span className="relative z-10 flex items-center gap-2">
          {icon && iconPosition === "left" && icon}
          <span>{children}</span>
          {icon && iconPosition === "right" && icon}
        </span>
      </button>
    );
  },
);

ContainedButton.displayName = "ContainedButton";

export default ContainedButton;
