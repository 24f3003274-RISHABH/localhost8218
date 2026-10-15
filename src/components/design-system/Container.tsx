import React, { HTMLAttributes, forwardRef, ReactNode } from 'react';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  size?: 'default' | 'narrow' | 'wide' | 'full';
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ children, size = 'default', className = '', ...rest }, ref) => {
    const sizeClasses = {
      narrow: 'max-w-4xl',
      default: 'max-w-7xl',
      wide: 'max-w-(--breakpoint-2xl)',
      full: 'w-full'
    };

    return (
      <div
        ref={ref}
        className={`mx-auto px-4 sm:px-6 lg:px-8 w-full ${sizeClasses[size]} ${className}`.trim()}
        {...rest}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = 'Container';
