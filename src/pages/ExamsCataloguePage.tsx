import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { TEST_SERIES_CATALOGUE } from '../data/testSeriesData';
import { TestSeries, ExamCategory } from '../types';
import { Container } from '../components/design-system/Container';
import { SectionHeading } from '../components/design-system/SectionHeading';
import { Input } from '../components/design-system/Input';
import { EmptyState } from '../components/design-system/EmptyState';
import { TestSeriesCard } from '../components/TestSeriesCard';
import { TestSeriesDetailModal } from '../components/TestSeriesDetailModal';
import { useRouter } from '../router/Router';

export function ExamsCataloguePage() {
  const { searchParams } = useRouter();
  const initialCategory = (searchParams.get('category') as ExamCategory) || 'All';
  const initialPricing = searchParams.get('filter') === 'free' ? 'free' : 'all';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExamCategory | string>(initialCategory);
  const [pricingFilter, setPricingFilter] = useState<'all' | 'free' | 'paid'>(initialPricing);
  const [selectedSeries, setSelectedSeries] = useState<TestSeries | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const categories: (ExamCategory | 'All')[] = [
    'All',
    'Computer Science & Tech',
    'Science',
    'Commerce & Management',
    'Humanities & Social Sciences'
  ];

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

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setPricingFilter('all');
  };

  const handleViewDetails = (series: TestSeries) => {
    setSelectedSeries(series);
    setModalOpen(true);
  };

  return (
    <div className="py-8 sm:py-12 space-y-8 text-left">
      <Container>
        <div className="border-b border-slate-200 pb-8">
          <SectionHeading
            kicker="Examination Catalogue"
            title="CUET PG Test Series & Mock Exams"
            description="Browse official syllabus-mapped computer-based test series across Science, Commerce, Computer Science, and Humanities disciplines."
          />
        </div>

        <div className="pt-6 space-y-4">
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
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 pb-4">
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
            description="We could not find any CUET PG test series matching your current filter criteria. Try searching by NTA paper code or clearing the filters."
            actionLabel="Reset Filters"
            onAction={handleResetFilters}
            className="my-8"
          />
        )}
      </Container>

      <TestSeriesDetailModal
        series={selectedSeries}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
