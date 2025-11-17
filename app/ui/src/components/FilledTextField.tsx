// app/ui/src/components/FilledTextField.tsx
import { useState, useRef } from 'react';

interface FilledTextFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: 'text' | 'number' | 'email' | 'password' | 'tel';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  helpText?: string;
  suffixText?: string;
  maxLength?: number;
  inputMode?: 'text' | 'numeric' | 'decimal' | 'email' | 'tel';
  className?: string;
  onBlur?: () => void;
}

export default function FilledTextField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  error = false,
  errorMessage,
  helpText,
  suffixText,
  maxLength,
  inputMode,
  className = '',
  onBlur,
}: FilledTextFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const displayValue = type === 'number' ? (value || '') : String(value || '');
  const currentLength = String(value || '').length;
  const showSuffix = suffixText || (maxLength ? `${currentLength}/${maxLength}` : null);
  const showError = error && errorMessage;
  const showHelpText = !showError && helpText;

  const labelColor = disabled
    ? 'text-gray-400 dark:text-gray-600'
    : showError
    ? 'text-red-600 dark:text-red-400'
    : isFocused
    ? 'text-primary dark:text-primary'
    : 'text-gray-700 dark:text-gray-300';

  const inputBgColor = disabled
    ? 'bg-gray-50 dark:bg-gray-800'
    : showError
    ? 'bg-red-50 dark:bg-red-900/20'
    : 'bg-gray-100 dark:bg-gray-700';

  const borderColor = disabled
    ? 'border-gray-200 dark:border-gray-700'
    : showError
    ? 'border-red-500 dark:border-red-400'
    : isFocused
    ? 'border-primary dark:border-primary border-2'
    : 'border-gray-300 dark:border-gray-600';

  const textColor = disabled
    ? 'text-gray-400 dark:text-gray-600'
    : showError
    ? 'text-red-600 dark:text-red-400'
    : 'text-gray-900 dark:text-gray-100';

  const suffixColor = disabled
    ? 'text-gray-300 dark:text-gray-700'
    : showError
    ? 'text-red-500 dark:text-red-400'
    : 'text-gray-500 dark:text-gray-400';

  const helpTextColor = disabled
    ? 'text-gray-400 dark:text-gray-600'
    : showError
    ? 'text-red-600 dark:text-red-400'
    : isFocused
    ? 'text-primary dark:text-primary'
    : 'text-gray-500 dark:text-gray-400';

  return (
    <div className={`flex flex-col ${className}`}>
      <label className={`text-sm font-medium mb-1 ${labelColor}`}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type={type}
          value={displayValue}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={() => {
            handleBlur();
            if (onBlur) onBlur();
          }}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          maxLength={maxLength}
          inputMode={inputMode}
          className={`
            w-full px-4 py-3 rounded-t-lg rounded-b-none
            ${inputBgColor}
            ${borderColor}
            border-b-2 border-x-0 border-t-0
            ${textColor}
            text-sm font-normal
            focus:outline-none focus:ring-0
            transition-colors
            ${disabled ? 'cursor-not-allowed' : ''}
            ${suffixText || maxLength ? 'pr-20' : ''}
          `}
        />
        {showSuffix && (
          <div className={`absolute right-4 top-1/2 -translate-y-1/2 text-sm ${suffixColor}`}>
            {showSuffix}
          </div>
        )}
      </div>
      {(showHelpText || showError) && (
        <p className={`text-xs mt-1 ${helpTextColor}`}>
          {showError ? errorMessage : helpText}
        </p>
      )}
    </div>
  );
}

