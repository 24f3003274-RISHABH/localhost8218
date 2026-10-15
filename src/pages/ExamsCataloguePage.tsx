import React, { useState, useEffect, useMemo } from 'react';
import { Search, BookOpen, Layers, Filter, ChevronRight, X, ShieldCheck } from 'lucide-react';
import { TEST_SERIES_CATALOGUE } from '../data/testSeriesData';
import { TestSeries, ExamCategory } from '../types';
import { SubjectRow, ExaminationRow, TestCategoryRow, TestRow } from '../types/database';
import { fetchExaminations, fetchSubjects, fetchTestCategories } from '../lib/api/contentHierarchy';
import { Container } from '../components/design-system/Container';
import { SectionHeading } from '../components/design-system/SectionHeading';
import { Input } from '../components/design-system/Input';
import { EmptyState } from '../components/design-system/EmptyState';
import { TestSeriesCard } from '../components/TestSeriesCard';
import { TestSeriesDetailModal } from '../components/TestSeriesDetailModal';
import { SubjectHierarchyView } from '../components/SubjectHierarchyView';
import { Modal } from '../components/design-system/Modal';
import { Badge } from '../components/design-system/Badge';
import { Button } from '../components/design-system/Button';
import { useRouter } from '../router/Router';

export function ExamsCataloguePage() {
  const { searchParams } = useRouter();
  const initialCategory = (searchParams.get('category') as ExamCategory) || 'All';
  const initialPricing = searchParams.get('filter') === 'free' ? 'free' : 'all';

  const [activeTab, setActiveTab] = useState<'packages' | 'hierarchy'>('hierarchy');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExamCategory | string>(initialCategory);
  const [pricingFilter, setPricingFilter] = useState<'all' | 'free' | 'paid'>(initialPricing);
  const [selectedSeries, setSelectedSeries] = useState<TestSeries | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Database hierarchy state
  const [examinations, setExaminations] = useState<ExaminationRow[]>([]);
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [testCategories, setTestCategories] = useState<TestCategoryRow[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<SubjectRow | null>(null);
  const [hierarchyModalOpen, setHierarchyModalOpen] = useState(false);
  const [selectedTestDetail, setSelectedTestDetail] = useState<TestRow | null>(null);

  // Load database entities
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      const [examsData, subjectsData, categoriesData] = await Promise.all([
        fetchExaminations(),
        fetchSubjects(),
        fetchTestCategories()
      ]);
      if (mounted) {
        setExaminations(examsData);
        setSubjects(subjectsData);
        setTestCategories(categoriesData);

        // Check if query param specifies subject
        const querySubSlug = searchParams.get('subject');
        if (querySubSlug) {
          const match = subjectsData.find(s => s.slug === querySubSlug);
          if (match) {
            setSelectedSubject(match);
            setHierarchyModalOpen(true);
            setActiveTab('hierarchy');
          }
        }
      }
    }
    loadData();
    return () => { mounted = false; };
  }, [searchParams]);

  const categories: (ExamCategory | 'All')[] = [
    'All',
    'Computer Science & Tech',
    'Science',
    'Commerce & Management',
    'Humanities & Social Sciences'
  ];

  // Filtered packages
  const filteredSeries = useMemo(() => {
    return TEST_SERIES_CATALOGUE.filter((item) => {
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }
      if (pricingFilter === 'free' && !item.isFree && item.price !== 0) {
        return false;
      }
      if (pricingFilter === 'paid' && (item.isFree || item.price === 0)) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesSubject = item.subject.toLowerCase().includes(query);
        const matchesCode = item.subjectCode.toLowerCase().includes(query);
        const matchesTopics = item.syllabusTopics.some((t) => t.toLowerCase().includes(query));
        return matchesTitle || matchesSubject || matchesCode || matchesTopics;
      }
      return true;
    });
  }, [selectedCategory, pricingFilter, searchQuery]);

  // Filtered subjects from database
  const filteredSubjects = useMemo(() => {
    return subjects.filter((s) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q))
      );
    });
  }, [subjects, searchQuery]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setPricingFilter('all');
  };

  const handleViewDetails = (series: TestSeries) => {
    setSelectedSeries(series);
    setModalOpen(true);
  };

  const handleOpenSubjectHierarchy = (subject: SubjectRow) => {
    setSelectedSubject(subject);
    setHierarchyModalOpen(true);
  };

  return (
    <div className="py-8 sm:py-12 space-y-8 text-left">
      <Container>
        {/* Header */}
        <div className="border-b border-slate-200 pb-8">
          <SectionHeading
            kicker="Examination Catalogue & Curriculum"
            title="CUET PG Subjects, Chapters & Mock Tests"
            description="Explore normalized subject hierarchies, chapter-specific sectional tests, full-length mocks, and previous year papers aligned with official NTA standards."
          />

          {/* Mode Switcher Tabs */}
          <div className="mt-6 inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('hierarchy')}
              className={`px-4 py-2 rounded-md transition-colors cursor-pointer ${
                activeTab === 'hierarchy'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Curriculum & Chapter Hierarchy ({subjects.length} Core Subjects)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('packages')}
              className={`px-4 py-2 rounded-md transition-colors cursor-pointer ${
                activeTab === 'packages'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Curated Test Series Packages ({TEST_SERIES_CATALOGUE.length})
            </button>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* TAB 1: CURRICULUM & SUBJECT HIERARCHY (PART 1, 2, 3 REQUIREMENT)     */}
        {/* ==================================================================== */}
        {activeTab === 'hierarchy' && (
          <div className="space-y-8 pt-2">
            {/* Search Input for Subjects */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="w-full sm:w-96">
                <Input
                  placeholder="Search subject by name or code (e.g. Political Science, HUQP18)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="w-4 h-4 text-slate-400" aria-hidden="true" />}
                />
              </div>

              <div className="text-xs text-slate-500">
                Displaying <strong>{filteredSubjects.length}</strong> CUET PG subjects with database-backed chapters
              </div>
            </div>

            {/* 7 Initial Subjects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSubjects.map((sub) => (
                <div
                  key={sub.id}
                  className="bg-white border border-slate-200/90 rounded-xl p-6 flex flex-col justify-between hover:border-blue-400 transition-all shadow-xs"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {sub.code}
                      </span>
                      <span className="text-slate-500">CUET PG</span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 leading-snug">
                      {sub.name}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {sub.description || 'Full postgraduate syllabus coverage.'}
                    </p>

                    <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-500">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Questions</span>
                        <strong className="text-slate-900 font-semibold">{sub.total_domain_questions} MCQs</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Duration</span>
                        <strong className="text-slate-900 font-semibold">{sub.duration_minutes} Mins</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Marking Scheme</span>
                        <strong className="text-slate-900 font-semibold">+{sub.marking_correct} / {sub.marking_incorrect}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Structure</span>
                        <strong className="text-slate-900 font-semibold">Chapter Mocks</strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-medium">
                      Configured Chapters
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenSubjectHierarchy(sub)}
                      rightIcon={<ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />}
                    >
                      Browse Chapters & Tests
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {filteredSubjects.length === 0 && (
              <EmptyState
                title="No matching subjects found"
                description="No CUET PG subject matched your search query. Try searching for Political Science, Economics, History, Psychology, or Disaster Management."
                actionLabel="Clear Search"
                onAction={() => setSearchQuery('')}
              />
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: PACKAGED TEST SERIES                                          */}
        {/* ==================================================================== */}
        {activeTab === 'packages' && (
          <div className="space-y-6 pt-2">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="w-full md:w-96">
                <Input
                  placeholder="Search subject or code (e.g. SCQP09, Economics)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="w-4 h-4 text-slate-400" aria-hidden="true" />}
                />
              </div>

              <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg self-start">
                <button
                  type="button"
                  onClick={() => setPricingFilter('all')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    pricingFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Packages ({TEST_SERIES_CATALOGUE.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPricingFilter('free')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    pricingFilter === 'free'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Free Diagnostic
                </button>
                <button
                  type="button"
                  onClick={() => setPricingFilter('paid')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    pricingFilter === 'paid'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Full Test Series
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                      isActive
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 pb-2">
              <div>
                Showing <strong className="text-slate-800 tabular-nums">{filteredSeries.length}</strong> test series
                {selectedCategory !== 'All' && (
                  <span> in <span className="text-slate-800 font-medium">{selectedCategory}</span></span>
                )}
              </div>
              {(selectedCategory !== 'All' || pricingFilter !== 'all' || searchQuery.trim() !== '') && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-blue-600 hover:text-blue-800 font-medium underline underline-offset-2 cursor-pointer"
                >
                  Reset all filters
                </button>
              )}
            </div>

            {filteredSeries.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                {filteredSeries.map((series) => (
                  <TestSeriesCard
                    key={series.id}
                    series={series}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No matching test series found"
                description="We could not find any CUET PG test series matching your current filter criteria."
                actionLabel="Reset Filters"
                onAction={handleResetFilters}
                className="my-8"
              />
            )}
          </div>
        )}
      </Container>

      {/* Package Details Modal */}
      <TestSeriesDetailModal
        series={selectedSeries}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />

      {/* Subject Hierarchy Drill-Down Modal (Examination -> Subject -> Chapter -> Category -> Tests) */}
      <Modal
        isOpen={hierarchyModalOpen}
        onClose={() => setHierarchyModalOpen(false)}
        title={selectedSubject ? `${selectedSubject.name} (${selectedSubject.code})` : 'Curriculum Hierarchy'}
        description="Examination: CUET PG · Verified Chapter Structure & Configured Test Categories"
        maxWidth="xl"
      >
        {selectedSubject && (
          <SubjectHierarchyView
            subject={selectedSubject}
            onClose={() => setHierarchyModalOpen(false)}
            onSelectTest={(test) => setSelectedTestDetail(test)}
          />
        )}
      </Modal>

      {/* Single Test Inspector Modal */}
      {selectedTestDetail && (
        <Modal
          isOpen={Boolean(selectedTestDetail)}
          onClose={() => setSelectedTestDetail(null)}
          title={selectedTestDetail.title}
          description={`Duration: ${Math.round(selectedTestDetail.duration_seconds / 60)} Minutes · Marking: +${selectedTestDetail.positive_marks_default} / -${selectedTestDetail.negative_marks_default}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-left text-xs sm:text-sm">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Test Description
              </span>
              <p className="text-slate-700 leading-relaxed">
                {selectedTestDetail.description || 'Syllabus-aligned computer-based mock assessment.'}
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Examination Instructions
              </span>
              <p className="text-slate-600 leading-relaxed text-xs">
                {selectedTestDetail.instructions || 'Standard NTA CBT rules apply. Each question carries +4 marks for correct response and -1 penalty for incorrect response.'}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <Badge variant={selectedTestDetail.access_type === 'free' ? 'success' : 'neutral'} styleType="tag">
                {selectedTestDetail.access_type === 'free' ? 'Free Diagnostic' : 'Enrolled Pass'}
              </Badge>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setSelectedTestDetail(null);
                  setHierarchyModalOpen(false);
                }}
              >
                Close Inspector
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
