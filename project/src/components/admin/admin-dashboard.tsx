"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Briefcase, 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Settings,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Activity,
  Server,
  Database,
} from "lucide-react";
import BackupManager from "@/components/admin/backup-manager";

interface OverviewStats {
  totalUsers: number;
  totalProjects: number;
  totalJobs: number;
  totalRevenue: number;
  activeSubscriptions: number;
  pendingModeration: number;
}

interface UserAnalytics {
  summary: {
    totalUsers: number;
    newUsers: number;
    verifiedUsers: number;
    activeUsers: number;
    bannedUsers: number;
    growthRate: string;
  };
  breakdown: {
    byType: Array<{ type: string; count: number }>;
    bySubscription: Array<{ type: string; count: number }>;
  };
}

interface ProjectAnalytics {
  summary: {
    totalProjects: number;
    newProjects: number;
    featuredProjects: number;
    totalViews: number;
    totalLikes: number;
    totalDownloads: number;
  };
  pricing: {
    average: number;
    min: number;
    max: number;
  };
  breakdown: {
    byStatus: Array<{ status: string; count: number }>;
    byCategory: Array<{ category: string; count: number }>;
  };
}

interface RevenueAnalytics {
  summary: {
    totalRevenue: number;
    totalTransactions: number;
    periodRevenue: number;
    periodTransactions: number;
    pendingAmount: number;
    refundedAmount: number;
  };
  subscriptions: {
    activeCount: number;
    mrr: number;
    arr: number;
  };
}

interface HealthData {
  status: string;
  uptime: { seconds: number; formatted: string };
  database: { status: string; latency: string };
  memory: { heapUsed: string; heapTotal: string; rss: string };
  cpu: { load1min: string; load5min: string };
  system: { platform: string; nodeVersion: string; freeMemory: string };
}

interface RecentUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  user_type: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  avatar_url?: string;
}

interface PendingProject {
  id: number;
  title: string;
  category: string;
  status: string;
  created_at: string;
  users?: { first_name: string; last_name: string; email: string };
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null);
  const [projectAnalytics, setProjectAnalytics] = useState<ProjectAnalytics | null>(null);
  const [revenueAnalytics, setRevenueAnalytics] = useState<RevenueAnalytics | null>(null);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [pendingProjects, setPendingProjects] = useState<PendingProject[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch all data in parallel
      const [overviewRes, usersRes, projectsRes, revenueRes, healthRes, pendingRes] = await Promise.all([
        fetch(`${API_BASE}/admin/analytics/overview`, { headers }).then(r => r.json()),
        fetch(`${API_BASE}/admin/analytics/users`, { headers }).then(r => r.json()),
        fetch(`${API_BASE}/admin/analytics/projects`, { headers }).then(r => r.json()),
        fetch(`${API_BASE}/admin/analytics/revenue`, { headers }).then(r => r.json()),
        fetch(`${API_BASE}/admin/monitoring/health`, { headers }).then(r => r.json()),
        fetch(`${API_BASE}/admin/moderation/projects?status=pending&limit=5`, { headers }).then(r => r.json()),
      ]);

      if (overviewRes.success) setOverview(overviewRes.data);
      if (usersRes.success) {
        setUserAnalytics(usersRes.data);
        // Use user breakdown to show recent users
        setRecentUsers(usersRes.data?.recentUsers || []);
      }
      if (projectsRes.success) setProjectAnalytics(projectsRes.data);
      if (revenueRes.success) setRevenueAnalytics(revenueRes.data);
      if (healthRes.success) setHealth(healthRes.data);
      if (pendingRes.success) setPendingProjects(pendingRes.data?.projects || []);
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  const handleApproveProject = async (projectId: number) => {
    try {
      const token = localStorage.getItem("access_token");
      await fetch(`${API_BASE}/admin/moderation/projects/${projectId}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingProjects(prev => prev.filter(p => p.id !== projectId));
    } catch (error) {
      console.error("Failed to approve project:", error);
    }
  };

  const handleRejectProject = async (projectId: number) => {
    try {
      const token = localStorage.getItem("access_token");
      await fetch(`${API_BASE}/admin/moderation/projects/${projectId}/reject`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingProjects(prev => prev.filter(p => p.id !== projectId));
    } catch (error) {
      console.error("Failed to reject project:", error);
    }
  };

  const downloadReport = async (type: string) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_BASE}/admin/reports/${type}?format=csv`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_report.csv`;
      a.click();
    } catch (error) {
      console.error("Failed to download report:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-300">Veriler yükleniyor...</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Toplam Kullanıcı",
      value: userAnalytics?.summary.totalUsers || overview?.totalUsers || 0,
      change: userAnalytics?.summary.growthRate || "0",
      changeType: "increase",
      icon: Users,
      color: "bg-blue-500"
    },
    {
      title: "Aktif Projeler",
      value: overview?.totalProjects || 0,
      change: `+${projectAnalytics?.summary.newProjects || 0}`,
      changeType: "increase",
      icon: Briefcase,
      color: "bg-green-500"
    },
    {
      title: "Aylık Gelir",
      value: formatCurrency(revenueAnalytics?.summary.periodRevenue || 0),
      change: `${revenueAnalytics?.subscriptions.activeCount || 0} aktif abonelik`,
      changeType: "increase",
      icon: DollarSign,
      color: "bg-purple-500"
    },
    {
      title: "Bekleyen Onaylar",
      value: overview?.pendingModeration || 0,
      change: pendingProjects.length > 0 ? "Gözden geçir" : "Temiz",
      changeType: pendingProjects.length > 0 ? "warning" : "decrease",
      icon: Clock,
      color: "bg-orange-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Admin Panel
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Platform yönetimi ve istatistikler
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={() => fetchData()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Yenile
            </Button>
            <Button variant="outline" onClick={() => downloadReport('users')}>
              <Download className="h-4 w-4 mr-2" />
              Rapor
            </Button>
            <Button>
              <Settings className="h-4 w-4 mr-2" />
              Ayarlar
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {typeof stat.value === 'number' ? stat.value.toLocaleString('tr-TR') : stat.value}
                      </p>
                    </div>
                    <div className={`${stat.color} rounded-lg p-3`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="flex items-center mt-2">
                    {stat.changeType === 'increase' ? (
                      <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                    ) : stat.changeType === 'warning' ? (
                      <AlertTriangle className="h-3 w-3 mr-1 text-orange-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1 text-blue-500" />
                    )}
                    <span className={`text-sm ${
                      stat.changeType === 'increase' ? 'text-green-500' : 
                      stat.changeType === 'warning' ? 'text-orange-500' : 'text-blue-500'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
            <TabsTrigger value="moderation">Moderasyon</TabsTrigger>
            <TabsTrigger value="analytics">Analitik</TabsTrigger>
            <TabsTrigger value="system">Sistem</TabsTrigger>
            <TabsTrigger value="backups">Yedekler</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Kullanıcı İstatistikleri
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-600 dark:text-blue-400">Toplam</p>
                      <p className="text-2xl font-bold">{userAnalytics?.summary.totalUsers?.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm text-green-600 dark:text-green-400">Aktif</p>
                      <p className="text-2xl font-bold">{userAnalytics?.summary.activeUsers?.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <p className="text-sm text-purple-600 dark:text-purple-400">Onaylı</p>
                      <p className="text-2xl font-bold">{userAnalytics?.summary.verifiedUsers?.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <p className="text-sm text-orange-600 dark:text-orange-400">Yeni (30 gün)</p>
                      <p className="text-2xl font-bold">{userAnalytics?.summary.newUsers?.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Revenue Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Gelir İstatistikleri
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm text-green-600 dark:text-green-400">Toplam Gelir</p>
                      <p className="text-xl font-bold">{formatCurrency(revenueAnalytics?.summary.totalRevenue || 0)}</p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-600 dark:text-blue-400">MRR</p>
                      <p className="text-xl font-bold">{formatCurrency(revenueAnalytics?.subscriptions.mrr || 0)}</p>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <p className="text-sm text-purple-600 dark:text-purple-400">İşlem Sayısı</p>
                      <p className="text-2xl font-bold">{revenueAnalytics?.summary.totalTransactions || 0}</p>
                    </div>
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">Bekleyen</p>
                      <p className="text-xl font-bold">{formatCurrency(revenueAnalytics?.summary.pendingAmount || 0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Project Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Popüler Kategoriler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {projectAnalytics?.breakdown.byCategory?.slice(0, 10).map((cat, i) => (
                    <Badge key={i} variant="outline" className="text-sm py-1 px-3">
                      {cat.category} ({cat.count})
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Moderation Tab */}
          <TabsContent value="moderation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Onay Bekleyen Projeler</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingProjects.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-300">Tüm projeler gözden geçirildi!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingProjects.map((project) => (
                      <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{project.title}</h4>
                          <p className="text-sm text-slate-500">
                            {project.users?.first_name} {project.users?.last_name} • {project.category}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleRejectProject(project.id)}>
                            <XCircle className="h-4 w-4 mr-1" />
                            Reddet
                          </Button>
                          <Button size="sm" onClick={() => handleApproveProject(project.id)}>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Onayla
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Proje İstatistikleri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Toplam Görüntüleme</span>
                    <span className="font-bold">{projectAnalytics?.summary.totalViews?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Toplam Beğeni</span>
                    <span className="font-bold">{projectAnalytics?.summary.totalLikes?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Toplam İndirme</span>
                    <span className="font-bold">{projectAnalytics?.summary.totalDownloads?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Öne Çıkan</span>
                    <span className="font-bold">{projectAnalytics?.summary.featuredProjects}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Fiyat Aralığı</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Ortalama</span>
                    <span className="font-bold">{formatCurrency(projectAnalytics?.pricing.average || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Minimum</span>
                    <span className="font-bold">{formatCurrency(projectAnalytics?.pricing.min || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Maksimum</span>
                    <span className="font-bold">{formatCurrency(projectAnalytics?.pricing.max || 0)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rapor İndir</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full" onClick={() => downloadReport('users')}>
                    <Download className="h-4 w-4 mr-2" /> Kullanıcı Raporu
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => downloadReport('projects')}>
                    <Download className="h-4 w-4 mr-2" /> Proje Raporu
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => downloadReport('payments')}>
                    <Download className="h-4 w-4 mr-2" /> Ödeme Raporu
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Server className="h-5 w-5 mr-2" />
                    Sistem Durumu
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Durum</span>
                    <Badge className={health?.status === 'healthy' ? 'bg-green-500' : 'bg-yellow-500'}>
                      {health?.status === 'healthy' ? 'Sağlıklı' : 'Dikkat'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Uptime</span>
                    <span className="font-mono">{health?.uptime.formatted}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Platform</span>
                    <span>{health?.system.platform} ({health?.system.nodeVersion})</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="h-5 w-5 mr-2" />
                    Veritabanı
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Durum</span>
                    <Badge className={health?.database.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}>
                      {health?.database.status === 'healthy' ? 'Bağlı' : 'Hata'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Gecikme</span>
                    <span className="font-mono">{health?.database.latency}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Bellek Kullanımı
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Heap Kullanılan</span>
                    <span className="font-mono">{health?.memory.heapUsed}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Heap Toplam</span>
                    <span className="font-mono">{health?.memory.heapTotal}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>RSS</span>
                    <span className="font-mono">{health?.memory.rss}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>CPU Yükü</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>1 dakika</span>
                    <span className="font-mono">{health?.cpu.load1min}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>5 dakika</span>
                    <span className="font-mono">{health?.cpu.load5min}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Backups Tab */}
          <TabsContent value="backups">
            <BackupManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
