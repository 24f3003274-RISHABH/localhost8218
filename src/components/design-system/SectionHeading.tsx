import React, { HTMLAttributes, forwardRef, ReactNode } from 'react';

export interface SectionHeadingProps extends HTMLAttributes<HTMLDivElement> {
  kicker?: string;
  title: string;
  description?: ReactNode;
  align?: 'left' | 'center';
}

export const SectionHeading = forwardRef<HTMLDivElement, SectionHeadingProps>(
  ({ kicker, title, description, align = 'left', className = '', ...rest }, ref) => {
    const alignmentClasses = align === 'center' ? 'text-center mx-auto items-center' : 'text-left items-start';

    return (
      <div ref={ref} className={`flex flex-col max-w-3xl ${alignmentClasses} ${className}`.trim()} {...rest}>
        {kicker && (
          <span className="text-xs font-semibold tracking-wider uppercase text-blue-600 mb-2">
            {kicker}
          </span>
        )}
        <h2
          className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 leading-tight"
          style={{ textWrap: 'balance' } as React.CSSProperties}
        >
          {title}
        </h2>
        {description && (
          <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
            {description}
          </p>
        )}
      </div>
    );
  }
);

SectionHeading.displayName = 'SectionHeading';
