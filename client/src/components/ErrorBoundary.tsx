import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[React ErrorBoundary caught error]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-lg w-full text-center space-y-4 shadow-2xl">
            <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20 w-fit mx-auto text-rose-400">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-100">Application Error Encountered</h2>
            <p className="text-xs text-slate-400 font-mono bg-slate-950 p-3 rounded-lg border border-slate-800 text-left overflow-x-auto">
              {this.state.error?.toString()}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
