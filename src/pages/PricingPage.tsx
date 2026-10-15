import React from 'react';
import { Check, HelpCircle, Shield, ArrowRight } from 'lucide-react';
import { Container } from '../components/design-system/Container';
import { SectionHeading } from '../components/design-system/SectionHeading';
import { Card, CardHeader, CardContent, CardFooter } from '../components/design-system/Card';
import { Button } from '../components/design-system/Button';
import { Badge } from '../components/design-system/Badge';
import { Link, useRouter } from '../router/Router';

export function PricingPage() {
  const { navigate } = useRouter();

  const plans = [
    {
      id: 'free',
      name: 'Diagnostic Starter',
      price: '₹0',
      period: 'Free Always',
      description: 'Ideal for establishing a baseline score and experiencing the authentic NTA CBT testing engine before enrolling.',
      popular: false,
      ctaLabel: 'Start Free Mock',
      ctaVariant: 'outline' as const,
      action: () => navigate('/login?flow=free_mock'),
      features: [
        '2 Full-length diagnostic tests (150 MCQs)',
        'Authentic NTA computer-based exam simulator',
        'Instant question-by-question answer keys',
        'Basic accuracy and time elapsed metrics',
        'No credit card or payment required'
      ],
      notIncluded: [
        'Advanced topic-wise sectional drills',
        'In-depth mathematical derivations & code logic',
        'Negative marking penalty risk audit',
        'Comparative percentile distribution'
      ]
    },
    {
      id: 'single-subject',
      name: 'Single Subject Pass',
      price: '₹799',
      period: 'per paper code',
      description: 'The standard choice for candidates focusing on one postgraduate entrance paper code (e.g. SCQP09, COQP11, SCQP08).',
      popular: true,
      ctaLabel: 'Select Subject Series',
      ctaVariant: 'primary' as const,
      action: () => navigate('/exams'),
      features: [
        '12 to 15 Full-length domain mock tests (900–1125 MCQs)',
        'Topic-focused sectional drill tests',
        'Official NTA 75-question, 105-minute CBT environment',
        'Exhaustive theoretical & algorithmic solutions',
        'Negative marking penalty calibration',
        'Unlimited mock test re-attempts',
        'Access valid until CUET PG 2026 exam date (6 Months)'
      ],
      notIncluded: [
        'Cross-subject test series access'
      ]
    },
    {
      id: 'all-access',
      name: 'All-Access Master Pass',
      price: '₹1,499',
      period: 'full examination access',
      description: 'Complete multi-paper preparation for candidates appearing in up to 4 CUET PG subject codes or combined programs.',
      popular: false,
      ctaLabel: 'Enroll in Master Pass',
      ctaVariant: 'secondary' as const,
      action: () => navigate('/register?plan=master'),
      features: [
        'Access to ALL CUET PG test series across all disciplines',
        '50+ Full-length CBT mock tests (3,750+ MCQs)',
        'Full domain coverage + General Paper (COQP11)',
        'Exhaustive step-by-step solutions with derivations',
        'Multi-paper performance comparative tracking',
        'Priority academic support desk assistance',
        'Valid until completion of CUET PG 2026 admissions cycle'
      ],
      notIncluded: []
    }
  ];

  return (
    <div className="py-8 sm:py-12 space-y-16 text-left">
      <Container>
        {/* Header */}
        <div className="border-b border-slate-200 pb-8">
          <SectionHeading
            kicker="Transparent Pricing"
            title="Straightforward, Value-Driven Preparation Plans"
            description="Access authentic NTA CBT mock tests with comprehensive explanatory answer keys. No hidden recurring subscriptions."
          />
        </div>

        {/* 1. PRICING CARDS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch pt-4">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`flex flex-col justify-between ${
                plan.popular ? 'border-blue-600 ring-1 ring-blue-600 shadow-md' : ''
              }`}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                  {plan.popular && (
                    <Badge variant="info" styleType="tag">
                      Most Selected
                    </Badge>
                  )}
                </div>

                <div className="flex items-baseline gap-1 mt-2 mb-3">
                  <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
                    {plan.price}
                  </span>
                  <span className="text-xs text-slate-500">/ {plan.period}</span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed min-h-[44px]">
                  {plan.description}
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                <Button
                  variant={plan.ctaVariant}
                  size="md"
                  fullWidth
                  onClick={plan.action}
                  rightIcon={<ArrowRight className="w-4 h-4" aria-hidden="true" />}
                >
                  {plan.ctaLabel}
                </Button>

                {/* Features list */}
                <div className="space-y-3 pt-4 border-t border-slate-100 text-xs">
                  <span className="font-semibold text-slate-900 uppercase tracking-wider block text-[11px]">
                    What's Included:
                  </span>
                  <ul className="space-y-2.5">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-700">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                    {plan.notIncluded.map((notFeat, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-400">
                        <span className="w-4 h-4 flex items-center justify-center shrink-0 mt-0.5 text-slate-300 font-bold">—</span>
                        <span className="leading-snug">{notFeat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>

              <CardFooter className="bg-slate-50/50 text-[11px] text-slate-500">
                <span>Instant activation upon registration</span>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* 2. DETAILED COMPARISON TABLE */}
        <section className="pt-8">
          <h3 className="text-xl font-bold text-slate-900 mb-6">
            Feature Comparison Matrix
          </h3>

          <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-xs">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 text-xs uppercase font-semibold">
                <tr>
                  <th scope="col" className="p-4 sm:p-5">Feature</th>
                  <th scope="col" className="p-4 sm:p-5 text-center">Diagnostic Starter</th>
                  <th scope="col" className="p-4 sm:p-5 text-center bg-blue-50/40 text-blue-900">Single Subject Pass</th>
                  <th scope="col" className="p-4 sm:p-5 text-center">All-Access Master</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                <tr>
                  <td className="p-4 font-medium text-slate-900">Total Full-Length CBT Mocks</td>
                  <td className="p-4 text-center tabular-nums text-slate-600">2 Mocks</td>
                  <td className="p-4 text-center tabular-nums font-semibold text-blue-900 bg-blue-50/20">10–12 Mocks</td>
                  <td className="p-4 text-center tabular-nums font-semibold text-slate-900">50+ Mocks</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-900">Topic-Specific Sectional Drills</td>
                  <td className="p-4 text-center text-slate-400">—</td>
                  <td className="p-4 text-center font-semibold text-blue-900 bg-blue-50/20">4–5 Sectional Sets</td>
                  <td className="p-4 text-center font-semibold text-slate-900">All Subjects Included</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-900">NTA Standard Marking (+4 / -1)</td>
                  <td className="p-4 text-center text-emerald-600 font-medium">Included</td>
                  <td className="p-4 text-center text-emerald-600 font-medium bg-blue-50/20">Included</td>
                  <td className="p-4 text-center text-emerald-600 font-medium">Included</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-900">Step-by-Step Question Solutions</td>
                  <td className="p-4 text-center text-slate-600">Basic Answer Keys</td>
                  <td className="p-4 text-center text-blue-900 font-medium bg-blue-50/20">Detailed Pedagogical Notes</td>
                  <td className="p-4 text-center text-slate-900 font-medium">Detailed Pedagogical Notes</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-900">Negative Penalty Calibration Audit</td>
                  <td className="p-4 text-center text-slate-400">—</td>
                  <td className="p-4 text-center text-emerald-600 font-medium bg-blue-50/20">Included</td>
                  <td className="p-4 text-center text-emerald-600 font-medium">Included</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-900">Re-attempt Mock Tests</td>
                  <td className="p-4 text-center text-slate-600">1 Re-attempt</td>
                  <td className="p-4 text-center text-blue-900 font-medium bg-blue-50/20">Unlimited</td>
                  <td className="p-4 text-center text-slate-900 font-medium">Unlimited</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-900">Validity Period</td>
                  <td className="p-4 text-center text-slate-600">Lifetime</td>
                  <td className="p-4 text-center text-blue-900 font-medium bg-blue-50/20">Until CUET PG Exam Date</td>
                  <td className="p-4 text-center text-slate-900 font-medium">Until Full Admissions Cycle</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. POLICIES & GUARANTEE NOTE */}
        <section className="bg-slate-50 border border-slate-200 rounded-xl p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">
                Transparent Educational Access Policies
              </h4>
              <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
                All mock test packages are single, one-time fees with zero recurring subscription surprises. If NTA formally revises any subject syllabus or paper structure after your enrollment, all question sets and syllabus blueprints are updated with zero surcharge.
              </p>
            </div>
          </div>
        </section>
      </Container>
    </div>
  );
}
