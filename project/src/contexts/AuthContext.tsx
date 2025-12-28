/**
 * Mimariproje.com - Authentication Context
 * Kullanıcı authentication durumunu yönetir
 */

"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { authApi, tokenManager, User, ApiResponse } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<ApiResponse>;
  register: (userData: RegisterData) => Promise<ApiResponse>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

interface RegisterData {
  email: string;
  password: string;
  user_type: "individual" | "company";
  first_name?: string;
  last_name?: string;
  company_name?: string;
  profession?: string;
  phone?: string;
  location?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Kullanıcı bilgilerini yükle
  const loadUser = async () => {
    try {
      if (!tokenManager.isAuthenticated()) {
        setIsLoading(false);
        return;
      }

      const response = await authApi.getCurrentUser();

      if (response.success && response.data) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      } else {
        // Token geçersiz, temizle
        tokenManager.clearTokens();
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Load user error:", error);
      tokenManager.clearTokens();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Component mount edildiğinde kullanıcıyı yükle
  useEffect(() => {
    loadUser();
  }, []);

  // Token değişikliklerini dinle
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "mimariproje_access_token") {
        if (e.newValue) {
          // Yeni token var, kullanıcıyı yükle
          loadUser();
        } else {
          // Token kaldırılmış, kullanıcıyı temizle
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Giriş yapma
  const login = async (
    email: string,
    password: string
  ): Promise<ApiResponse> => {
    setIsLoading(true);

    try {
      const response = await authApi.login(email, password);

      if (response.success && response.data) {
        console.log("AuthContext: Login successful, setting user and tokens", response.data);
        setUser((response.data as any).user);
        setIsAuthenticated(true);
        console.log("AuthContext: State updated - isAuthenticated: true");

        return {
          success: true,
          message: "Giriş başarılı",
          data: response.data,
        };
      } else {
        return {
          success: false,
          error: response.error || "Giriş başarısız",
        };
      }
    } catch (error) {
      return {
        success: false,
        error: "Bağlantı hatası",
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Kayıt olma
  const register = async (userData: RegisterData): Promise<ApiResponse> => {
    setIsLoading(true);

    try {
      const response = await authApi.register(userData);

      if (response.success && response.data) {
        setUser((response.data as any).user);
        setIsAuthenticated(true);

        return {
          success: true,
          message: response.message || "Kayıt başarılı",
          data: response.data,
        };
      } else {
        return {
          success: false,
          error: response.error || "Kayıt başarısız",
        };
      }
    } catch (error) {
      return {
        success: false,
        error: "Bağlantı hatası",
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Çıkış yapma
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      tokenManager.clearTokens();
      setUser(null);
      setIsAuthenticated(false);

      // Ana sayfaya yönlendir
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
  };

  // Kullanıcı bilgilerini yenile
  const refreshUser = async () => {
    if (!isAuthenticated) return;

    try {
      const response = await authApi.getCurrentUser();

      if (response.success && response.data) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error("Refresh user error:", error);
    }
  };

  // Kullanıcı bilgilerini güncelle (local state)
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
