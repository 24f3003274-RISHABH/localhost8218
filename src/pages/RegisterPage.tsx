import React, { useState } from 'react';
import { User, Mail, Lock, CheckCircle2, UserPlus, AlertCircle } from 'lucide-react';
import { Container } from '../components/design-system/Container';
import { Card, CardHeader, CardContent, CardFooter } from '../components/design-system/Card';
import { Input } from '../components/design-system/Input';
import { Select } from '../components/design-system/Select';
import { Button } from '../components/design-system/Button';
import { Link, useRouter } from '../router/Router';
import { useAuth } from '../context/AuthContext';

export function RegisterPage() {
  const { navigate } = useRouter();
  const { signUp, isConfigured } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [subjectCode, setSubjectCode] = useState('SCQP09');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const subjectOptions = [
    { value: 'SCQP09', label: 'SCQP09 - Computer Science & Information Technology (MCA/MSc)' },
    { value: 'COQP11', label: 'COQP11 - General Paper (Management, MBA, LLB, Mass Comm)' },
    { value: 'COQP12', label: 'COQP12 - Economics & Applied Economics' },
    { value: 'SCQP08', label: 'SCQP08 - Life Sciences / Botany / Zoology' },
    { value: 'SCQP17', label: 'SCQP17 - Mathematics & Applied Mathematics' },
    { value: 'SCQP24', label: 'SCQP24 - Physics' },
    { value: 'HUQP18', label: 'HUQP18 - Political Science & International Relations' },
    { value: 'HUQP20', label: 'HUQP20 - Psychology & Applied Psychology' },
    { value: 'OTHER', label: 'Other CUET PG Subject Code' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Please provide your full candidate name.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!agreeTerms) {
      setError('Please accept the platform terms of service and examination conduct policies.');
      return;
    }

    setIsLoading(true);

    // Call Supabase Auth signUp. Role is forced to 'student'
    const { error: authError } = await signUp(
      email.trim(),
      password,
      fullName.trim(),
      subjectCode
    );

    setIsLoading(false);

    if (authError) {
      setError(authError.message || 'Registration failed. Please check your credentials.');
      return;
    }

    setRegisterSuccess(true);
    setTimeout(() => {
      navigate('/student/dashboard');
    }, 1200);
  };

  return (
    <div className="py-12 sm:py-16 text-left">
      <Container size="narrow">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <span className="text-xs font-semibold tracking-wider uppercase text-blue-600 block mb-2">
              Supabase Auth Registration
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Create Student Account
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Enroll as a student candidate with protected profile security and RLS data containment.
            </p>
          </div>

          <Card className="shadow-sm">
            <CardHeader className="pb-0">
              {registerSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2.5 text-emerald-800 text-xs mb-4">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" aria-hidden="true" />
                  <div>
                    <span className="font-semibold block">Student Profile Created</span>
                    <span>Account registered with standard 'student' role. Redirecting to portal...</span>
                  </div>
                </div>
              )}
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Candidate Full Name"
                  placeholder="e.g. Priyanshu Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  leftIcon={<User className="w-4 h-4" aria-hidden="true" />}
                  required
                />

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="candidate@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4" aria-hidden="true" />}
                  required
                />

                <Select
                  label="Primary Target CUET PG Subject Code"
                  options={subjectOptions}
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  helperText="Default paper code stored in your student profile."
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    leftIcon={<Lock className="w-4 h-4" aria-hidden="true" />}
                    required
                  />

                  <Input
                    label="Confirm Password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    leftIcon={<Lock className="w-4 h-4" aria-hidden="true" />}
                    required
                  />
                </div>

                {error && (
                  <p className="text-xs text-red-600 font-medium" role="alert">
                    {error}
                  </p>
                )}

                <div className="pt-1">
                  <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 shrink-0"
                      required
                    />
                    <span className="leading-relaxed">
                      I agree to the PrimePrep terms of service, examination honor code, and student privacy policy.
                    </span>
                  </label>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    fullWidth
                    isLoading={isLoading}
                    rightIcon={<UserPlus className="w-4 h-4" aria-hidden="true" />}
                  >
                    Register Student Account
                  </Button>
                </div>
              </form>
            </CardContent>

            <CardFooter className="bg-slate-50/50 justify-center text-xs text-slate-600">
              <span>Already registered?</span>
              <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-800 ml-1">
                Sign In to Student Portal
              </Link>
            </CardFooter>
          </Card>
        </div>
      </Container>
    </div>
  );
}
