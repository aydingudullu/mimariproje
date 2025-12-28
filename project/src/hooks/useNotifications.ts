/**
 * Mimariproje.com - Notifications Hook
 * Gerçek zamanlı bildirimler için React hook
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { io, Socket } from "socket.io-client";

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  priority: "low" | "normal" | "high" | "urgent";
  is_read: boolean;
  action_url?: string;
  action_text?: string;
  created_at: string;
  related_user?: {
    id: number;
    full_name: string;
    profile_image_url?: string;
  };
  metadata?: any;
}

export interface NotificationPreferences {
  email_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  email_notifications: Record<string, boolean>;
  push_notifications: Record<string, boolean>;
  in_app_notifications: Record<string, boolean>;
}

interface UseNotificationsReturn {
  // Notifications data
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  // WebSocket connection
  isConnected: boolean;
  connectionStatus: "connecting" | "connected" | "disconnected" | "error";

  // Actions
  fetchNotifications: (params?: {
    unread_only?: boolean;
    limit?: number;
    offset?: number;
    type?: string;
  }) => Promise<void>;
  markAsRead: (notificationId: number) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
  deleteNotification: (notificationId: number) => Promise<boolean>;

  // Preferences
  preferences: NotificationPreferences | null;
  updatePreferences: (
    newPreferences: Partial<NotificationPreferences>
  ) => Promise<boolean>;

  // Real-time events
  onNewNotification: (callback: (notification: Notification) => void) => void;
  offNewNotification: () => void;

  // Test functions (development)
  sendTestNotification: (data: {
    title?: string;
    message?: string;
    type?: string;
    action_url?: string;
  }) => Promise<boolean>;
}

export function useNotifications(): UseNotificationsReturn {
  const { user, isAuthenticated } = useAuth();

  // State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] =
    useState<NotificationPreferences | null>(null);

  // WebSocket state
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected" | "error"
  >("disconnected");

  // Refs
  const socketRef = useRef<Socket | null>(null);
  const newNotificationCallbackRef = useRef<
    ((notification: Notification) => void) | null
  >(null);

  // API Base URL
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  // Helper function to get auth headers
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("mimariproje_access_token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }, []);

  // Fetch notifications from API
  const fetchNotifications = useCallback(
    async (params?: {
      unread_only?: boolean;
      limit?: number;
      offset?: number;
      type?: string;
    }) => {
      if (!isAuthenticated) return;

      setIsLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams();
        if (params?.unread_only) queryParams.set("unread_only", "true");
        if (params?.limit) queryParams.set("limit", params.limit.toString());
        if (params?.offset) queryParams.set("offset", params.offset.toString());
        if (params?.type) queryParams.set("type", params.type);

        const response = await fetch(
          `${API_BASE_URL}/notifications?${queryParams}`,
          {
            headers: getAuthHeaders(),
          }
        );

        const data = await response.json();

        if (data.success) {
          setNotifications(data.data.notifications);
          setUnreadCount(data.data.unread_count);
        } else {
          setError(data.error || "Bildirimler yüklenemedi");
        }
      } catch (err: any) {
        setError(err.message || "Bağlantı hatası");
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated, API_BASE_URL, getAuthHeaders]
  );

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/unread-count`,
        {
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (data.success) {
        setUnreadCount(data.data.unread_count);
      }
    } catch (err: any) {
      console.error("Failed to fetch unread count:", err);
    }
  }, [isAuthenticated, API_BASE_URL, getAuthHeaders]);

  // Mark notification as read
  const markAsRead = useCallback(
    async (notificationId: number): Promise<boolean> => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/notifications/${notificationId}/read`,
          {
            method: "POST",
            headers: getAuthHeaders(),
          }
        );

        const data = await response.json();

        if (data.success) {
          // Update local state
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === notificationId ? { ...n, is_read: true } : n
            )
          );
          setUnreadCount((prev) => Math.max(0, prev - 1));
          return true;
        }

        return false;
      } catch (err: any) {
        console.error("Failed to mark as read:", err);
        return false;
      }
    },
    [API_BASE_URL, getAuthHeaders]
  );

  // Mark all notifications as read
  const markAllAsRead = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/mark-all-read`,
        {
          method: "POST",
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Update local state
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
        return true;
      }

      return false;
    } catch (err: any) {
      console.error("Failed to mark all as read:", err);
      return false;
    }
  }, [API_BASE_URL, getAuthHeaders]);

  // Delete notification
  const deleteNotification = useCallback(
    async (notificationId: number): Promise<boolean> => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/notifications/${notificationId}`,
          {
            method: "DELETE",
            headers: getAuthHeaders(),
          }
        );

        const data = await response.json();

        if (data.success) {
          // Update local state
          setNotifications((prev) =>
            prev.filter((n) => n.id !== notificationId)
          );
          // Update unread count if notification was unread
          const notification = notifications.find(
            (n) => n.id === notificationId
          );
          if (notification && !notification.is_read) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }
          return true;
        }

        return false;
      } catch (err: any) {
        console.error("Failed to delete notification:", err);
        return false;
      }
    },
    [API_BASE_URL, getAuthHeaders, notifications]
  );

  // Fetch preferences
  const fetchPreferences = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/preferences`,
        {
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (data.success) {
        setPreferences(data.data);
      }
    } catch (err: any) {
      console.error("Failed to fetch preferences:", err);
    }
  }, [isAuthenticated, API_BASE_URL, getAuthHeaders]);

  // Update preferences
  const updatePreferences = useCallback(
    async (
      newPreferences: Partial<NotificationPreferences>
    ): Promise<boolean> => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/notifications/preferences`,
          {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(newPreferences),
          }
        );

        const data = await response.json();

        if (data.success) {
          setPreferences(data.data);
          return true;
        }

        return false;
      } catch (err: any) {
        console.error("Failed to update preferences:", err);
        return false;
      }
    },
    [API_BASE_URL, getAuthHeaders]
  );

  // Send test notification (development)
  const sendTestNotification = useCallback(
    async (data: {
      title?: string;
      message?: string;
      type?: string;
      action_url?: string;
    }): Promise<boolean> => {
      try {
        const response = await fetch(`${API_BASE_URL}/notifications/test`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(data),
        });

        const result = await response.json();
        return result.success;
      } catch (err: any) {
        console.error("Failed to send test notification:", err);
        return false;
      }
    },
    [API_BASE_URL, getAuthHeaders]
  );

  // WebSocket connection management
  const connectWebSocket = useCallback(() => {
    if (!isAuthenticated || !user || socketRef.current?.connected) return;

    const token = localStorage.getItem("mimariproje_access_token");
    if (!token) return;

    setConnectionStatus("connecting");

    try {
      const socket = io(`${API_BASE_URL.replace("/api", "")}/notifications`, {
        auth: { token },
        transports: ["websocket", "polling"],
      });

      socket.on("connect", () => {
        setIsConnected(true);
        setConnectionStatus("connected");
        console.log("✅ WebSocket connected");
      });

      socket.on("disconnect", () => {
        setIsConnected(false);
        setConnectionStatus("disconnected");
        console.log("❌ WebSocket disconnected");
      });

      socket.on("connect_error", (error) => {
        setIsConnected(false);
        setConnectionStatus("error");
        console.error("❌ WebSocket connection error:", error);
      });

      // Listen for new notifications
      socket.on("notification", (data: Notification) => {
        console.log("🔔 New notification received:", data);

        // Add to notifications list
        setNotifications((prev) => [data, ...prev]);

        // Update unread count
        if (!data.is_read) {
          setUnreadCount((prev) => prev + 1);
        }

        // Call callback if set
        if (newNotificationCallbackRef.current) {
          newNotificationCallbackRef.current(data);
        }
      });

      socket.on("pong", (data) => {
        console.log("🏓 WebSocket pong received:", data);
      });

      socketRef.current = socket;
    } catch (error) {
      setConnectionStatus("error");
      console.error("❌ Failed to connect WebSocket:", error);
    }
  }, [isAuthenticated, user, API_BASE_URL]);

  const disconnectWebSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setIsConnected(false);
    setConnectionStatus("disconnected");
  }, []);

  // New notification callback management
  const onNewNotification = useCallback(
    (callback: (notification: Notification) => void) => {
      newNotificationCallbackRef.current = callback;
    },
    []
  );

  const offNewNotification = useCallback(() => {
    newNotificationCallbackRef.current = null;
  }, []);

  // Effects
  useEffect(() => {
    if (isAuthenticated && user) {
      // Fetch initial data
      fetchNotifications();
      fetchPreferences();
      fetchUnreadCount();

      // Connect WebSocket
      connectWebSocket();
    } else {
      // Disconnect WebSocket when not authenticated
      disconnectWebSocket();

      // Clear data
      setNotifications([]);
      setUnreadCount(0);
      setPreferences(null);
    }

    // Cleanup on unmount
    return () => {
      disconnectWebSocket();
    };
  }, [isAuthenticated, user]); // Only depend on auth state

  // Periodic unread count refresh
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, [isAuthenticated, fetchUnreadCount]);

  return {
    // Data
    notifications,
    unreadCount,
    isLoading,
    error,

    // WebSocket
    isConnected,
    connectionStatus,

    // Actions
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,

    // Preferences
    preferences,
    updatePreferences,

    // Events
    onNewNotification,
    offNewNotification,

    // Development
    sendTestNotification,
  };
}
