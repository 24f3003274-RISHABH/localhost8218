import React, { ReactNode } from 'react';
import { SearchX } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = ''
}: EmptyStateProps) {
  return (
    <div
      className={`text-center py-12 px-6 bg-white border border-slate-200/80 rounded-xl flex flex-col items-center justify-center max-w-lg mx-auto ${className}`.trim()}
    >
      <div className="w-12 h-12 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center mb-4">
        {icon || <SearchX className="w-6 h-6 text-slate-400" aria-hidden="true" />}
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 mb-6 max-w-sm leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
