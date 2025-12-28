'use client';

/**
 * Global Error Page
 * Next.js App Router error boundary
 */

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console in development
    console.error('Application Error:', error);
    
    // In production, you could send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error tracking
      fetch('/api/error-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          digest: error.digest,
          timestamp: new Date().toISOString(),
          url: window.location.href,
        }),
      }).catch(() => {
        // Silent fail
      });
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-slate-950 dark:via-slate-900 dark:to-red-950/20 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto">
        {/* Error Icon */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 animate-ping bg-red-500/20 rounded-full scale-150" />
          <div className="relative bg-gradient-to-r from-red-500 to-orange-500 rounded-full p-6 inline-block">
            <AlertTriangle className="h-16 w-16 text-white" />
          </div>
        </div>

        {/* Content */}
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Bir Şeyler Yanlış Gitti
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 mb-4 max-w-md mx-auto">
          Üzgünüz, beklenmeyen bir hata oluştu. Teknik ekibimiz bu durumdan haberdar edildi.
        </p>

        {/* Error Digest (for debugging) */}
        {error.digest && (
          <div className="mb-8 inline-block bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Hata Kodu: <code className="font-mono">{error.digest}</code>
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Button
            onClick={reset}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8"
          >
            <RefreshCw className="mr-2 h-5 w-5" />
            Tekrar Dene
          </Button>
          
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            size="lg"
            className="border-slate-300 dark:border-slate-600"
          >
            <Home className="mr-2 h-5 w-5" />
            Ana Sayfaya Dön
          </Button>
        </div>

        {/* Development Error Details */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-8 text-left bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl p-4 max-w-lg mx-auto">
            <summary className="cursor-pointer font-medium text-red-800 dark:text-red-200 flex items-center">
              <Bug className="h-4 w-4 mr-2" />
              Geliştirici Detayları
            </summary>
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-red-700 dark:text-red-300">
                {error.message}
              </p>
              {error.stack && (
                <pre className="text-xs bg-red-100 dark:bg-red-900/20 p-3 rounded overflow-auto max-h-40 text-red-800 dark:text-red-200">
                  {error.stack}
                </pre>
              )}
            </div>
          </details>
        )}

        {/* Help Section */}
        <div className="mt-8 p-6 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Sorun devam ediyorsa{' '}
            <a href="/iletisim" className="text-blue-600 hover:underline">
              destek ekibimize ulaşın
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
