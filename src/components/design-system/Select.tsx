import React, { SelectHTMLAttributes, forwardRef, ReactNode, useId } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options?: SelectOption[];
  children?: ReactNode;
  fullWidth?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      helperText,
      error,
      options,
      children,
      fullWidth = true,
      className = '',
      id,
      disabled,
      ...rest
    },
    ref
  ) => {
    const generatedId = useId();
    const selectId = id || generatedId;
    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;

    const borderStyle = error
      ? 'border-red-500 text-slate-900 focus:border-red-600 focus:ring-1 focus:ring-red-600'
      : 'border-slate-300 text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600';

    return (
      <div className={`${fullWidth ? 'w-full' : 'inline-block'} text-left`}>
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            {label}
            {rest.required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
          </label>
        )}
        <div className="relative rounded-lg shadow-xs">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={`block w-full appearance-none rounded-lg border bg-white py-2.5 pl-3 pr-10 text-sm placeholder:text-slate-400 transition-colors disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed ${borderStyle} ${className}`.trim()}
            {...rest}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
            <ChevronDown className="w-4 h-4" aria-hidden="true" />
          </div>
        </div>
        {error ? (
          <p id={errorId} className="mt-1 text-xs text-red-600 font-medium" role="alert">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="mt-1 text-xs text-slate-500">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
