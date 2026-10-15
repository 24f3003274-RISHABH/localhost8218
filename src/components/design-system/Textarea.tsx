import React, { TextareaHTMLAttributes, forwardRef, useId } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      error,
      fullWidth = true,
      className = '',
      id,
      disabled,
      rows = 4,
      ...rest
    },
    ref
  ) => {
    const generatedId = useId();
    const textareaId = id || generatedId;
    const errorId = `${textareaId}-error`;
    const helperId = `${textareaId}-helper`;

    const borderStyle = error
      ? 'border-red-500 text-slate-900 focus:border-red-600 focus:ring-1 focus:ring-red-600'
      : 'border-slate-300 text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600';

    return (
      <div className={`${fullWidth ? 'w-full' : 'inline-block'} text-left`}>
        {label && (
          <label htmlFor={textareaId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            {label}
            {rest.required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={`block w-full rounded-lg border bg-white py-2.5 px-3 text-sm placeholder:text-slate-400 transition-colors disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed ${borderStyle} ${className}`.trim()}
          {...rest}
        />
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

Textarea.displayName = 'Textarea';
