// app/ui/src/components/FilledSelectField.tsx
import { useState } from "react";
import { ICON_MAP } from "../utils/icons";

interface FilledSelectFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  options: Array<{ value: string | number; label: string }>;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  helpText?: string;
  className?: string;
}

export default function FilledSelectField({
  label,
  value,
  onChange,
  options,
  placeholder = "Selecione...",
  required = false,
  disabled = false,
  error = false,
  errorMessage,
  helpText,
  className = "",
}: FilledSelectFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  const showError = error && errorMessage;
  const showHelpText = !showError && helpText;

  const labelColor = disabled
    ? "text-gray-400 dark:text-gray-600"
    : showError
      ? "text-red-600 dark:text-red-400"
      : isFocused
        ? "text-primary dark:text-primary"
        : "text-gray-700 dark:text-gray-300";

  const selectBgColor = disabled
    ? "bg-gray-50 dark:bg-gray-800"
    : showError
      ? "bg-red-50 dark:bg-red-900/20"
      : "bg-gray-100 dark:bg-gray-700";

  const borderColor = disabled
    ? "border-gray-200 dark:border-gray-700"
    : showError
      ? "border-red-500 dark:border-red-400"
      : isFocused
        ? "border-primary dark:border-primary border-2"
        : "border-gray-300 dark:border-gray-600";

  const textColor = disabled
    ? "text-gray-400 dark:text-gray-600"
    : showError
      ? "text-red-600 dark:text-red-400"
      : "text-gray-900 dark:text-gray-100";

  const helpTextColor = disabled
    ? "text-gray-400 dark:text-gray-600"
    : showError
      ? "text-red-600 dark:text-red-400"
      : isFocused
        ? "text-primary dark:text-primary"
        : "text-gray-500 dark:text-gray-400";

  return (
    <div className={`flex flex-col ${className}`}>
      <label className={`text-sm font-medium mb-1 ${labelColor}`}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          required={required}
          disabled={disabled}
          className={`
            w-full px-4 py-3 rounded-t-lg rounded-b-none appearance-none
            ${selectBgColor}
            ${borderColor}
            border-b-2 border-x-0 border-t-0
            ${textColor}
            text-sm font-normal
            focus:outline-none focus:ring-0
            transition-colors
            ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
            pr-10
          `}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <ICON_MAP.chevronDown
            className="h-5 w-5 text-gray-500 dark:text-gray-400"
            aria-hidden="true"
          />
        </div>
      </div>
      {(showHelpText || showError) && (
        <p className={`text-xs mt-1 ${helpTextColor}`}>
          {showError ? errorMessage : helpText}
        </p>
      )}
    </div>
  );
}
