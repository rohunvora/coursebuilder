import React, { Component, ReactNode } from 'react';
import { config } from '@/lib/config';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    
    // Store error in localStorage for debug panel
    if (config.debugMode) {
      const errors = JSON.parse(localStorage.getItem('debugErrors') || '[]');
      errors.push({
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
      });
      // Keep only last 10 errors
      localStorage.setItem('debugErrors', JSON.stringify(errors.slice(-10)));
    }

    // Log to debug endpoint if available
    if (config.debugMode || config.testMode) {
      fetch('/api/debug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'error',
          data: {
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
          },
        }),
      }).catch(console.error);
    }

    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h1>
              <p className="text-gray-600 mb-6">
                We encountered an unexpected error. Please try refreshing the page.
              </p>
              
              {config.debugMode && this.state.error && (
                <details className="text-left bg-gray-100 rounded p-4 mb-4">
                  <summary className="cursor-pointer font-semibold text-sm text-gray-700">
                    Error Details (Debug Mode)
                  </summary>
                  <pre className="mt-2 text-xs text-gray-600 overflow-auto">
                    {this.state.error.message}
                    {'\n\n'}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}

              <div className="space-y-2">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                >
                  Refresh Page
                </button>
                <button
                  onClick={() => {
                    localStorage.clear();
                    window.location.href = '/';
                  }}
                  className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300 transition-colors"
                >
                  Start Fresh
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}