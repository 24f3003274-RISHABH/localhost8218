import React, { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './Button';

export interface ErrorMessageProps {
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  icon?: ReactNode;
}

export function ErrorMessage({
  title = 'Something went wrong',
  message,
  actionLabel,
  onAction,
  className = '',
  icon
}: ErrorMessageProps) {
  return (
    <div
      role="alert"
      className={`rounded-xl border border-red-200 bg-red-50/60 p-4 sm:p-5 text-left flex items-start gap-3.5 ${className}`.trim()}
    >
      <div className="text-red-600 shrink-0 mt-0.5">
        {icon || <AlertCircle className="w-5 h-5" aria-hidden="true" />}
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-red-900">{title}</h4>
        <p className="mt-1 text-xs sm:text-sm text-red-700 leading-relaxed">{message}</p>
        {actionLabel && onAction && (
          <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onAction}
              className="bg-white border-red-200 text-red-800 hover:bg-red-50"
            >
              {actionLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
