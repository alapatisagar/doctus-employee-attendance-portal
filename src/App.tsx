import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Login } from './pages/Login';
import { DashboardPage } from './pages/DashboardPage';
import { ActivateAccount } from './pages/ActivateAccount';
import { ShieldCheck, ShieldAlert, LogOut, RefreshCw } from 'lucide-react';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, unlinkedFirebaseUser, logout } = useAuth();
  const currentPath = window.location.pathname;

  if (currentPath === '/activate') {
    return <ActivateAccount />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-doctus-cream dark:bg-doctus-dark flex items-center justify-center font-sans p-4">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-doctus-yellow to-doctus-yellow-600 mx-auto flex items-center justify-center font-black text-doctus-red text-2xl animate-bounce border border-doctus-yellow-400 shadow-lg">
            D
          </div>
          <div className="space-y-1">
            <p className="text-sm font-extrabold text-neutral-900 dark:text-white flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-doctus-red" />
              Checking your secure session...
            </p>
            <p className="text-xs text-neutral-500">
              DOCTUS EMPLOYEE ATTENDANCE PORTAL
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Requirement 13 & 16: Unlinked Account Screen (NO silent redirect to login!)
  if (unlinkedFirebaseUser) {
    return (
      <div className="min-h-screen bg-doctus-cream dark:bg-doctus-dark flex items-center justify-center font-sans p-4">
        <div className="max-w-md w-full bg-white dark:bg-neutral-900 rounded-3xl p-8 border-2 border-doctus-yellow/60 shadow-2xl space-y-5 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 mx-auto flex items-center justify-center border border-amber-300">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-extrabold text-neutral-950 dark:text-white">
              Employee Account Linking Required
            </h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-300">
              Your Firebase account (<strong>{unlinkedFirebaseUser.email}</strong>) is authenticated, but your Doctus employee profile has not been linked yet. Please contact HR Administration.
            </p>
            <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-[11px] font-mono text-neutral-500 text-left space-y-1">
              <div><strong>Firebase Auth UID:</strong> {unlinkedFirebaseUser.uid}</div>
              <div><strong>Authenticated Email:</strong> {unlinkedFirebaseUser.email}</div>
              <div><strong>Profile Status:</strong> UNLINKED / PENDING ONBOARDING</div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-bold flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4 text-doctus-red" />
              <span>Retry</span>
            </button>
            <button
              onClick={logout}
              className="px-5 py-2.5 rounded-xl bg-doctus-red text-white font-extrabold text-xs shadow-md flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return <DashboardPage />;
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
