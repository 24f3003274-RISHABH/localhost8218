import React, { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'text';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      disabled,
      type = 'button',
      ...rest
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2';

    const variantStyles: Record<ButtonVariant, string> = {
      primary: 'bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 border border-transparent',
      secondary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 border border-transparent',
      outline: 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100',
      ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 active:bg-slate-200 border border-transparent',
      text: 'bg-transparent text-blue-600 hover:text-blue-800 hover:underline underline-offset-4 border-0 p-0 shadow-none'
    };

    const sizeStyles: Record<ButtonSize, string> = {
      sm: 'text-xs px-3 py-1.5 gap-1.5 min-h-[36px]',
      md: 'text-sm px-4 py-2.5 gap-2 min-h-[42px]',
      lg: 'text-base px-5 py-3 gap-2.5 min-h-[48px]'
    };

    const widthStyle = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variantStyles[variant]} ${variant !== 'text' ? sizeStyles[size] : 'gap-1.5'} ${widthStyle} ${className}`.trim()}
        {...rest}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
