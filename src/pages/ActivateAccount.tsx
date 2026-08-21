import React, { useState, useEffect } from 'react';
import { Lock, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

export const ActivateAccount: React.FC = () => {
  const { activateAccount } = useAuth();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activatedSuccess, setActivatedSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      // Default demo activation token if none in URL
      setToken('ACTIVATE-DOCTUS-2026-MEERA-99');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Password and Confirm Password do not match.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await activateAccount(token, password);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setActivatedSuccess(true);
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Account activation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-doctus-cream via-doctus-yellow/20 to-doctus-cream dark:from-doctus-dark flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 max-w-md w-full border-2 border-doctus-yellow/40 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-doctus-yellow to-doctus-yellow-600 mx-auto flex items-center justify-center font-black text-doctus-red text-2xl shadow-md border border-doctus-yellow-400">
            D
          </div>
          <h2 className="text-2xl font-black text-neutral-950 dark:text-white">
            Activate Your Account
          </h2>
          <p className="text-xs text-neutral-500">
            DOCTUS Employee Attendance Portal • Password Setup
          </p>
        </div>

        {activatedSuccess ? (
          <div className="p-6 rounded-2xl bg-emerald-50 text-center space-y-2 border border-emerald-300">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="font-extrabold text-emerald-950 text-base">Account Activated Successfully!</h3>
            <p className="text-xs text-emerald-800">Redirecting to your Employee Dashboard...</p>
          </div>
        ) : (
          <>
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 text-red-800 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Activation Token
                </label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 font-mono text-doctus-red font-bold text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Create Password *
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border text-xs font-semibold"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-doctus-yellow to-doctus-yellow-600 font-black text-neutral-950 shadow-md hover:shadow-glow-yellow"
              >
                {isSubmitting ? 'Activating...' : 'ACTIVATE ACCOUNT & SIGN IN'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
