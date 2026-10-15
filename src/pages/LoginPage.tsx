import React, { useState } from 'react';
import { Mail, Lock, LogIn, ArrowRight, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import { Container } from '../components/design-system/Container';
import { Card, CardHeader, CardContent, CardFooter } from '../components/design-system/Card';
import { Input } from '../components/design-system/Input';
import { Button } from '../components/design-system/Button';
import { Modal } from '../components/design-system/Modal';
import { Link, useRouter } from '../router/Router';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { navigate, searchParams } = useRouter();
  const { signIn, resetPassword, updatePassword, user, isConfigured } = useAuth();

  const isResetFlow = searchParams.get('reset') === 'true';
  const redirectTarget = searchParams.get('redirect') || '/student/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Forgot password modal state
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySubmitted, setRecoverySubmitted] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  // Reset password state (when landing with ?reset=true)
  const [newPassword, setNewPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  // If already logged in, show redirection option
  if (user && !isResetFlow) {
    return (
      <div className="py-16 text-left">
        <Container size="narrow">
          <Card className="max-w-md mx-auto p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Already Authenticated</h3>
            <p className="text-sm text-slate-600">
              You are currently signed in as <strong>{user.email}</strong>.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Button variant="primary" onClick={() => navigate(redirectTarget)}>
                Proceed to Student Portal
              </Button>
            </div>
          </Card>
        </Container>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid student candidate email address.');
      return;
    }

    if (!password.trim()) {
      setError('Password is required.');
      return;
    }

    setIsLoading(true);

    const { error: authError } = await signIn(email.trim(), password);

    setIsLoading(false);

    if (authError) {
      setError(authError.message || 'Invalid email or password credentials.');
      return;
    }

    setLoginSuccess(true);
    setTimeout(() => {
      navigate(redirectTarget);
    }, 600);
  };

  const handleDemoFill = () => {
    setEmail('aspirant.cuet@primeprep.edu');
    setPassword('Candidate2026!');
    setError(null);
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail.trim() || !recoveryEmail.includes('@')) return;

    setRecoveryLoading(true);
    const { error: resetErr } = await resetPassword(recoveryEmail.trim());
    setRecoveryLoading(false);

    if (resetErr) {
      setError(resetErr.message);
    } else {
      setRecoverySubmitted(true);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setIsLoading(true);
    const { error: updateErr } = await updatePassword(newPassword);
    setIsLoading(false);

    if (updateErr) {
      setError(updateErr.message);
    } else {
      setResetSuccess(true);
      setTimeout(() => {
        navigate('/student/dashboard');
      }, 1200);
    }
  };

  return (
    <div className="py-12 sm:py-16 text-left">
      <Container size="narrow">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <span className="text-xs font-semibold tracking-wider uppercase text-blue-600 block mb-2">
              Supabase Authentication
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {isResetFlow ? 'Set New Password' : 'Sign In to PrimePrep'}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              {isResetFlow
                ? 'Enter your updated password below to complete account recovery.'
                : 'Access your protected test series, question solutions, and analytics.'}
            </p>
          </div>

          <Card className="shadow-sm">
            <CardHeader className="pb-0">
              {/* Demo Helper */}
              {!isResetFlow && (
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg flex items-center justify-between gap-2 text-xs mb-4">
                  <span className="text-slate-600">Testing candidate authentication?</span>
                  <button
                    type="button"
                    onClick={handleDemoFill}
                    className="font-medium text-blue-600 hover:text-blue-800 underline underline-offset-2 cursor-pointer"
                  >
                    Quick-fill Candidate
                  </button>
                </div>
              )}

              {loginSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-emerald-800 text-xs mb-4">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                  <span>Authenticated successfully. Redirecting to student portal...</span>
                </div>
              )}

              {resetSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-emerald-800 text-xs mb-4">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                  <span>Password updated successfully. Loading student portal...</span>
                </div>
              )}
            </CardHeader>

            <CardContent>
              {isResetFlow ? (
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <Input
                    label="New Secure Password"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    leftIcon={<Lock className="w-4 h-4" aria-hidden="true" />}
                    required
                    helperText="Minimum 6 characters with mixed characters recommended."
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
                      fullWidth
                      isLoading={isLoading}
                      rightIcon={<KeyRound className="w-4 h-4" aria-hidden="true" />}
                    >
                      Update Password & Sign In
                    </Button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Registered Student Email"
                    type="email"
                    placeholder="candidate@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    leftIcon={<Mail className="w-4 h-4" aria-hidden="true" />}
                    required
                  />

                  <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    leftIcon={<Lock className="w-4 h-4" aria-hidden="true" />}
                    required
                  />

                  {error && (
                    <p className="text-xs text-red-600 font-medium" role="alert">
                      {error}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Remember session</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        setForgotModalOpen(true);
                        setRecoverySubmitted(false);
                        setRecoveryEmail(email);
                      }}
                      className="text-blue-600 hover:text-blue-800 font-medium hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      fullWidth
                      isLoading={isLoading}
                      rightIcon={<LogIn className="w-4 h-4" aria-hidden="true" />}
                    >
                      Sign In with Supabase Auth
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>

            <CardFooter className="bg-slate-50/50 justify-center text-xs text-slate-600">
              <span>New student candidate?</span>
              <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-800 ml-1">
                Create Student Account
              </Link>
            </CardFooter>
          </Card>
        </div>
      </Container>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
        title="Supabase Password Recovery"
        description="We will dispatch a secure password reset link to your registered email address."
      >
        {recoverySubmitted ? (
          <div className="space-y-4 text-center py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
            </div>
            <h4 className="text-base font-semibold text-slate-900">
              Reset Instructions Dispatched
            </h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              If an account is associated with <strong>{recoveryEmail}</strong>, an authentication verification link has been generated via Supabase Auth.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setForgotModalOpen(false)}
            >
              Return to Login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleRecoverySubmit} className="space-y-4 text-left">
            <Input
              label="Student Email Address"
              type="email"
              placeholder="candidate@example.com"
              value={recoveryEmail}
              onChange={(e) => setRecoveryEmail(e.target.value)}
              required
              autoFocus
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setForgotModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={recoveryLoading}
              >
                Send Password Reset Email
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
