import React from 'react';
import { Target, BookCheck, ShieldAlert, Award, Compass, Cpu, CheckCircle2 } from 'lucide-react';
import { Container } from '../components/design-system/Container';
import { SectionHeading } from '../components/design-system/SectionHeading';
import { Card } from '../components/design-system/Card';
import { Button } from '../components/design-system/Button';
import { Link } from '../router/Router';

export function AboutPage() {
  const corePrinciples = [
    {
      title: 'Pedagogical Rigor Over Vanity Metrics',
      description: 'We do not market fabricated pass percentages or unverified rank claims. Our commitment is strictly academic: providing accurate, verified question banks mapped exactly to official NTA syllabus documents.'
    },
    {
      title: 'Exact Computer-Based Testing Simulation',
      description: 'The National Testing Agency CBT environment features specific navigation rules, question status states, and timed section locks. Practicing in an identical interface reduces interface cognitive load on exam day.'
    },
    {
      title: 'Exhaustive Conceptual Explanations',
      description: 'Every question is authored with complete explanatory reasoning, mathematical derivations, or code walkthroughs. Candidates learn the mechanics behind correct choices and the traps behind distractors.'
    },
    {
      title: 'Syllabus Blueprint Precision',
      description: 'Undergraduate degrees vary widely across universities. We curate question weightage according to the official CUET PG syllabus bullet points, preventing wasted time on out-of-scope topics.'
    }
  ];

  return (
    <div className="py-8 sm:py-12 space-y-16 text-left">
      <Container>
        {/* Header */}
        <div className="border-b border-slate-200 pb-8">
          <SectionHeading
            kicker="About PrimePrep"
            title="Dedicated to Postgraduate Entrance Excellence"
            description="PrimePrep was founded with a singular educational focus: engineering high-fidelity CBT preparation resources exclusively for CUET PG aspirants."
          />
        </div>

        {/* 1. MISSION & PURPOSE */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center pt-4">
          <div className="lg:col-span-7 space-y-5">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">
              Why Postgraduate Entrances Require Dedicated Tools
            </h3>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Most test preparation platforms treat entrance examinations as generic aptitude drills. However, the Common University Entrance Test for Postgraduates (CUET PG) assesses deep undergraduate discipline mastery: advanced data structures in computer science, econometrics in economics, or molecular genetics in life sciences.
            </p>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              When NTA eliminated the general paper from domain-specific test codes, postgraduate entrance preparation became entirely about subject depth. PrimePrep was constructed specifically to address this shift: providing rigorous, domain-specific mock exams with verified pedagogical solutions.
            </p>
          </div>

          <div className="lg:col-span-5 bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-4">
            <span className="text-xs font-semibold tracking-wider uppercase text-blue-400 block">
              Our Academic Standard
            </span>
            <h4 className="text-xl font-bold text-white">
              Zero Marketing Hype. 100% Curriculum Focus.
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              We pledge never to deceive students with fabricated enrollment numbers, unverified success rates, or sensationalized claims. Every mock test is vetted for academic soundness and alignment with the latest published NTA examination syllabus.
            </p>
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 text-xs font-medium text-emerald-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                <span>Verified Subject Matter Educators</span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. CORE PEDAGOGICAL PRINCIPLES */}
        <section className="pt-4">
          <SectionHeading
            kicker="Foundation"
            title="Our Four Architectural Pillars"
            description="How our platform design ensures maximum preparation efficiency for postgraduate aspirants."
            className="mb-8"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {corePrinciples.map((principle, index) => (
              <Card key={index} className="p-6">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm mb-4">
                  0{index + 1}
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-2">
                  {principle.title}
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {principle.description}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* 3. NTA PATTERN ALIGNMENT DETAILS */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
          <h3 className="text-xl font-bold text-slate-900">
            Commitment to Continuous Syllabus Synchronization
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
            As central university entrance norms evolve, our curriculum team conducts continuous audits of question types, topic distributions, and marking patterns. When NTA issues notifications regarding subject codes, syllabus revisions, or test slot durations, PrimePrep updates test papers to maintain strict concordance with official testing policies.
          </p>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-500">
              Have questions about our academic methodology?
            </span>
            <div className="flex items-center gap-3">
              <Link
                to="/contact"
                className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Contact Academic Team
              </Link>
              <Link
                to="/exams"
                className="px-4 py-2 text-xs font-semibold rounded-lg text-white bg-slate-900 hover:bg-slate-800 transition-colors"
              >
                Explore Test Series
              </Link>
            </div>
          </div>
        </section>
      </Container>
    </div>
  );
}
