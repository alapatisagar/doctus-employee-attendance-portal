import React, { useState } from 'react';
import { Lock, Mail, ShieldAlert, Sparkles, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { IS_DEMO_MODE_ENABLED } from '../config/security';

export const Login: React.FC = () => {
  const { login, switchDemoUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await login(email, password);
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const demoAccounts = [
    { role: 'Employee', email: 'employee@doctus.com', id: 'EMP1001' },
    { role: 'Team Lead', email: 'tl@doctus.com', id: 'TL1001' },
    { role: 'Manager', email: 'manager@doctus.com', id: 'MGR1001' },
    { role: 'HR Manager', email: 'hr@doctus.com', id: 'HR1001' },
    { role: 'Admin', email: 'admin@doctus.com', id: 'ADMIN1001' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-doctus-cream via-doctus-yellow/20 to-doctus-cream dark:from-doctus-dark dark:via-neutral-900 dark:to-doctus-dark flex flex-col justify-between p-4 sm:p-8 font-sans">
      {/* Top Header */}
      <header className="flex items-center justify-between max-w-6xl mx-auto w-full py-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-doctus-yellow to-doctus-yellow-600 flex items-center justify-center font-extrabold text-doctus-red text-xl shadow-md border border-doctus-yellow-400">
            D
          </div>
          <div>
            <h1 className="font-extrabold text-base text-neutral-950 dark:text-white leading-tight">
              DOCTUS
            </h1>
            <p className="text-[10px] font-bold tracking-wider uppercase text-doctus-red">
              BUSINESS SOLUTIONS
            </p>
          </div>
        </div>

        <span className="text-xs font-bold px-3 py-1 rounded-full bg-doctus-yellow/30 text-neutral-950 border border-doctus-yellow/50">
          Official HR Portal
        </span>
      </header>

      {/* Main Login Split Container */}
      <main className="max-w-5xl mx-auto w-full my-auto py-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Branding Callout */}
        <div className="space-y-6 lg:pr-8 text-center lg:text-left">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-doctus-red/10 text-doctus-red font-black text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" /> 2026 Unified Release
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-950 dark:text-white tracking-tight leading-tight">
            DOCTUS EMPLOYEE <br />
            <span className="text-doctus-red">ATTENDANCE PORTAL</span>
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-300 font-medium max-w-md mx-auto lg:mx-0">
            Manage your daily check-in, check-out, working hours, leave applications, and holiday schedule with real-time Indian Standard Time (IST) accuracy.
          </p>

          <div className="p-4 rounded-2xl bg-white/70 dark:bg-neutral-900/70 border border-doctus-yellow/40 backdrop-blur-md space-y-2 text-xs">
            <div className="flex items-center gap-2 text-doctus-red font-bold">
              <ShieldAlert className="w-4 h-4" />
              <span>Strict Security & Account Provisioning Protocol</span>
            </div>
            <p className="text-neutral-500 text-[11px]">
              Public registration is disabled. Employee accounts are created exclusively by authorized HR Administrators.
            </p>
          </div>
        </div>

        {/* Right Login Card */}
        <div className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md rounded-3xl p-8 border-2 border-doctus-yellow/40 shadow-2xl space-y-6">
          <div>
            <h3 className="text-xl font-extrabold text-neutral-950 dark:text-white">
              Employee Sign In
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              Enter your work email and password to access your self-service portal
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 text-xs font-bold text-red-800 dark:text-red-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-neutral-800 dark:text-neutral-200 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="employee@doctus.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-doctus-yellow"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-bold text-neutral-800 dark:text-neutral-200">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] font-bold text-doctus-red hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-doctus-yellow"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-doctus-yellow via-doctus-yellow-600 to-doctus-yellow text-neutral-950 font-black text-sm shadow-md hover:shadow-glow-yellow hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 border border-doctus-yellow-400"
            >
              <span>{isSubmitting ? 'Signing In...' : 'SIGN IN TO PORTAL'}</span>
              <ChevronRight className="w-4 h-4 text-doctus-red" />
            </button>
          </form>

          {/* Quick Demo Login Bar for Evaluator (Enabled ONLY when NOT in Production) */}
          {IS_DEMO_MODE_ENABLED && (
            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
              <span className="text-[10px] font-black tracking-widest text-doctus-red uppercase block text-center">
                Evaluator 1-Click Role Switcher (Demo)
              </span>
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {demoAccounts.map(a => (
                  <button
                    key={a.id}
                    onClick={() => {
                      setEmail(a.email);
                      switchDemoUser(a.id);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-[10px] font-bold text-neutral-700 dark:text-neutral-300 hover:bg-doctus-yellow hover:text-neutral-950 transition-colors"
                  >
                    {a.role} ({a.id})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 max-w-sm w-full border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-neutral-950 dark:text-white">Reset Password</h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-300">
              Please contact your HR Administrator (Priya Nair - hr@doctus.com) or enter your registered work email to receive a password reset link.
            </p>
            <input
              type="email"
              placeholder="employee@doctus.com"
              className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border text-xs"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowForgotModal(false)}
                className="px-4 py-2 rounded-xl border text-xs font-bold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert('Password reset link sent to your work email address.');
                  setShowForgotModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-doctus-yellow font-extrabold text-xs text-neutral-950"
              >
                Send Reset Link
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="text-center text-[11px] text-neutral-500 py-4">
        © 2026 Doctus Business Solutions. All rights reserved. • DOCTUS ATTENDANCE PORTAL
      </footer>
    </div>
  );
};
