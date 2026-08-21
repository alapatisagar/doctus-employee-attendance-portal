import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[DOCTUS ERROR BOUNDARY] Uncaught render error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-doctus-cream dark:bg-doctus-dark flex items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md w-full bg-white dark:bg-neutral-900 rounded-3xl p-8 border-2 border-doctus-yellow/60 shadow-2xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-950/50 text-doctus-red mx-auto flex items-center justify-center border border-red-300">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-extrabold text-neutral-950 dark:text-white">
              Unable to load your employee profile
            </h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-300">
              {this.props.fallbackMessage || 'An unexpected rendering error occurred. Please refresh or contact your HR Administrator.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-doctus-yellow to-doctus-yellow-600 text-neutral-950 font-black text-xs shadow-md hover:scale-105 transition-all flex items-center justify-center gap-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4 text-doctus-red" />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
