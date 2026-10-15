import React, { HTMLAttributes } from 'react';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'rectangular' | 'card';
  width?: string;
  height?: string;
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  className = '',
  style,
  ...rest
}: SkeletonProps) {
  const base = 'animate-pulse bg-slate-200/80 rounded';

  const variantStyles = {
    text: 'h-4 w-full rounded',
    rectangular: 'h-24 w-full rounded-lg',
    card: 'h-64 w-full rounded-xl border border-slate-200 p-6'
  };

  const inlineStyles: React.CSSProperties = {
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
    ...style
  };

  return (
    <div
      className={`${base} ${variantStyles[variant]} ${className}`.trim()}
      style={inlineStyles}
      aria-hidden="true"
      {...rest}
    />
  );
}

export function TestSeriesCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between h-[360px] animate-pulse">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 w-28 bg-slate-200 rounded" />
          <div className="h-4 w-16 bg-slate-200 rounded" />
        </div>
        <div className="h-6 w-3/4 bg-slate-200 rounded mb-2" />
        <div className="h-4 w-1/2 bg-slate-200 rounded mb-4" />
        <div className="space-y-2 mb-6">
          <div className="h-3.5 w-full bg-slate-100 rounded" />
          <div className="h-3.5 w-5/6 bg-slate-100 rounded" />
        </div>
      </div>
      <div>
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="h-6 w-20 bg-slate-200 rounded" />
          <div className="h-9 w-28 bg-slate-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
