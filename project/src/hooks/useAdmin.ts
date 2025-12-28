/**
 * Mimariproje.com - Admin Hook
 * Admin panel işlemleri için React hook
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface AdminUser {
  id: number;
  user_id: number;
  role: "super_admin" | "admin" | "moderator" | "support" | "analyst";
  is_active: boolean;
  permissions: string[];
  created_at: string;
  last_login?: string;
  login_count: number;
  user: {
    id: number;
    email: string;
    full_name?: string;
    first_name?: string;
    last_name?: string;
    profile_image_url?: string;
  };
}

export interface AdminDashboardData {
  stats: {
    total_users: number;
    total_projects: number;
    total_jobs: number;
    total_payments: number;
    new_users: number;
    new_projects: number;
    new_jobs: number;
    total_revenue: number;
    monthly_revenue: number;
    active_subscriptions: number;
  };
  daily_registrations: Array<{
    date: string;
    count: number;
  }>;
  recent_activities: Array<{
    id: number;
    action: string;
    resource_type: string;
    resource_id?: number;
    description?: string;
    created_at: string;
    admin_user: {
      id: number;
      email: string;
      full_name?: string;
      role: string;
    };
  }>;
  popular_projects: Array<any>;
}

export interface AdminLog {
  id: number;
  admin_user_id: number;
  action: string;
  resource_type: string;
  resource_id?: number;
  description?: string;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  admin_user: {
    id: number;
    email: string;
    full_name?: string;
    role: string;
  };
}

export interface SystemSetting {
  id: number;
  key: string;
  value: any;
  data_type: "string" | "int" | "float" | "bool" | "json";
  description?: string;
  category?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

interface UseAdminReturn {
  // Admin status
  isAdmin: boolean;
  adminUser: AdminUser | null;
  isLoading: boolean;
  error: string | null;

  // Dashboard
  dashboardData: AdminDashboardData | null;
  fetchDashboard: () => Promise<void>;

  // User management
  users: any[];
  fetchUsers: (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    user_type?: string;
    is_verified?: boolean;
    is_banned?: boolean;
    sort_by?: string;
    sort_order?: string;
  }) => Promise<void>;
  banUser: (
    userId: number,
    reason: string,
    duration?: number
  ) => Promise<boolean>;
  unbanUser: (userId: number) => Promise<boolean>;

  // Project management
  projects: any[];
  fetchProjects: (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    category?: string;
    status?: string;
    is_featured?: boolean;
  }) => Promise<void>;
  featureProject: (projectId: number) => Promise<boolean>;
  moderateProject: (
    projectId: number,
    status: string,
    notes?: string
  ) => Promise<boolean>;

  // System settings
  settings: SystemSetting[];
  fetchSettings: (category?: string) => Promise<void>;
  updateSettings: (settings: Partial<SystemSetting>[]) => Promise<boolean>;

  // Admin logs
  logs: AdminLog[];
  fetchLogs: (params?: {
    page?: number;
    per_page?: number;
    action?: string;
    resource_type?: string;
    admin_user_id?: number;
    start_date?: string;
    end_date?: string;
  }) => Promise<void>;

  // Permissions
  hasPermission: (permission: string) => boolean;
}

export function useAdmin(): UseAdminReturn {
  const { user, isAuthenticated } = useAuth();

  // State
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(
    null
  );
  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [logs, setLogs] = useState<AdminLog[]>([]);

  // API Base URL
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  // Helper function to get auth headers
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("access_token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }, []);

  // Check if user is admin
  const checkAdminStatus = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setIsAdmin(false);
      setAdminUser(null);
      return;
    }

    try {
      // Try to access admin health endpoint
      const response = await fetch(`${API_BASE_URL}/admin/health`, {
        headers: getAuthHeaders(),
      });

      if (response.status === 401 || response.status === 403) {
        setIsAdmin(false);
        setAdminUser(null);
        return;
      }

      // If successful, try to get admin user list to confirm
      const adminResponse = await fetch(`${API_BASE_URL}/admin/admins`, {
        headers: getAuthHeaders(),
      });

      if (adminResponse.ok) {
        const data = await adminResponse.json();
        if (data.success) {
          // Find current user in admin list
          const currentAdmin = data.data.admin_users.find(
            (admin: AdminUser) => admin.user_id === user.id
          );

          if (currentAdmin) {
            setIsAdmin(true);
            setAdminUser(currentAdmin);
          }
        }
      }
    } catch (err: any) {
      console.error("Admin status check failed:", err);
      setIsAdmin(false);
      setAdminUser(null);
    }
  }, [isAuthenticated, user, API_BASE_URL, getAuthHeaders]);

  // Fetch dashboard data
  const fetchDashboard = useCallback(async () => {
    if (!isAdmin) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (data.success) {
        setDashboardData(data.data);
      } else {
        setError(data.error || "Dashboard verileri alınamadı");
      }
    } catch (err: any) {
      setError(err.message || "Bağlantı hatası");
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, API_BASE_URL, getAuthHeaders]);

  // Fetch users
  const fetchUsers = useCallback(
    async (params?: {
      page?: number;
      per_page?: number;
      search?: string;
      user_type?: string;
      is_verified?: boolean;
      is_banned?: boolean;
      sort_by?: string;
      sort_order?: string;
    }) => {
      if (!isAdmin) return;

      setIsLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.set("page", params.page.toString());
        if (params?.per_page)
          queryParams.set("per_page", params.per_page.toString());
        if (params?.search) queryParams.set("search", params.search);
        if (params?.user_type) queryParams.set("user_type", params.user_type);
        if (params?.is_verified !== undefined)
          queryParams.set("is_verified", params.is_verified.toString());
        if (params?.is_banned !== undefined)
          queryParams.set("is_banned", params.is_banned.toString());
        if (params?.sort_by) queryParams.set("sort_by", params.sort_by);
        if (params?.sort_order)
          queryParams.set("sort_order", params.sort_order);

        const response = await fetch(
          `${API_BASE_URL}/admin/users?${queryParams}`,
          {
            headers: getAuthHeaders(),
          }
        );

        const data = await response.json();

        if (data.success) {
          setUsers(data.data.users);
        } else {
          setError(data.error || "Kullanıcı listesi alınamadı");
        }
      } catch (err: any) {
        setError(err.message || "Bağlantı hatası");
      } finally {
        setIsLoading(false);
      }
    },
    [isAdmin, API_BASE_URL, getAuthHeaders]
  );

  // Ban user
  const banUser = useCallback(
    async (
      userId: number,
      reason: string,
      duration?: number
    ): Promise<boolean> => {
      if (!isAdmin) return false;

      try {
        const response = await fetch(
          `${API_BASE_URL}/admin/users/${userId}/ban`,
          {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
              reason,
              ban_duration: duration,
            }),
          }
        );

        const data = await response.json();
        return data.success;
      } catch (err: any) {
        console.error("Ban user failed:", err);
        return false;
      }
    },
    [isAdmin, API_BASE_URL, getAuthHeaders]
  );

  // Unban user
  const unbanUser = useCallback(
    async (userId: number): Promise<boolean> => {
      if (!isAdmin) return false;

      try {
        const response = await fetch(
          `${API_BASE_URL}/admin/users/${userId}/unban`,
          {
            method: "POST",
            headers: getAuthHeaders(),
          }
        );

        const data = await response.json();
        return data.success;
      } catch (err: any) {
        console.error("Unban user failed:", err);
        return false;
      }
    },
    [isAdmin, API_BASE_URL, getAuthHeaders]
  );

  // Fetch projects
  const fetchProjects = useCallback(
    async (params?: {
      page?: number;
      per_page?: number;
      search?: string;
      category?: string;
      status?: string;
      is_featured?: boolean;
    }) => {
      if (!isAdmin) return;

      setIsLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.set("page", params.page.toString());
        if (params?.per_page)
          queryParams.set("per_page", params.per_page.toString());
        if (params?.search) queryParams.set("search", params.search);
        if (params?.category) queryParams.set("category", params.category);
        if (params?.status) queryParams.set("status", params.status);
        if (params?.is_featured !== undefined)
          queryParams.set("is_featured", params.is_featured.toString());

        const response = await fetch(
          `${API_BASE_URL}/admin/projects?${queryParams}`,
          {
            headers: getAuthHeaders(),
          }
        );

        const data = await response.json();

        if (data.success) {
          setProjects(data.data.projects);
        } else {
          setError(data.error || "Proje listesi alınamadı");
        }
      } catch (err: any) {
        setError(err.message || "Bağlantı hatası");
      } finally {
        setIsLoading(false);
      }
    },
    [isAdmin, API_BASE_URL, getAuthHeaders]
  );

  // Feature project
  const featureProject = useCallback(
    async (projectId: number): Promise<boolean> => {
      if (!isAdmin) return false;

      try {
        const response = await fetch(
          `${API_BASE_URL}/admin/projects/${projectId}/feature`,
          {
            method: "POST",
            headers: getAuthHeaders(),
          }
        );

        const data = await response.json();
        return data.success;
      } catch (err: any) {
        console.error("Feature project failed:", err);
        return false;
      }
    },
    [isAdmin, API_BASE_URL, getAuthHeaders]
  );

  // Moderate project
  const moderateProject = useCallback(
    async (
      projectId: number,
      status: string,
      notes?: string
    ): Promise<boolean> => {
      if (!isAdmin) return false;

      try {
        const response = await fetch(
          `${API_BASE_URL}/admin/projects/${projectId}/moderate`,
          {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
              status,
              notes,
            }),
          }
        );

        const data = await response.json();
        return data.success;
      } catch (err: any) {
        console.error("Moderate project failed:", err);
        return false;
      }
    },
    [isAdmin, API_BASE_URL, getAuthHeaders]
  );

  // Fetch settings
  const fetchSettings = useCallback(
    async (category?: string) => {
      if (!isAdmin) return;

      try {
        const queryParams = new URLSearchParams();
        if (category) queryParams.set("category", category);

        const response = await fetch(
          `${API_BASE_URL}/admin/settings?${queryParams}`,
          {
            headers: getAuthHeaders(),
          }
        );

        const data = await response.json();

        if (data.success) {
          setSettings(data.data.settings);
        } else {
          setError(data.error || "Ayarlar alınamadı");
        }
      } catch (err: any) {
        setError(err.message || "Bağlantı hatası");
      }
    },
    [isAdmin, API_BASE_URL, getAuthHeaders]
  );

  // Update settings
  const updateSettings = useCallback(
    async (newSettings: Partial<SystemSetting>[]): Promise<boolean> => {
      if (!isAdmin) return false;

      try {
        const response = await fetch(`${API_BASE_URL}/admin/settings`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            settings: newSettings,
          }),
        });

        const data = await response.json();

        if (data.success) {
          setSettings(data.data.settings);
          return true;
        }

        return false;
      } catch (err: any) {
        console.error("Update settings failed:", err);
        return false;
      }
    },
    [isAdmin, API_BASE_URL, getAuthHeaders]
  );

  // Fetch logs
  const fetchLogs = useCallback(
    async (params?: {
      page?: number;
      per_page?: number;
      action?: string;
      resource_type?: string;
      admin_user_id?: number;
      start_date?: string;
      end_date?: string;
    }) => {
      if (!isAdmin) return;

      try {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.set("page", params.page.toString());
        if (params?.per_page)
          queryParams.set("per_page", params.per_page.toString());
        if (params?.action) queryParams.set("action", params.action);
        if (params?.resource_type)
          queryParams.set("resource_type", params.resource_type);
        if (params?.admin_user_id)
          queryParams.set("admin_user_id", params.admin_user_id.toString());
        if (params?.start_date)
          queryParams.set("start_date", params.start_date);
        if (params?.end_date) queryParams.set("end_date", params.end_date);

        const response = await fetch(
          `${API_BASE_URL}/admin/logs?${queryParams}`,
          {
            headers: getAuthHeaders(),
          }
        );

        const data = await response.json();

        if (data.success) {
          setLogs(data.data.logs);
        } else {
          setError(data.error || "Log kayıtları alınamadı");
        }
      } catch (err: any) {
        setError(err.message || "Bağlantı hatası");
      }
    },
    [isAdmin, API_BASE_URL, getAuthHeaders]
  );

  // Check permissions
  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!adminUser) return false;
      return adminUser.permissions.includes(permission);
    },
    [adminUser]
  );

  // Effects
  useEffect(() => {
    checkAdminStatus();
  }, [checkAdminStatus]);

  return {
    // Admin status
    isAdmin,
    adminUser,
    isLoading,
    error,

    // Dashboard
    dashboardData,
    fetchDashboard,

    // User management
    users,
    fetchUsers,
    banUser,
    unbanUser,

    // Project management
    projects,
    fetchProjects,
    featureProject,
    moderateProject,

    // System settings
    settings,
    fetchSettings,
    updateSettings,

    // Admin logs
    logs,
    fetchLogs,

    // Permissions
    hasPermission,
  };
}
