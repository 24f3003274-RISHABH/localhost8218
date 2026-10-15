import React, { useState } from 'react';
import { BookOpen, CheckCircle, HelpCircle, FileText, ChevronDown, ChevronUp, ArrowRight, Award } from 'lucide-react';
import { Container } from '../components/design-system/Container';
import { SectionHeading } from '../components/design-system/SectionHeading';
import { Card, CardHeader, CardContent } from '../components/design-system/Card';
import { Button } from '../components/design-system/Button';
import { CUET_PG_EXAM_OVERVIEW } from '../data/testSeriesData';
import { Link, useRouter } from '../router/Router';

export function CuetPgOverviewPage() {
  const { navigate } = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: 'What is the updated CUET PG exam pattern?',
      a: 'As per recent NTA guidelines, the CUET PG question paper comprises 75 domain-specific multiple choice questions (MCQs) designed exclusively around the subject syllabus. The general aptitude paper (Part A) was eliminated for domain-specific test codes, concentrating all 105 minutes strictly on core subject proficiency.'
    },
    {
      q: 'How does the CUET PG marking scheme function?',
      a: 'Each correct answer is awarded +4 marks. An incorrect answer incurs a penalty deduction of -1 mark (-0.25 penalty ratio). Questions left unattempted or unanswered receive 0 marks. Because wrong answers carry penalties, calculating risk and avoiding blind guessing is essential.'
    },
    {
      q: 'Which universities accept CUET PG scores?',
      a: 'CUET PG scores are mandatory for admission to all central universities across India including University of Delhi (DU), Jawaharlal Nehru University (JNU), Banaras Hindu University (BHU), University of Hyderabad (HCU), Babasaheb Bhimrao Ambedkar University (BBAU), Jamia Millia Islamia, and dozens of participating state and deemed universities.'
    },
    {
      q: 'Can a candidate appear for multiple test papers?',
      a: 'Yes, candidates can choose up to four question paper codes during registration subject to examination schedule slots designated by NTA.'
    },
    {
      q: 'How are PrimePrep test series aligned with the official NTA test?',
      a: 'PrimePrep mock tests replicate the exact 75-question, 105-minute CBT environment with official color-coded question palette behavior, marking calculations, and topic weightage defined by NTA syllabus bulletins.'
    }
  ];

  return (
    <div className="py-8 sm:py-12 space-y-12 text-left">
      <Container>
        {/* Breadcrumb / Kicker */}
        <div className="border-b border-slate-200 pb-8">
          <SectionHeading
            kicker="Official Guide"
            title="CUET PG Examination Overview"
            description="A comprehensive guide to the Common University Entrance Test for Postgraduates conducted by the National Testing Agency (NTA)."
          />
        </div>

        {/* 1. KEY EXAM PARAMETERS GRID */}
        <section className="pt-4">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Official Examination Parameters
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5">
              <span className="text-xs text-slate-500 font-medium block">Conducting Body</span>
              <strong className="text-base text-slate-900 block mt-1">National Testing Agency (NTA)</strong>
              <span className="text-xs text-slate-500 mt-1 block">Statutory autonomous testing body</span>
            </Card>

            <Card className="p-5">
              <span className="text-xs text-slate-500 font-medium block">Examination Mode</span>
              <strong className="text-base text-slate-900 block mt-1">Computer Based Test (CBT)</strong>
              <span className="text-xs text-slate-500 mt-1 block">Online testing centers across India</span>
            </Card>

            <Card className="p-5">
              <span className="text-xs text-slate-500 font-medium block">Duration & Questions</span>
              <strong className="text-base text-slate-900 block mt-1 tabular-nums">75 MCQs · 105 Minutes</strong>
              <span className="text-xs text-slate-500 mt-1 block">1.4 minutes average per question</span>
            </Card>

            <Card className="p-5">
              <span className="text-xs text-slate-500 font-medium block">Marking Scheme</span>
              <strong className="text-base text-slate-900 block mt-1 tabular-nums">+4 Correct / -1 Negative</strong>
              <span className="text-xs text-slate-500 mt-1 block">Total 300 maximum marks</span>
            </Card>
          </div>
        </section>

        {/* 2. EXAM STRUCTURE & METHODOLOGY */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 space-y-6">
              <h3 className="text-xl font-bold text-slate-900">
                Understanding the 75-Question Domain Pattern
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                NTA streamlined the CUET PG exam architecture to emphasize academic domain competency. The removal of generic general papers for specialized master's admissions means that 100% of your examination score depends on your mastery of the specific postgraduate syllabus.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
                  <span className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">1</span>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">High-Precision Question Distribution</h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      All 75 questions are mandatory domain MCQs. Standard university curriculums (B.Sc., B.A., B.Com., BCA) serve as the baseline, with questions testing analytical problem-solving and conceptual synthesis.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
                  <span className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">2</span>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">The Mathematics of Negative Marking</h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      With +4 marks for correct answers and -1 for wrong responses, four incorrect answers completely wipe out the hard-earned gain of one correct question. PrimePrep analytics specifically highlight your guessing risk index.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
                  <span className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">3</span>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">Time Allocation Realities</h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      105 minutes for 75 questions translates to 84 seconds per problem. Calculations in subjects like Computer Science, Mathematics, Economics, and Physics require rapid elimination strategies to finish on schedule.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Preparation Roadmap */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 space-y-4">
              <h3 className="text-lg font-bold text-slate-900">
                Recommended 4-Stage Preparation Roadmap
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
                <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
                  <strong className="text-blue-700 block mb-1">Stage A: Diagnostic Baseline</strong>
                  <p className="text-slate-600 leading-relaxed">
                    Take the free full-length diagnostic mock on PrimePrep to identify unreviewed syllabus domains before starting test revision.
                  </p>
                </div>
                <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
                  <strong className="text-blue-700 block mb-1">Stage B: Sectional Drills</strong>
                  <p className="text-slate-600 leading-relaxed">
                    Complete targeted sectional tests for high-weightage modules to develop speed on predictable question formats.
                  </p>
                </div>
                <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
                  <strong className="text-blue-700 block mb-1">Stage C: Timed CBT Simulations</strong>
                  <p className="text-slate-600 leading-relaxed">
                    Attempt full-length mocks under strict 105-minute timers to build sustained exam focus and test-day endurance.
                  </p>
                </div>
                <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
                  <strong className="text-blue-700 block mb-1">Stage D: Error Log Revision</strong>
                  <p className="text-slate-600 leading-relaxed">
                    Review detailed explanations for every missed or skipped question, focusing on distractor traps and derivation steps.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Key University Targets & Direct Actions */}
          <div className="space-y-6">
            <Card className="p-6">
              <h4 className="text-base font-bold text-slate-900 mb-3">
                Key Participating Central Universities
              </h4>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Admissions to postgraduate programs at top premier universities in India require CUET PG rankings:
              </p>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                  <span>University of Delhi (DU) - MCA, MA, MSc</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                  <span>Jawaharlal Nehru University (JNU)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                  <span>Banaras Hindu University (BHU)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                  <span>University of Hyderabad (HCU)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                  <span>Pondicherry University</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                  <span>Central Universities of Rajasthan, Punjab, etc.</span>
                </li>
              </ul>

              <div className="pt-6 mt-6 border-t border-slate-100 space-y-2">
                <Link
                  to="/exams"
                  className="w-full text-center block px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors"
                >
                  Browse Subject Test Series
                </Link>
                <Link
                  to="/login?flow=free_mock"
                  className="w-full text-center block px-4 py-2.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Attempt Free Diagnostic Mock
                </Link>
              </div>
            </Card>

            <Card className="p-6 bg-blue-50/50 border-blue-200">
              <h4 className="text-sm font-bold text-blue-900 mb-2">
                Official NTA Paper Codes Covered
              </h4>
              <p className="text-xs text-blue-800/80 leading-relaxed mb-3">
                PrimePrep provides dedicated mock packages mapped to codes:
              </p>
              <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
                {['SCQP09 (MCA)', 'COQP11 (General)', 'COQP12 (Econ)', 'SCQP08 (Life Sci)', 'SCQP17 (Math)', 'SCQP24 (Physics)', 'HUQP18 (Pol Sci)'].map((code) => (
                  <span key={code} className="bg-white border border-blue-200 px-2 py-0.5 rounded text-blue-900 font-medium">
                    {code}
                  </span>
                ))}
              </div>
            </Card>
          </div>
        </section>

        {/* 3. FAQS SECTION */}
        <section className="pt-6">
          <SectionHeading
            kicker="Answers to Common Questions"
            title="CUET PG Frequently Asked Questions"
            description="Verified clarifications on eligibility, marking regulations, and preparation strategy."
            className="mb-8"
          />

          <div className="space-y-3 max-w-4xl">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="border border-slate-200 rounded-xl bg-white overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left text-sm font-semibold text-slate-900 hover:bg-slate-50 cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-4 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </Container>
    </div>
  );
}
