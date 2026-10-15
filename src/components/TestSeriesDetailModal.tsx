import React from 'react';
import { BookOpen, CheckCircle, Clock, Calendar, Check, ExternalLink } from 'lucide-react';
import { TestSeries } from '../types';
import { Modal } from './design-system/Modal';
import { Button } from './design-system/Button';
import { useRouter } from '../router/Router';

export interface TestSeriesDetailModalProps {
  series: TestSeries | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TestSeriesDetailModal({
  series,
  isOpen,
  onClose
}: TestSeriesDetailModalProps) {
  const { navigate } = useRouter();

  if (!series) return null;

  const isFree = series.isFree || series.price === 0;

  const handleAction = () => {
    onClose();
    if (isFree) {
      navigate('/login?flow=free_mock');
    } else {
      navigate(`/pricing?selected=${series.id}`);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={series.title}
      description={`${series.exam} · Paper Code: ${series.subjectCode} · ${series.subject}`}
      maxWidth="lg"
    >
      <div className="space-y-6 text-left">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-lg text-xs">
          <div>
            <span className="text-slate-500 block">Total Mocks</span>
            <span className="font-semibold text-slate-900 text-sm tabular-nums">
              {series.testsCount} Full Tests
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Total Questions</span>
            <span className="font-semibold text-slate-900 text-sm tabular-nums">
              {series.questionsCount || series.testsCount * 75} Questions
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Test Duration</span>
            <span className="font-semibold text-slate-900 text-sm">
              {series.duration || '105 Minutes'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Access Duration</span>
            <span className="font-semibold text-slate-900 text-sm">
              {series.accessDuration}
            </span>
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Curriculum Scope
          </h4>
          <p className="text-sm text-slate-600 leading-relaxed">
            {series.description}
          </p>
        </div>

        {/* Syllabus Topics */}
        <div>
          <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5">
            Syllabus Modules Covered
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
            {series.syllabusTopics.map((topic, index) => (
              <div key={index} className="flex items-start gap-2 bg-slate-50/70 p-2 rounded border border-slate-100">
                <span className="text-blue-600 font-bold shrink-0">•</span>
                <span className="leading-snug">{topic}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Features Checklist */}
        <div>
          <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5">
            Inclusions & Mock Interface
          </h4>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
            {series.features.map((feature, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom Action Strip */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-500">Access Fee</div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-slate-900 tabular-nums">
                {isFree ? 'Free Access' : `₹${series.price}`}
              </span>
              {series.originalPrice && !isFree && (
                <span className="text-xs text-slate-400 line-through tabular-nums">
                  ₹{series.originalPrice}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" size="md" onClick={onClose} fullWidth className="sm:w-auto">
              Close
            </Button>
            <Button
              variant={isFree ? 'secondary' : 'primary'}
              size="md"
              onClick={handleAction}
              fullWidth
              className="sm:w-auto"
            >
              {isFree ? 'Start Free Diagnostic Mock' : 'Enroll in Test Series'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
