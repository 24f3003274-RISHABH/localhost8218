import React, { useState } from 'react';
import { Mail, Clock, MapPin, Send, CheckCircle2, MessageSquare, Headphones } from 'lucide-react';
import { Container } from '../components/design-system/Container';
import { SectionHeading } from '../components/design-system/SectionHeading';
import { Card, CardHeader, CardContent } from '../components/design-system/Card';
import { Input } from '../components/design-system/Input';
import { Select } from '../components/design-system/Select';
import { Textarea } from '../components/design-system/Textarea';
import { Button } from '../components/design-system/Button';

export function ContactPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [paperCode, setPaperCode] = useState('SCQP09');
  const [queryType, setQueryType] = useState('Test Series Query');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const queryTypeOptions = [
    { value: 'Test Series Query', label: 'Test Series Content & Syllabus Query' },
    { value: 'Technical Support', label: 'CBT Simulator Technical Issue' },
    { value: 'Enrollment / Billing', label: 'Enrollment & Access Query' },
    { value: 'Question Feedback', label: 'Question or Solution Clarification' },
    { value: 'General Inquiry', label: 'General University Admission Query' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Please provide your name.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    if (!message.trim() || message.length < 10) {
      setError('Please provide a detailed query message (at least 10 characters).');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 600);
  };

  const handleReset = () => {
    setFullName('');
    setEmail('');
    setMessage('');
    setIsSubmitted(false);
  };

  return (
    <div className="py-8 sm:py-12 space-y-12 text-left">
      <Container>
        {/* Header */}
        <div className="border-b border-slate-200 pb-8">
          <SectionHeading
            kicker="Candidate Assistance"
            title="Contact & Academic Support"
            description="Have questions about test series alignment, CBT simulation compatibility, or your paper syllabus? Our support desk responds within 24 business hours."
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start pt-4">
          {/* Left Column: Interactive Contact Form */}
          <div className="lg:col-span-7">
            <Card className="shadow-xs">
              <CardHeader>
                <h3 className="text-lg font-bold text-slate-900">
                  Submit an Academic or Technical Ticket
                </h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  Fill out the details below and our academic support team will review your inquiry.
                </p>
              </CardHeader>

              <CardContent>
                {isSubmitted ? (
                  <div className="p-8 text-center space-y-4 bg-slate-50 rounded-xl border border-slate-200/80">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
                    </div>
                    <h4 className="text-base font-bold text-slate-900">
                      Inquiry Dispatched Successfully
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                      Thank you, <strong>{fullName}</strong>. A support ticket confirmation has been sent to <strong>{email}</strong>. Our academic team typically replies within 12–24 business hours.
                    </p>
                    <div className="pt-2">
                      <Button variant="outline" size="sm" onClick={handleReset}>
                        Submit Another Inquiry
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Your Full Name"
                        placeholder="e.g. Ananya Patel"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />

                      <Input
                        label="Email Address"
                        type="email"
                        placeholder="candidate@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Select
                        label="Inquiry Category"
                        options={queryTypeOptions}
                        value={queryType}
                        onChange={(e) => setQueryType(e.target.value)}
                      />

                      <Input
                        label="Target Subject / Paper Code"
                        placeholder="e.g. SCQP09, COQP11, SCQP08"
                        value={paperCode}
                        onChange={(e) => setPaperCode(e.target.value)}
                      />
                    </div>

                    <Textarea
                      label="Inquiry Description"
                      placeholder="Please specify your query in detail, including question number or test set if applicable..."
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    />

                    {error && (
                      <p className="text-xs text-red-600 font-medium" role="alert">
                        {error}
                      </p>
                    )}

                    <div className="pt-2">
                      <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        isLoading={isSubmitting}
                        rightIcon={<Send className="w-4 h-4" aria-hidden="true" />}
                      >
                        Transmit Support Inquiry
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Direct Helpdesk Information */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="p-6">
              <h4 className="text-base font-bold text-slate-900 mb-4">
                Official Helpdesk Coordinates
              </h4>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 block">Candidate Support Email</span>
                    <span className="text-slate-600">support@primeprep.edu</span>
                    <span className="text-slate-400 block text-xs mt-0.5">For admissions and test issues</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 block">Support Desk Hours</span>
                    <span className="text-slate-600">Monday through Saturday</span>
                    <span className="text-slate-500 block text-xs mt-0.5">9:00 AM – 6:00 PM IST (Excluding Gazetted Holidays)</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 block">Academic Office</span>
                    <span className="text-slate-600">PrimePrep Learning Technologies</span>
                    <span className="text-slate-500 block text-xs mt-0.5">Connaught Place, New Delhi 110001, India</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-slate-50 border-slate-200">
              <h4 className="text-sm font-bold text-slate-900 mb-2">
                Frequently Resolved Inquiries
              </h4>
              <div className="space-y-3 text-xs text-slate-600">
                <div>
                  <strong className="text-slate-800 block">How quickly are tests activated?</strong>
                  <p className="leading-relaxed">All test series passes and free diagnostic mocks activate instantly upon account registration.</p>
                </div>
                <div>
                  <strong className="text-slate-800 block">Can I attempt tests on mobile?</strong>
                  <p className="leading-relaxed">Yes. The CBT interface is fully responsive across mobile, tablet, and desktop browsers, though we recommend desktop for realistic exam simulation.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}
