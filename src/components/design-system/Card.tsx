import React, { HTMLAttributes, forwardRef, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'subtle';
  children: ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, variant = 'default', className = '', ...rest }, ref) => {
    const variantStyles = {
      default: 'bg-white border border-slate-200/80 shadow-xs',
      elevated: 'bg-white border border-slate-200 shadow-sm',
      subtle: 'bg-slate-50 border border-slate-200/60'
    };

    return (
      <div
        ref={ref}
        className={`rounded-xl transition-all ${variantStyles[variant]} ${className}`.trim()}
        {...rest}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ children, className = '', ...rest }, ref) => (
    <div ref={ref} className={`p-6 pb-4 ${className}`.trim()} {...rest}>
      {children}
    </div>
  )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ children, className = '', ...rest }, ref) => (
    <h3
      ref={ref}
      className={`text-lg font-semibold tracking-tight text-slate-900 ${className}`.trim()}
      {...rest}
    >
      {children}
    </h3>
  )
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ children, className = '', ...rest }, ref) => (
    <p
      ref={ref}
      className={`text-sm text-slate-500 mt-1 leading-relaxed ${className}`.trim()}
      {...rest}
    >
      {children}
    </p>
  )
);
CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ children, className = '', ...rest }, ref) => (
    <div ref={ref} className={`p-6 pt-0 ${className}`.trim()} {...rest}>
      {children}
    </div>
  )
);
CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ children, className = '', ...rest }, ref) => (
    <div
      ref={ref}
      className={`p-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-4 ${className}`.trim()}
      {...rest}
    >
      {children}
    </div>
  )
);
CardFooter.displayName = 'CardFooter';
