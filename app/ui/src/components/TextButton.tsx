// app/ui/src/components/TextButton.tsx
import React from "react";

interface TextButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  variant?: "primary" | "secondary";
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
}

const TextButton = React.forwardRef<HTMLButtonElement, TextButtonProps>(
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
      bg-transparent
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
        text-primary
        hover:bg-primary/[0.08]
        focus-visible:ring-primary
        active:bg-primary/[0.12]
        disabled:text-gray-400 dark:disabled:text-gray-500
      `,
      secondary: `
        text-text-light-primary dark:text-text-dark-primary
        hover:bg-card-dark/[0.08] dark:hover:bg-card-light/[0.08]
        focus-visible:ring-primary
        active:bg-card-dark/[0.12] dark:active:bg-card-light/[0.12]
        disabled:text-gray-400 dark:disabled:text-gray-500
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
          className="absolute inset-0 bg-primary opacity-0 hover:opacity-[0.08] focus:opacity-[0.12] active:opacity-[0.16] transition-opacity duration-150"
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

TextButton.displayName = "TextButton";

export default TextButton;
