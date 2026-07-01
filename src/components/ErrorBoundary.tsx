import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

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
    this.setState({
      error,
      errorInfo,
    });
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      const isAr = !navigator.language.startsWith('en');

      return (
        <div className="min-h-screen bg-[#faf8f6] dark:bg-[#0c0d12] flex items-center justify-center p-6 text-start select-none">
          <div className="w-full max-w-md premium-card p-8 rounded-2xl shadow-2xl border border-red-100/40 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center border border-red-200/50">
                <AlertTriangle className="w-7 h-7 text-red-500" />
              </div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white">
                {isAr ? 'عذراً، حدث خطأ غير متوقع' : 'Oops, something went wrong'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                {isAr
                  ? 'واجهت المنصة مشكلة أثناء رندرة بعض المكونات. يمكنك محاولة إعادة تشغيل الصفحة.'
                  : 'The platform encountered an issue while rendering some components. You can try reloading the page.'}
              </p>

              {this.state.error && (
                <div className="w-full bg-red-50/50 dark:bg-red-950/10 border border-red-100/50 dark:border-red-900/20 rounded-xl p-3 text-[10px] font-mono text-red-600 dark:text-red-400 overflow-x-auto text-left max-h-32 leading-normal whitespace-pre-wrap">
                  {this.state.error.toString()}
                </div>
              )}

              <button
                onClick={this.handleReset}
                className="mt-2 w-full py-2.5 bg-brown-600 hover:bg-brown-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{isAr ? 'إعادة تشغيل الصفحة' : 'Reload Page'}</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
