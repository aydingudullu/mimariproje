/**
 * Mimariproje.com - Global Error Handler Hook
 * API hatalarını ve diğer hataları merkezi olarak yöneten custom hook
 */

"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export interface ErrorInfo {
  id: string;
  message: string;
  type: "api" | "validation" | "network" | "auth" | "unknown";
  statusCode?: number;
  timestamp: string;
  context?: string;
  recoverable: boolean;
}

export interface UseErrorHandlerReturn {
  error: ErrorInfo | null;
  isError: boolean;
  clearError: () => void;
  handleError: (error: any, context?: string) => ErrorInfo;
  handleApiError: (response: any, context?: string) => ErrorInfo | null;
  showError: (message: string, type?: ErrorInfo["type"]) => ErrorInfo;
}

export function useErrorHandler(): UseErrorHandlerReturn {
  const [error, setError] = useState<ErrorInfo | null>(null);
  const router = useRouter();

  // Hata temizleme
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Genel hata işleyici
  const handleError = useCallback(
    (error: any, context?: string): ErrorInfo => {
      let errorInfo: ErrorInfo;

      if (error instanceof Error) {
        // JavaScript Error nesnesi
        errorInfo = {
          id: generateErrorId(),
          message: error.message,
          type: determineErrorType(error),
          timestamp: new Date().toISOString(),
          context,
          recoverable: isRecoverableError(error),
        };
      } else if (typeof error === "string") {
        // String hata mesajı
        errorInfo = {
          id: generateErrorId(),
          message: error,
          type: "unknown",
          timestamp: new Date().toISOString(),
          context,
          recoverable: true,
        };
      } else if (error?.response) {
        // HTTP Response hatası (Axios style)
        errorInfo = {
          id: generateErrorId(),
          message:
            error.response.data?.message || error.message || "Bilinmeyen hata",
          type: "api",
          statusCode: error.response.status,
          timestamp: new Date().toISOString(),
          context,
          recoverable: error.response.status < 500,
        };
      } else {
        // Bilinmeyen hata türü
        errorInfo = {
          id: generateErrorId(),
          message: "Beklenmeyen bir hata oluştu",
          type: "unknown",
          timestamp: new Date().toISOString(),
          context,
          recoverable: true,
        };
      }

      // Hata tipine göre özel işlemler
      handleSpecialCases(errorInfo);

      // State'i güncelle
      setError(errorInfo);

      // Hata logla
      logError(errorInfo, error);

      return errorInfo;
    },
    [router]
  );

  // API hatalarını işleme
  const handleApiError = useCallback(
    (response: any, context?: string): ErrorInfo | null => {
      if (response?.success === false && response?.error) {
        return handleError(new Error(response.error), context);
      }
      return null;
    },
    [handleError]
  );

  // Manuel hata gösterme
  const showError = useCallback(
    (message: string, type: ErrorInfo["type"] = "unknown"): ErrorInfo => {
      const errorInfo: ErrorInfo = {
        id: generateErrorId(),
        message,
        type,
        timestamp: new Date().toISOString(),
        recoverable: true,
      };

      setError(errorInfo);
      return errorInfo;
    },
    []
  );

  // Özel durumları işleme
  const handleSpecialCases = useCallback(
    (errorInfo: ErrorInfo) => {
      switch (errorInfo.statusCode) {
        case 401:
          // Unauthorized - token süresi dolmuş olabilir
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          router.push("/auth/giris?expired=true");
          break;
        case 403:
          // Forbidden - yetkisiz erişim
          router.push("/");
          break;
        case 404:
          // Not Found - sayfa bulunamadı
          if (errorInfo.context?.includes("page")) {
            router.push("/404");
          }
          break;
        case 500:
        case 502:
        case 503:
          // Server errors - maintenance sayfası göster
          if (errorInfo.context?.includes("critical")) {
            router.push("/maintenance");
          }
          break;
      }

      // Network hatası için özel işlem
      if (errorInfo.type === "network") {
        // Offline durumunu kontrol et
        if (!navigator.onLine) {
          errorInfo.message = "İnternet bağlantınızı kontrol edin";
        }
      }
    },
    [router]
  );

  return {
    error,
    isError: error !== null,
    clearError,
    handleError,
    handleApiError,
    showError,
  };
}

// Yardımcı fonksiyonlar
function generateErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function determineErrorType(error: Error): ErrorInfo["type"] {
  const message = error.message.toLowerCase();

  if (message.includes("network") || message.includes("fetch")) {
    return "network";
  }
  if (message.includes("validation") || message.includes("invalid")) {
    return "validation";
  }
  if (message.includes("unauthorized") || message.includes("forbidden")) {
    return "auth";
  }

  return "unknown";
}

function isRecoverableError(error: Error): boolean {
  const message = error.message.toLowerCase();

  // Bu hatalar genelde geçici ve düzeltilebilir
  const recoverablePatterns = [
    "network",
    "timeout",
    "connection",
    "fetch",
    "validation",
  ];

  return recoverablePatterns.some((pattern) => message.includes(pattern));
}

function logError(errorInfo: ErrorInfo, originalError: any) {
  // Development'da konsola yazdır
  if (process.env.NODE_ENV === "development") {
    console.group(`🚨 Error Handler: ${errorInfo.type.toUpperCase()}`);
    console.error("Error Info:", errorInfo);
    console.error("Original Error:", originalError);
    console.groupEnd();
  }

  // Production'da hata raporlama servisine gönder
  if (process.env.NODE_ENV === "production") {
    try {
      // API'ye hata raporu gönder
      fetch("/api/error-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...errorInfo,
          userAgent: navigator.userAgent,
          url: window.location.href,
          stack: originalError?.stack,
        }),
      }).catch(() => {
        // API'ye gönderim başarısız olursa localStorage'a kaydet
        try {
          const existingLogs = JSON.parse(
            localStorage.getItem("error_logs") || "[]"
          );
          existingLogs.push({
            ...errorInfo,
            url: window.location.href,
          });
          localStorage.setItem(
            "error_logs",
            JSON.stringify(existingLogs.slice(-10))
          );
        } catch (storageError) {
          console.error("Failed to store error log:", storageError);
        }
      });
    } catch (reportError) {
      console.error("Failed to report error:", reportError);
    }
  }
}

// Error Context Provider için tip tanımları
export interface ErrorContextType {
  handleError: (error: any, context?: string) => ErrorInfo;
  handleApiError: (response: any, context?: string) => ErrorInfo | null;
  showError: (message: string, type?: ErrorInfo["type"]) => ErrorInfo;
  clearError: () => void;
  currentError: ErrorInfo | null;
}
