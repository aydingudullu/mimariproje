/**
 * Mimariproje.com - Error Boundary Component
 * React uygulamasında hataları yakalayan ve kullanıcı dostu hata sayfası gösteren component
 */

"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home, Bug, Mail } from "lucide-react";
import Link from "next/link";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: "",
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Hata oluştuğunda state'i güncelle
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Hata bilgilerini state'e kaydet
    this.setState({
      error,
      errorInfo,
    });

    // Hata raporlama servisine gönder (örn: Sentry, LogRocket)
    this.logError(error, errorInfo);

    // Parent component'e hata bilgisini gönder
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    // Hata detaylarını konsola yazdır (development)
    if (process.env.NODE_ENV === "development") {
      console.group("🚨 Error Boundary Caught An Error");
      console.error("Error:", error);
      console.error("Error Info:", errorInfo);
      console.error("Stack Trace:", error.stack);
      console.groupEnd();
    }

    // Production'da hata raporlama servisine gönder
    if (process.env.NODE_ENV === "production") {
      // Burada Sentry, LogRocket veya başka bir hata raporlama servisi kullanılabilir
      try {
        // Örnek: API'ye hata raporu gönder
        fetch("/api/error-report", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            errorId: this.state.errorId,
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
          }),
        }).catch(() => {
          // API'ye gönderim başarısız olursa localStorage'a kaydet
          const errorLog = {
            errorId: this.state.errorId,
            message: error.message,
            timestamp: new Date().toISOString(),
            url: window.location.href,
          };

          try {
            const existingLogs = JSON.parse(
              localStorage.getItem("error_logs") || "[]"
            );
            existingLogs.push(errorLog);
            localStorage.setItem(
              "error_logs",
              JSON.stringify(existingLogs.slice(-10))
            ); // Son 10 hatayı sakla
          } catch (storageError) {
            console.error("Failed to store error log:", storageError);
          }
        });
      } catch (reportError) {
        console.error("Failed to report error:", reportError);
      }
    }
  };

  private handleRetry = () => {
    // State'i sıfırla ve component'i yeniden render et
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: "",
    });
  };

  private handleReload = () => {
    // Sayfayı yeniden yükle
    window.location.reload();
  };

  private copyErrorDetails = () => {
    const errorDetails = {
      errorId: this.state.errorId,
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };

    navigator.clipboard
      .writeText(JSON.stringify(errorDetails, null, 2))
      .then(() => {
        alert("Hata detayları panoya kopyalandı!");
      });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI varsa onu göster
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-red-100 dark:bg-red-900/20 rounded-full w-fit">
                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-2xl text-slate-900 dark:text-white">
                Oops! Bir Hata Oluştu
              </CardTitle>
              <p className="text-slate-600 dark:text-slate-300 mt-2">
                Üzgünüz, beklenmeyen bir hata oluştu. Teknik ekibimiz bu
                durumdan haberdar edildi.
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Error ID */}
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                  Hata Kodu:
                </p>
                <code className="text-sm font-mono bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                  {this.state.errorId}
                </code>
              </div>

              {/* Development Mode: Error Details */}
              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg">
                  <summary className="cursor-pointer font-medium text-red-800 dark:text-red-200 mb-2">
                    Geliştirici Detayları (Development Mode)
                  </summary>
                  <div className="mt-4 space-y-2">
                    <div>
                      <p className="text-sm font-medium text-red-700 dark:text-red-300">
                        Error Message:
                      </p>
                      <code className="text-xs bg-red-100 dark:bg-red-900/20 p-2 rounded block mt-1">
                        {this.state.error.message}
                      </code>
                    </div>
                    {this.state.error.stack && (
                      <div>
                        <p className="text-sm font-medium text-red-700 dark:text-red-300">
                          Stack Trace:
                        </p>
                        <pre className="text-xs bg-red-100 dark:bg-red-900/20 p-2 rounded mt-1 overflow-auto max-h-32">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={this.handleRetry} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tekrar Dene
                </Button>
                <Button
                  variant="outline"
                  onClick={this.handleReload}
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sayfayı Yenile
                </Button>
                <Button variant="outline" asChild className="flex-1">
                  <Link href="/">
                    <Home className="h-4 w-4 mr-2" />
                    Ana Sayfa
                  </Link>
                </Button>
              </div>

              {/* Support Actions */}
              <div className="border-t pt-4">
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                  Sorun devam ediyorsa:
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={this.copyErrorDetails}
                    className="justify-start"
                  >
                    <Bug className="h-4 w-4 mr-2" />
                    Hata Detaylarını Kopyala
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="justify-start"
                  >
                    <Link href="/iletisim">
                      <Mail className="h-4 w-4 mr-2" />
                      Destek Ekibi ile İletişim
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Hata yoksa normal children'ı render et
    return this.props.children;
  }
}

export default ErrorBoundary;

// Functional component wrapper for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback} onError={onError}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name
  })`;

  return WrappedComponent;
}
