/**
 * Mimariproje.com - API Client
 * Backend API'leri ile iletişim için merkezi client
 */

// API Base URL
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Token storage keys
const ACCESS_TOKEN_KEY = "mimariproje_access_token";
const REFRESH_TOKEN_KEY = "mimariproje_refresh_token";

// Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  user_type: "individual" | "company";
  profession?: string;
  phone?: string;
  location?: string;
  bio?: string;
  avatar_url?: string;
  profile_image_url?: string;
  is_verified: boolean;
  subscription_type: string;
  created_at: string;
  full_name: string;
  rating?: number;
  specializations?: string;
  website?: string;
  is_online?: boolean;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  location?: string;
  area?: string;
  style?: string;
  images?: string[];
  user_id: number;
  user?: User;
  is_featured: boolean;
  featured_until?: string;
  created_at: string;
  updated_at: string;
  // Rich details
  specifications?: any;
  deliverables?: any;
  license?: any;
  tags?: string[];
  views?: number;
  saves?: number;
  sales?: number;
  rating?: number;
  reviews?: any[];
  currency?: string;
}

export interface Job {
  id: number;
  title: string;
  description: string;
  category: string;
  budget_min: number;
  budget_max: number;
  location?: string;
  deadline?: string;
  employer_id: number;
  employer?: User;
  is_active: boolean;
  is_premium: boolean;
  expires_at?: string;
  created_at: string;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  message_type: "text" | "image" | "file";
  file_url?: string;
  is_read: boolean;
  created_at: string;
  sender?: User;
}

export interface Conversation {
  id: number;
  user1_id: number;
  user2_id: number;
  last_message_at?: string;
  other_user?: User;
  last_message?: Message;
  unread_count: number;
}

export interface Payment {
  id: number;
  amount: number;
  currency: string;
  payment_type: string;
  status: string;
  description?: string;
  created_at: string;
}

export interface Subscription {
  id: number;
  plan_type: string;
  status: string;
  monthly_price: number;
  currency: string;
  is_active: boolean;
  days_until_expiry: number;
  current_period_end?: string;
}

/**
 * Token yönetimi
 */
export const tokenManager = {
  getAccessToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setTokens: (accessToken: string, refreshToken: string): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  clearTokens: (): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  isAuthenticated: (): boolean => {
    return !!tokenManager.getAccessToken();
  },
};

/**
 * HTTP Client
 */
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  // Error handling helper
  private handleApiError(error: any, endpoint: string): never {
    // Network error
    if (!error.response) {
      const networkError = new Error(`Network error: ${error.message}`);
      (networkError as any).type = "network";
      (networkError as any).endpoint = endpoint;
      throw networkError;
    }

    // HTTP error
    const httpError = new Error(
      error.response?.data?.message ||
        error.response?.data?.error ||
        `HTTP ${error.response.status}: ${error.response.statusText}`
    );
    (httpError as any).status = error.response.status;
    (httpError as any).type = "http";
    (httpError as any).endpoint = endpoint;
    (httpError as any).data = error.response.data;

    throw httpError;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    // Default headers
    const headers: any = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Add auth token if available
    const token = tokenManager.getAccessToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle different response types
      let data;
      const contentType = response.headers.get("content-type");

      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        // Handle 401 - Token expired
        if (response.status === 401 && token) {
          console.log(`ApiClient: 401 Unauthorized at ${endpoint}. Attempting refresh...`);
          // Try to refresh token
          const refreshSuccess = await this.refreshToken();
          if (refreshSuccess) {
            console.log("ApiClient: Token refresh successful. Retrying request...");
            // Retry original request with new token
            return this.request(endpoint, options);
          } else {
            console.log("ApiClient: Token refresh failed. Redirecting to login.");
            // Refresh failed, redirect to login
            tokenManager.clearTokens();
            if (typeof window !== "undefined") {
              window.location.href = "/auth/giris";
            }
          }
        }

        return {
          success: false,
          error: data?.error || data?.message || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data,
        message: data?.message,
      };
    } catch (error) {
      console.error("API Request failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }

  private async refreshToken(): Promise<boolean> {
    const refreshToken = tokenManager.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        tokenManager.setTokens(data.access_token, data.refresh_token);
        return true;
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
    }

    return false;
  }

  // HTTP Methods
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  async upload<T>(
    endpoint: string,
    formData: FormData
  ): Promise<ApiResponse<T>> {
    const token = tokenManager.getAccessToken();
    const headers: HeadersInit = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "POST",
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data?.error || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data,
        message: data?.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      };
    }
  }
}

// API Client instance
const apiClient = new ApiClient(API_BASE_URL);

/**
 * Authentication API
 */
export const authApi = {
  register: async (userData: {
    email: string;
    password: string;
    user_type: "individual" | "company";
    first_name?: string;
    last_name?: string;
    company_name?: string;
    profession?: string;
    phone?: string;
    location?: string;
  }) => {
    const response = await apiClient.post<{ access_token: string; refresh_token: string; user: User }>("/auth/register", userData);

    if (response.success && response.data) {
      tokenManager.setTokens(
        response.data.access_token,
        response.data.refresh_token
      );
    }

    return response;
  },

  login: async (email: string, password: string) => {
    const response = await apiClient.post<{ access_token: string; refresh_token: string; user: User }>("/auth/login", { email, password });

    if (response.success && response.data) {
      tokenManager.setTokens(
        response.data.access_token,
        response.data.refresh_token
      );
    }

    return response;
  },

  logout: async () => {
    const response = await apiClient.post("/auth/logout");
    tokenManager.clearTokens();
    return response;
  },

  getCurrentUser: async (): Promise<ApiResponse<{ user: User }>> => {
    return apiClient.get("/auth/me");
  },

  refreshToken: async () => {
    const refreshToken = tokenManager.getRefreshToken();
    if (!refreshToken) return { success: false, error: "No refresh token" };

    const response = await apiClient.post<{ access_token: string; refresh_token: string }>("/auth/refresh", {
      refresh_token: refreshToken,
    });

    if (response.success && response.data) {
      tokenManager.setTokens(
        response.data.access_token,
        response.data.refresh_token
      );
    }

    return response;
  },

  requestPasswordReset: async (email: string) => {
    return apiClient.post("/auth/forgot-password", { email });
  },

  resetPassword: async (token: string, password: string) => {
    return apiClient.post("/auth/reset-password", { token, password });
  },
};

/**
 * Projects API
 */
export const projectsApi = {
  getProjects: async (params?: {
    page?: number;
    per_page?: number;
    category?: string;
    location?: string;
    min_price?: number;
    max_price?: number;
    search?: string;
  }): Promise<ApiResponse<{ projects: Project[]; pagination: any }>> => {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/projects${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return apiClient.get(endpoint);
  },

  getProject: async (
    id: number
  ): Promise<ApiResponse<{ project: Project }>> => {
    return apiClient.get(`/projects/${id}`);
  },

  createProject: async (projectData: {
    title: string;
    description: string;
    category: string;
    price: number;
    location?: string;
    area?: string;
    style?: string;
  }): Promise<ApiResponse<{ project: Project }>> => {
    return apiClient.post("/projects", projectData);
  },

  updateProject: async (id: number, projectData: Partial<Project>) => {
    return apiClient.put(`/projects/${id}`, projectData);
  },

  deleteProject: async (id: number) => {
    return apiClient.delete(`/projects/${id}`);
  },

  getMyProjects: async (): Promise<ApiResponse<{ projects: Project[] }>> => {
    return apiClient.get("/projects/my");
  },

  likeProject: async (id: number) => {
    return apiClient.post(`/projects/${id}/like`);
  },
};

/**
 * Jobs API
 */
export const jobsApi = {
  getJobs: async (params?: {
    page?: number;
    per_page?: number;
    category?: string;
    location?: string;
    min_budget?: number;
    max_budget?: number;
    search?: string;
  }): Promise<ApiResponse<{ jobs: Job[]; pagination: any }>> => {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/jobs${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return apiClient.get(endpoint);
  },

  getJob: async (id: number): Promise<ApiResponse<{ job: Job }>> => {
    return apiClient.get(`/jobs/${id}`);
  },

  createJob: async (jobData: {
    title: string;
    description: string;
    category: string;
    budget_min: number;
    budget_max: number;
    location?: string;
    deadline?: string;
  }): Promise<ApiResponse<{ job: Job }>> => {
    return apiClient.post("/jobs", jobData);
  },

  applyToJob: async (
    id: number,
    applicationData: {
      cover_letter: string;
      proposed_price: number;
      estimated_duration: string;
    }
  ) => {
    return apiClient.post(`/jobs/${id}/apply`, applicationData);
  },

  getMyJobs: async (): Promise<ApiResponse<{ jobs: Job[] }>> => {
    return apiClient.get("/my-jobs");
  },
};

/**
 * Messages API
 */
export const messagesApi = {
  getConversations: async (): Promise<
    ApiResponse<{ conversations: Conversation[] }>
  > => {
    return apiClient.get("/messages/conversations");
  },

  startConversation: async (
    userId: number
  ): Promise<ApiResponse<{ conversation: Conversation }>> => {
    return apiClient.post(`/messages/conversations/${userId}`);
  },

  createConversation: async (data: {
    other_user_id: number;
    initial_message: string;
  }): Promise<ApiResponse<{ conversation: Conversation }>> => {
    return apiClient.post("/messages/conversations", data);
  },

  getMessages: async (
    conversationId: number
  ): Promise<ApiResponse<{ messages: Message[] }>> => {
    return apiClient.get(`/messages/conversations/${conversationId}/messages`);
  },

  sendMessage: async (
    conversationId: number,
    messageData: {
      content: string;
      message_type?: "text" | "image" | "file";
      file_url?: string;
    }
  ): Promise<ApiResponse<{ sent_message: Message }>> => {
    return apiClient.post(
      `/messages/conversations/${conversationId}/messages`,
      messageData
    );
  },

  getUnreadCount: async (): Promise<ApiResponse<{ unread_count: number }>> => {
    return apiClient.get("/messages/unread-count");
  },

  searchMessages: async (
    query: string
  ): Promise<ApiResponse<{ messages: Message[] }>> => {
    return apiClient.get(`/messages/search?q=${encodeURIComponent(query)}`);
  },

  deleteMessage: async (messageId: number): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/messages/${messageId}`);
  },
};

/**
 * Upload API
 */
export const uploadApi = {
  uploadProfileImage: async (
    file: File
  ): Promise<ApiResponse<{ file_url: string; thumbnails: any }>> => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.upload("/upload/profile-image", formData);
  },

  uploadProjectImages: async (
    files: File[]
  ): Promise<ApiResponse<{ uploaded_files: any[] }>> => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    return apiClient.upload("/upload/project-images", formData);
  },

  uploadMessageFile: async (
    file: File
  ): Promise<ApiResponse<{ file_url: string }>> => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.upload("/upload/message-file", formData);
  },
};

/**
 * Payments API
 */
export const paymentsApi = {
  getSubscriptionPlans: async (): Promise<
    ApiResponse<{ plans: any; currency: string }>
  > => {
    return apiClient.get("/payments/subscription-plans");
  },

  createSubscriptionPayment: async (
    planType: string
  ): Promise<ApiResponse<any>> => {
    return apiClient.post("/payments/create-subscription-payment", {
      plan_type: planType,
    });
  },

  createProjectBoostPayment: async (
    projectId: number
  ): Promise<ApiResponse<any>> => {
    return apiClient.post("/payments/create-project-boost-payment", {
      project_id: projectId,
    });
  },

  getMyPayments: async (): Promise<ApiResponse<{ payments: Payment[] }>> => {
    return apiClient.get("/payments/my-payments");
  },

  getMySubscription: async (): Promise<
    ApiResponse<{ subscription: Subscription | null }>
  > => {
    return apiClient.get("/payments/my-subscription");
  },

  cancelSubscription: async () => {
    return apiClient.post("/payments/cancel-subscription");
  },
};

/**
 * Email API
 */
export const emailApi = {
  sendVerificationEmail: async (email: string) => {
    return apiClient.post("/email/send-verification", { email });
  },

  verifyEmail: async (token: string) => {
    return apiClient.post("/email/verify-email", { token });
  },

  resendVerificationEmail: async () => {
    return apiClient.post("/email/resend-verification");
  },

  forgotPassword: async (email: string) => {
    return apiClient.post("/email/forgot-password", { email });
  },

  resetPassword: async (token: string, newPassword: string) => {
    return apiClient.post("/email/reset-password", {
      token,
      new_password: newPassword,
    });
  },

  getEmailStatus: async (): Promise<
    ApiResponse<{ email: string; is_verified: boolean }>
  > => {
    return apiClient.get("/email/email-status");
  },
};

/**
 * Users API
 */
export const usersApi = {
  getUsers: async (params?: {
    page?: number;
    per_page?: number;
    user_type?: string;
    location?: string;
    profession?: string;
  }): Promise<ApiResponse<{ users: User[] }>> => {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/users${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return apiClient.get(endpoint);
  },

  getUser: async (id: number): Promise<ApiResponse<{ user: User }>> => {
    return apiClient.get(`/users/${id}`);
  },

  updateProfile: async (userData: Partial<User>) => {
    return apiClient.put("/users/profile", userData);
  },

  updateProfileImage: async (file: File): Promise<ApiResponse<{ avatarUrl: string }>> => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.upload("/users/profile-image", formData);
  },

  getDashboardStats: async (): Promise<ApiResponse<any>> => {
    return apiClient.get("/users/dashboard-stats");
  },

  searchUsers: async (params?: {
    query?: string;
    user_type?: string;
    location?: string;
    profession?: string;
    verified?: boolean;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ users: User[]; pagination: any }>> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });
    }
    return apiClient.get(`/users/search${queryParams.toString() ? `?${queryParams.toString()}` : ""}`);
  },

  getPublicProfile: async (id: number): Promise<ApiResponse<{ user: User }>> => {
    return apiClient.get(`/users/${id}/public`);
  },
};

/**
 * Notifications API
 */
export interface Notification {
  id: number;
  user_id: number;
  type: 'MESSAGE' | 'PROJECT_LIKE' | 'PROJECT_COMMENT' | 'JOB_APPLICATION' | 'PAYMENT_SUCCESS' | 'PAYMENT_FAILED' | 'SUBSCRIPTION_EXPIRED' | 'SYSTEM_ANNOUNCEMENT' | 'PROJECT_APPROVED' | 'PROJECT_REJECTED' | 'PROFILE_VERIFIED';
  title: string;
  message: string;
  is_read: boolean;
  read_at?: string;
  action_url?: string;
  extra_data?: any;
  created_at: string;
  related_job_id?: number;
  related_project_id?: number;
}

export const notificationsApi = {
  getNotifications: async (params?: {
    unreadOnly?: boolean;
    limit?: number;
    offset?: number;
    type?: string;
  }): Promise<ApiResponse<{ notifications: Notification[]; unread_count: number }>> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });
    }
    return apiClient.get(`/notifications${queryParams.toString() ? `?${queryParams.toString()}` : ""}`);
  },

  getUnreadCount: async (): Promise<ApiResponse<{ unread_count: number }>> => {
    return apiClient.get("/notifications/unread-count");
  },

  markAsRead: async (id: number): Promise<ApiResponse<Notification>> => {
    return apiClient.post(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<ApiResponse<{ count: number }>> => {
    return apiClient.post("/notifications/mark-all-read");
  },

  deleteNotification: async (id: number): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/notifications/${id}`);
  },

  getPreferences: async (): Promise<ApiResponse<any>> => {
    return apiClient.get("/notifications/preferences");
  },

  updatePreferences: async (preferences: any): Promise<ApiResponse<any>> => {
    return apiClient.put("/notifications/preferences", preferences);
  },
};

/**
 * Admin API - Yönetici işlemleri
 */
export const adminApi = {
  // Backup yönetimi
  getBackups: async (): Promise<ApiResponse<{ backups: Array<{
    filename: string;
    size: number;
    sizeFormatted: string;
    createdAt: string;
  }> }>> => {
    return apiClient.get("/admin/backups");
  },

  createBackup: async (): Promise<ApiResponse<{
    filename: string;
    size: number;
    sizeFormatted: string;
    timestamp: string;
  }>> => {
    return apiClient.post("/admin/backups/create");
  },

  deleteBackup: async (filename: string) => {
    return apiClient.delete(`/admin/backups/${encodeURIComponent(filename)}`);
  },

  // İstatistikler
  getDashboardStats: async (): Promise<ApiResponse<any>> => {
    return apiClient.get("/admin/dashboard-stats");
  },

  // Kullanıcı yönetimi
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    user_type?: string;
  }): Promise<ApiResponse<any>> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });
    }
    return apiClient.get(`/admin/users${queryParams.toString() ? `?${queryParams.toString()}` : ""}`);
  },

  banUser: async (userId: number, reason: string) => {
    return apiClient.post(`/admin/users/${userId}/ban`, { reason });
  },

  unbanUser: async (userId: number) => {
    return apiClient.post(`/admin/users/${userId}/unban`);
  },
};

/**
 * Transaction History API
 */
export const transactionApi = {
  getHistory: async (options?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<{
    transactions: Array<any>;
    pagination: { total: number; limit: number; offset: number };
    summary: { totalTransactions: number; totalAmount: number };
  }>> => {
    const queryParams = new URLSearchParams();
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });
    }
    return apiClient.get(`/payments/history${queryParams.toString() ? `?${queryParams.toString()}` : ""}`);
  },
};

/**
 * Settings API - Kullanıcı ayarları
 */
export const settingsApi = {
  getSettings: async (): Promise<ApiResponse<any>> => {
    return apiClient.get("/settings");
  },

  updateProfile: async (data: {
    bio?: string;
    location?: string;
    phone?: string;
    website?: string;
  }) => {
    return apiClient.put("/settings/profile", data);
  },

  updateNotifications: async (data: {
    email_enabled?: boolean;
    push_enabled?: boolean;
    in_app_enabled?: boolean;
    quiet_hours_enabled?: boolean;
  }) => {
    return apiClient.put("/settings/notifications", data);
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    return apiClient.put("/settings/password", { currentPassword, newPassword });
  },

  deleteAccount: async (password: string, reason?: string) => {
    return apiClient.delete("/settings/account");
  },
};

/**
 * Invoice API - Fatura işlemleri
 */
export const invoiceApi = {
  getInvoices: async (): Promise<ApiResponse<{ invoices: any[] }>> => {
    return apiClient.get("/invoices");
  },

  getInvoice: async (id: number): Promise<ApiResponse<{ invoice: any }>> => {
    return apiClient.get(`/invoices/${id}`);
  },

  generateInvoice: async (paymentId: number): Promise<ApiResponse<{ invoice: any }>> => {
    return apiClient.post(`/invoices/generate/${paymentId}`);
  },

  downloadInvoice: async (id: number): Promise<string> => {
    const token = tokenManager.getAccessToken();
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const response = await fetch(`${baseUrl}/invoices/${id}/download`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.text();
  },
};

// Default export
export default apiClient;
