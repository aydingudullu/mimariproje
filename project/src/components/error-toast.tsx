/**
 * Mimariproje.com - Error Toast Component
 * Hataları toast bildirimi olarak gösteren component
 */

"use client";

import { useEffect, useState } from "react";
import { X, AlertCircle, AlertTriangle, Info, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ToastProps {
  id: string;
  message: string;
  type: "error" | "warning" | "info" | "success";
  duration?: number;
  persistent?: boolean;
  onClose?: (id: string) => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function ErrorToast({
  id,
  message,
  type,
  duration = 5000,
  persistent = false,
  onClose,
  action,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  // Animation için useEffect
  useEffect(() => {
    // Mount olduğunda görünür yap
    const showTimer = setTimeout(() => setIsVisible(true), 10);

    // Otomatik kapanma (persistent değilse)
    let hideTimer: NodeJS.Timeout;
    if (!persistent && duration > 0) {
      hideTimer = setTimeout(() => {
        handleClose();
      }, duration);
    }

    return () => {
      clearTimeout(showTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [duration, persistent]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose?.(id);
    }, 300); // Animation süresi
  };

  // Type'a göre stil ve icon
  const getToastConfig = () => {
    switch (type) {
      case "error":
        return {
          icon: AlertCircle,
          bgColor: "bg-red-50 dark:bg-red-900/20",
          borderColor: "border-red-200 dark:border-red-800",
          iconColor: "text-red-600 dark:text-red-400",
          textColor: "text-red-800 dark:text-red-200",
        };
      case "warning":
        return {
          icon: AlertTriangle,
          bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
          borderColor: "border-yellow-200 dark:border-yellow-800",
          iconColor: "text-yellow-600 dark:text-yellow-400",
          textColor: "text-yellow-800 dark:text-yellow-200",
        };
      case "success":
        return {
          icon: CheckCircle,
          bgColor: "bg-green-50 dark:bg-green-900/20",
          borderColor: "border-green-200 dark:border-green-800",
          iconColor: "text-green-600 dark:text-green-400",
          textColor: "text-green-800 dark:text-green-200",
        };
      case "info":
      default:
        return {
          icon: Info,
          bgColor: "bg-blue-50 dark:bg-blue-900/20",
          borderColor: "border-blue-200 dark:border-blue-800",
          iconColor: "text-blue-600 dark:text-blue-400",
          textColor: "text-blue-800 dark:text-blue-200",
        };
    }
  };

  const config = getToastConfig();
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 max-w-sm w-full pointer-events-auto",
        "transform transition-all duration-300 ease-in-out",
        isVisible && !isLeaving
          ? "translate-x-0 opacity-100"
          : "translate-x-full opacity-0",
        isLeaving && "translate-x-full opacity-0"
      )}
    >
      <div
        className={cn(
          "rounded-lg border shadow-lg p-4",
          config.bgColor,
          config.borderColor
        )}
      >
        <div className="flex items-start">
          {/* Icon */}
          <div className="flex-shrink-0">
            <Icon className={cn("h-5 w-5", config.iconColor)} />
          </div>

          {/* Content */}
          <div className="ml-3 flex-1">
            <p className={cn("text-sm font-medium", config.textColor)}>
              {message}
            </p>

            {/* Action Button */}
            {action && (
              <div className="mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={action.onClick}
                  className={cn(
                    "h-8 px-3 text-xs",
                    config.textColor,
                    "hover:bg-white/50 dark:hover:bg-black/20"
                  )}
                >
                  {action.label}
                </Button>
              </div>
            )}
          </div>

          {/* Close Button */}
          <div className="ml-4 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className={cn(
                "h-6 w-6 p-0",
                config.textColor,
                "hover:bg-white/50 dark:hover:bg-black/20"
              )}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progress bar (sadece otomatik kapanan toast'lar için) */}
        {!persistent && duration > 0 && (
          <div className="mt-3 h-1 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all ease-linear",
                type === "error"
                  ? "bg-red-500"
                  : type === "warning"
                  ? "bg-yellow-500"
                  : type === "success"
                  ? "bg-green-500"
                  : "bg-blue-500"
              )}
              style={{
                animation: `toast-progress ${duration}ms linear`,
                width: "100%",
              }}
            />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes toast-progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}

// Toast Container Component
export interface ToastContainerProps {
  toasts: ToastProps[];
  onRemoveToast: (id: string) => void;
}

export function ToastContainer({ toasts, onRemoveToast }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <ErrorToast key={toast.id} {...toast} onClose={onRemoveToast} />
      ))}
    </div>
  );
}

// Toast Manager Hook
export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = (toast: Omit<ToastProps, "id">) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newToast: ToastProps = { ...toast, id };

    setToasts((prev) => [...prev, newToast]);

    return id;
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const clearAllToasts = () => {
    setToasts([]);
  };

  // Convenience methods
  const showError = (message: string, options?: Partial<ToastProps>) => {
    return addToast({ ...options, message, type: "error" });
  };

  const showWarning = (message: string, options?: Partial<ToastProps>) => {
    return addToast({ ...options, message, type: "warning" });
  };

  const showSuccess = (message: string, options?: Partial<ToastProps>) => {
    return addToast({ ...options, message, type: "success" });
  };

  const showInfo = (message: string, options?: Partial<ToastProps>) => {
    return addToast({ ...options, message, type: "info" });
  };

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    showError,
    showWarning,
    showSuccess,
    showInfo,
  };
}
