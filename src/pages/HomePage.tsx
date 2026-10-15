import React, { useState } from 'react';
import { ArrowRight, BookOpen, Clock, ShieldCheck, CheckCircle2, Award, Zap, Layers, ChevronRight } from 'lucide-react';
import { Link, useRouter } from '../router/Router';
import { TEST_SERIES_CATALOGUE, HOW_IT_WORKS_STEPS, BENEFITS_LIST } from '../data/testSeriesData';
import { TestSeries } from '../types';
import { Container } from '../components/design-system/Container';
import { SectionHeading } from '../components/design-system/SectionHeading';
import { Button } from '../components/design-system/Button';
import { TestSeriesCard } from '../components/TestSeriesCard';
import { TestSeriesDetailModal } from '../components/TestSeriesDetailModal';

export function HomePage() {
  const { navigate } = useRouter();
  const [selectedSeries, setSelectedSeries] = useState<TestSeries | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Filter featured series
  const featuredSeries = TEST_SERIES_CATALOGUE.filter((item) => item.featured);

  const handleViewDetails = (series: TestSeries) => {
    setSelectedSeries(series);
    setModalOpen(true);
  };

  return (
    <div className="space-y-20 sm:space-y-24 py-8 sm:py-12">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-4 pb-8 sm:pb-12">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Heading, Proposition, CTAs */}
            <div className="lg:col-span-7 text-left space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50/80 px-3 py-1 rounded border border-blue-200">
                <span>Official NTA Pattern Simulation</span>
                <span aria-hidden="true">·</span>
                <span>Postgraduate Entrance Focus</span>
              </div>

              <h1
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]"
                style={{ textWrap: 'balance' } as React.CSSProperties}
              >
                Your CUET PG Preparation Starts Here.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                Master the 75-question Computer Based Test format with full-length syllabus-conforming mock tests, step-by-step conceptual explanations, and granular sectional performance analysis designed for university admissions.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Link
                  to="/exams"
                  className="inline-flex items-center justify-center font-medium rounded-lg text-sm px-5 py-3 text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-sm gap-2"
                >
                  <span>Explore Test Series</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>

                <Button
                  variant="outline"
                  size="md"
                  onClick={() => {
                    const freeMock = TEST_SERIES_CATALOGUE.find((t) => t.isFree);
                    if (freeMock) {
                      handleViewDetails(freeMock);
                    } else {
                      navigate('/exams?filter=free');
                    }
                  }}
                  className="px-5 py-3 text-sm font-medium"
                >
                  Try a Free Mock Test
                </Button>
              </div>

              {/* Concrete Key Facts Strip (NO fake statistics or inflated numbers) */}
              <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4 text-xs text-slate-600">
                <div>
                  <div className="font-bold text-slate-900 text-sm tabular-nums">75 Questions</div>
                  <div className="text-slate-500">Per Domain Mock</div>
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm tabular-nums">105 Minutes</div>
                  <div className="text-slate-500">Timed Exam Mode</div>
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm tabular-nums">+4 / -1 Marking</div>
                  <div className="text-slate-500">NTA Standard Rules</div>
                </div>
              </div>
            </div>

            {/* Right Column: Educational Simulation Interface Showcase */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-left">
                {/* Mock NTA CBT Header */}
                <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold tracking-wide">CBT Practice Portal</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-300">CUET PG Mock 01</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-emerald-400 font-medium">
                    <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>01:34:20 Left</span>
                  </div>
                </div>

                {/* Question Area Simulation */}
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
                    <span className="font-semibold text-slate-700">Question 14 of 75</span>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                      +4 Correct · -1 Wrong
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                    Which data structure is primarily utilized by the Operating System to maintain the process scheduling queue with dynamic priority levels?
                  </p>

                  {/* Options */}
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center gap-2.5 text-slate-700">
                      <span className="w-5 h-5 rounded-full bg-white border border-slate-300 flex items-center justify-center font-semibold text-[11px]">A</span>
                      <span>Single-ended Linear Stack</span>
                    </div>
                    <div className="p-2.5 rounded-lg border border-blue-500 bg-blue-50/50 flex items-center gap-2.5 text-blue-900 font-medium">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-[11px]">B</span>
                      <span>Multilevel Feedback Priority Queue</span>
                    </div>
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center gap-2.5 text-slate-700">
                      <span className="w-5 h-5 rounded-full bg-white border border-slate-300 flex items-center justify-center font-semibold text-[11px]">C</span>
                      <span>Static Array Buffer</span>
                    </div>
                  </div>

                  {/* Question Palette Mini Preview */}
                  <div className="pt-3 border-t border-slate-100">
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Official Question Palette
                    </div>
                    <div className="grid grid-cols-8 gap-1.5 text-center text-[10px] font-mono">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((q) => (
                        <span
                          key={q}
                          className={`py-1 rounded font-medium ${
                            q === 14
                              ? 'bg-blue-600 text-white'
                              : q < 14
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {q}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer preview note */}
                <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Standard NTA palette logic</span>
                  <span className="text-blue-700 font-medium">Instant explanation on submit</span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 2. FEATURED TEST SERIES SECTION */}
      <section className="py-4">
        <Container>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <SectionHeading
              kicker="Curated Packages"
              title="Featured CUET PG Test Series"
              description="Full-syllabus computer-based mock tests crafted directly from official syllabus documents."
            />
            <Link
              to="/exams"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 whitespace-nowrap self-start sm:self-end"
            >
              <span>View All Subjects</span>
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredSeries.map((series) => (
              <TestSeriesCard
                key={series.id}
                series={series}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        </Container>
      </section>

      {/* 3. HOW PRIMEPREP WORKS SECTION */}
      <section className="py-12 bg-white border-y border-slate-200/80">
        <Container>
          <SectionHeading
            align="center"
            kicker="Preparation Methodology"
            title="How PrimePrep Works"
            description="A structured four-phase system engineered to transition candidates from foundational concept revision to exam-day mastery."
            className="mb-12"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {HOW_IT_WORKS_STEPS.map((step) => (
              <div
                key={step.stepNumber}
                className="p-6 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col justify-between"
              >
                <div>
                  <span className="font-mono text-2xl font-bold text-blue-600 block mb-3">
                    {step.stepNumber}
                  </span>
                  <h3 className="text-base font-semibold text-slate-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* 4. BENEFITS SECTION */}
      <section className="py-4">
        <Container>
          <SectionHeading
            kicker="Why PrimePrep"
            title="Engineered Strictly for CUET PG Aspirants"
            description="Postgraduate university admissions require domain depth. We avoid generic aptitude filler and focus entirely on your specific paper code."
            className="mb-10"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {BENEFITS_LIST.map((benefit, index) => (
              <div
                key={index}
                className="p-6 rounded-xl border border-slate-200/80 bg-white shadow-xs"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* 5. CALL TO ACTION STRIP */}
      <section className="py-6">
        <Container>
          <div className="bg-slate-900 rounded-2xl p-8 sm:p-12 text-white flex flex-col lg:flex-row items-center justify-between gap-8 text-left">
            <div className="max-w-xl">
              <span className="text-xs font-semibold tracking-wider uppercase text-blue-400 mb-2 block">
                Begin With Zero Risk
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug">
                Take Your First CUET PG Mock Test Today.
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
                Experience the authentic examination interface, question format, and comprehensive post-test review at no cost.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full lg:w-auto">
              <Link
                to="/exams"
                className="w-full sm:w-auto text-center px-6 py-3 rounded-lg text-sm font-medium text-slate-900 bg-white hover:bg-slate-100 transition-colors"
              >
                Explore Test Series
              </Link>
              <Link
                to="/register"
                className="w-full sm:w-auto text-center px-6 py-3 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Create Candidate Account
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Reusable Details Modal */}
      <TestSeriesDetailModal
        series={selectedSeries}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
