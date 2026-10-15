import React from 'react';
import { BookOpen, Clock, Calendar, CheckCircle, ArrowRight } from 'lucide-react';
import { TestSeries } from '../types';
import { Card, CardHeader, CardContent, CardFooter } from './design-system/Card';
import { Button } from './design-system/Button';
import { Badge } from './design-system/Badge';

export interface TestSeriesCardProps {
  series: TestSeries;
  onViewDetails: (series: TestSeries) => void;
  onSelectAction?: (series: TestSeries) => void;
}

export function TestSeriesCard({
  series,
  onViewDetails,
  onSelectAction
}: TestSeriesCardProps) {
  const isFree = series.isFree || series.price === 0;

  return (
    <Card className="flex flex-col justify-between h-full hover:border-slate-300 transition-all duration-150">
      <CardHeader>
        {/* Top metadata line: Examination & Status */}
        <div className="flex items-center justify-between gap-2 mb-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <span>{series.exam}</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="font-mono text-slate-700">{series.subjectCode}</span>
          </div>
          {isFree ? (
            <Badge variant="success" styleType="tag">
              Free Access
            </Badge>
          ) : (
            <Badge variant="neutral" styleType="tag">
              Official Syllabus
            </Badge>
          )}
        </div>

        {/* Card Title */}
        <h3 className="text-lg font-bold text-slate-900 leading-snug line-clamp-2">
          {series.title}
        </h3>

        {/* Subject line */}
        <p className="text-xs text-blue-700 font-medium mt-1 line-clamp-1">
          {series.subject}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
          {series.description}
        </p>

        {/* Structured Spec Grid (Tests count, questions, validity) */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
            <span>
              <strong className="font-semibold text-slate-900 tabular-nums">{series.testsCount}</strong> Mocks
            </span>
          </div>

          {series.questionsCount && (
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
              <span>
                <strong className="font-semibold text-slate-900 tabular-nums">{series.questionsCount}</strong> MCQs
              </span>
            </div>
          )}

          {series.duration && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
              <span className="truncate">{series.duration}</span>
            </div>
          )}

          {series.accessDuration && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
              <span className="truncate" title={series.accessDuration}>
                {series.accessDuration}
              </span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="bg-slate-50/50">
        {/* Pricing Zone */}
        <div className="flex flex-col text-left">
          {isFree ? (
            <span className="text-base font-bold text-emerald-700">₹0 (Free)</span>
          ) : (
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-slate-900 tabular-nums">
                ₹{series.price}
              </span>
              {series.originalPrice && (
                <span className="text-xs text-slate-400 line-through tabular-nums">
                  ₹{series.originalPrice}
                </span>
              )}
            </div>
          )}
          <span className="text-[11px] text-slate-500">
            {isFree ? 'No card required' : 'One-time test pass'}
          </span>
        </div>

        {/* View Details Action */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(series)}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />}
          >
            View Details
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
