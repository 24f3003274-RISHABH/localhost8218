import React, { useState, useEffect } from 'react';
import { 
  BookOpen, ChevronRight, ChevronDown, Clock, 
  Award, ShieldCheck, ArrowRight, Layers, FileText, CheckCircle2 
} from 'lucide-react';
import { 
  SubjectRow, 
  ChapterRow, 
  TestCategoryRow, 
  TestRow, 
  SubjectWithChapters 
} from '../types/database';
import { fetchSubjectHierarchy } from '../lib/api/contentHierarchy';
import { Card, CardHeader, CardContent } from './design-system/Card';
import { Button } from './design-system/Button';
import { Badge } from './design-system/Badge';
import { Skeleton } from './design-system/Skeleton';
import { EmptyState } from './design-system/EmptyState';

interface SubjectHierarchyViewProps {
  subject: SubjectRow;
  onClose?: () => void;
  onSelectTest?: (test: TestRow) => void;
}

export function SubjectHierarchyView({
  subject,
  onClose,
  onSelectTest
}: SubjectHierarchyViewProps) {
  const [loading, setLoading] = useState(true);
  const [hierarchy, setHierarchy] = useState<SubjectWithChapters | null>(null);
  const [expandedChapterId, setExpandedChapterId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadHierarchy() {
      setLoading(true);
      const data = await fetchSubjectHierarchy(subject.slug);
      if (isMounted) {
        setHierarchy(data);
        if (data && data.chapters.length > 0) {
          // Default expand first chapter
          setExpandedChapterId(data.chapters[0].id);
        }
        setLoading(false);
      }
    }
    loadHierarchy();
    return () => { isMounted = false; };
  }, [subject.slug]);

  if (loading) {
    return (
      <div className="space-y-4 py-4">
        <div className="h-6 w-48 bg-slate-200 rounded animate-pulse mb-4" />
        <div className="space-y-3">
          <Skeleton variant="card" height="100px" />
          <Skeleton variant="card" height="100px" />
          <Skeleton variant="card" height="100px" />
        </div>
      </div>
    );
  }

  if (!hierarchy) {
    return (
      <EmptyState
        title="Curriculum data unavailable"
        description="Could not load chapters and test categories for this subject."
      />
    );
  }

  const toggleChapter = (chapterId: string) => {
    setExpandedChapterId(prev => prev === chapterId ? null : chapterId);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Subject Header & Official NTA Parameters */}
      <div className="bg-slate-900 text-white rounded-xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-blue-400">
            <span>Examination: CUET PG</span>
            <span aria-hidden="true" className="text-slate-600">/</span>
            <span className="font-mono text-slate-300">{subject.code}</span>
          </div>

          <Badge variant="neutral" styleType="tag" className="bg-slate-800 text-slate-300 border-slate-700">
            Official NTA Curriculum
          </Badge>
        </div>

        <div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {subject.name}
          </h3>
          {subject.description && (
            <p className="mt-1 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
              {subject.description}
            </p>
          )}
        </div>

        {/* Hierarchy Breadcrumb Spec Strip */}
        <div className="pt-3 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-300">
          <div>
            <span className="text-slate-400 block text-[11px]">Domain Questions</span>
            <strong className="text-sm text-white tabular-nums">{subject.total_domain_questions} MCQs</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Duration</span>
            <strong className="text-sm text-white tabular-nums">{subject.duration_minutes} Minutes</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Marking Rules</span>
            <strong className="text-sm text-white tabular-nums">+{subject.marking_correct} / {subject.marking_incorrect} Negative</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Syllabus Units</span>
            <strong className="text-sm text-white tabular-nums">{hierarchy.chapters.length} Chapters</strong>
          </div>
        </div>
      </div>

      {/* 1. SUBJECT-LEVEL TESTS (Where chapter_id is null) */}
      {hierarchy.subject_level_tests.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" aria-hidden="true" />
              <span>Full Subject-Level Mock Tests ({hierarchy.subject_level_tests.length})</span>
            </h4>
            <span className="text-xs text-slate-500">Comprehensive Syllabus Mocks</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {hierarchy.subject_level_tests.map((test) => (
              <div
                key={test.id}
                className="bg-white border border-slate-200/90 rounded-xl p-4 flex flex-col justify-between hover:border-blue-300 transition-colors shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5 text-xs">
                    <span className="font-semibold text-blue-700">
                      {test.category?.name || 'Full-Length Test'}
                    </span>
                    <Badge variant={test.access_type === 'free' ? 'success' : 'neutral'} styleType="tag">
                      {test.access_type === 'free' ? 'Free Access' : 'Enrolled Pass'}
                    </Badge>
                  </div>
                  <h5 className="font-bold text-slate-900 text-sm">{test.title}</h5>
                  {test.description && (
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      {test.description}
                    </p>
                  )}
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{Math.round(test.duration_seconds / 60)} Mins</span>
                    <span aria-hidden="true">·</span>
                    <span>+{test.positive_marks_default} / -{test.negative_marks_default}</span>
                  </div>

                  {onSelectTest && (
                    <button
                      type="button"
                      onClick={() => onSelectTest(test)}
                      className="font-semibold text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <span>Inspect Test</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. CHAPTER HIERARCHY ACCORDION */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" aria-hidden="true" />
            <span>Curriculum Chapters & Configured Test Categories</span>
          </h4>
          <span className="text-xs text-slate-500">
            {hierarchy.chapters.length} Active Chapters
          </span>
        </div>

        <div className="space-y-2.5">
          {hierarchy.chapters.map((chapter) => {
            const isExpanded = expandedChapterId === chapter.id;
            const totalChapterTests = chapter.categories.reduce((acc, cat) => acc + cat.tests.length, 0);

            return (
              <div
                key={chapter.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs transition-colors"
              >
                {/* Chapter Row Header */}
                <button
                  type="button"
                  onClick={() => toggleChapter(chapter.id)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors cursor-pointer"
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                      {chapter.display_order}
                    </span>
                    <div>
                      <h5 className="text-sm font-bold text-slate-900 leading-snug">
                        {chapter.title}
                      </h5>
                      {chapter.description && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                          {chapter.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-slate-500 hidden sm:inline tabular-nums">
                      {totalChapterTests} {totalChapterTests === 1 ? 'Test' : 'Tests'} Active
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                </button>

                {/* Expanded Categories & Tests */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-100 bg-slate-50/40 space-y-4">
                    {chapter.categories.map((cat) => (
                      <div key={cat.id} className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                            <span>{cat.name}</span>
                            <span className="text-slate-400">·</span>
                            <span className="font-normal text-slate-500">
                              Config: {Math.round(cat.default_duration_seconds / 60)} Mins (Target: {cat.default_test_count})
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 tabular-nums">
                            {cat.tests.length} available
                          </span>
                        </div>

                        {cat.tests.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {cat.tests.map((test) => (
                              <div
                                key={test.id}
                                className="bg-white border border-slate-200 rounded-lg p-3 text-xs flex items-center justify-between gap-2 hover:border-slate-300 transition-colors"
                              >
                                <div>
                                  <strong className="text-slate-900 block leading-snug">
                                    {test.title}
                                  </strong>
                                  <span className="text-slate-500 text-[11px] mt-0.5 block">
                                    {Math.round(test.duration_seconds / 60)} mins · +{test.positive_marks_default}/-{test.negative_marks_default} marks
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <Badge variant={test.access_type === 'free' ? 'success' : 'neutral'} styleType="tag">
                                    {test.access_type === 'free' ? 'Free' : 'Paid'}
                                  </Badge>
                                  {onSelectTest && (
                                    <button
                                      type="button"
                                      onClick={() => onSelectTest(test)}
                                      className="p-1 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900 cursor-pointer"
                                      aria-label={`View ${test.title}`}
                                    >
                                      <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-3 bg-white/60 border border-dashed border-slate-200 rounded-lg text-xs text-slate-500 text-center">
                            <span>No tests published in this category yet. Content administrators can configure tests for this chapter.</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
