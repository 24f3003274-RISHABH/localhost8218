import React, { InputHTMLAttributes, forwardRef, ReactNode, useId } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      fullWidth = true,
      className = '',
      id,
      disabled,
      ...rest
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const borderStyle = error
      ? 'border-red-500 text-slate-900 focus:border-red-600 focus:ring-1 focus:ring-red-600'
      : 'border-slate-300 text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600';

    return (
      <div className={`${fullWidth ? 'w-full' : 'inline-block'} text-left`}>
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            {label}
            {rest.required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
          </label>
        )}
        <div className="relative rounded-lg shadow-xs">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={`block w-full rounded-lg border bg-white py-2.5 px-3 text-sm placeholder:text-slate-400 transition-colors disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed ${leftIcon ? 'pl-9' : ''} ${rightIcon ? 'pr-9' : ''} ${borderStyle} ${className}`.trim()}
            {...rest}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              {rightIcon}
            </div>
          )}
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

Input.displayName = 'Input';
