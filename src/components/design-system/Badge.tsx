import React, { HTMLAttributes, forwardRef, ReactNode } from 'react';

export type BadgeVariant = 'neutral' | 'success' | 'info' | 'warning';
export type BadgeStyle = 'unboxed' | 'tag';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  styleType?: BadgeStyle;
  children: ReactNode;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ children, variant = 'neutral', styleType = 'unboxed', className = '', ...rest }, ref) => {
    // Zero-pill discipline: Unboxed text with subtle typographic dot/dash, or subtle rectangular tag with sharp/4px radius
    if (styleType === 'unboxed') {
      const colorMap: Record<BadgeVariant, string> = {
        neutral: 'text-slate-600',
        success: 'text-emerald-700 font-medium',
        info: 'text-blue-700 font-medium',
        warning: 'text-amber-800 font-medium'
      };

      return (
        <span
          ref={ref}
          className={`inline-flex items-center text-xs tracking-tight ${colorMap[variant]} ${className}`.trim()}
          {...rest}
        >
          {children}
        </span>
      );
    }

    // Subtle rectangular tag variant (NOT rounded-full pill)
    const tagStyles: Record<BadgeVariant, string> = {
      neutral: 'bg-slate-100 text-slate-700 border-slate-200',
      success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      info: 'bg-blue-50 text-blue-800 border-blue-200',
      warning: 'bg-amber-50 text-amber-800 border-amber-200'
    };

    return (
      <span
        ref={ref}
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${tagStyles[variant]} ${className}`.trim()}
        {...rest}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
