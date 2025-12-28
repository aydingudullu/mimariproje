"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { projectsApi, messagesApi, paymentsApi, usersApi } from "@/lib/api";
import type { Project, Conversation, Subscription } from "@/lib/api";
import {
  BarChart3,
  TrendingUp,
  MessageCircle,
  Eye,
  Star,
  Calendar,
  Plus,
  Settings,
  Bell,
  Download,
  Upload,
  Edit,
  Loader2,
  Terminal,
  Activity,
  Layers,
  ArrowRight,
  Cpu,
  ShieldCheck,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface DashboardData {
  projects: Project[];
  conversations: Conversation[];
  subscription: Subscription | null;
  stats: {
    profileViews: number;
    projectsSold: number;
    totalEarnings: number;
    activeProjects: number;
    messages: number;
    rating: number;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();

  const [dashboardData, setDashboardData] = useState<DashboardData>({
    projects: [],
    conversations: [],
    subscription: null,
    stats: {
      profileViews: 0,
      projectsSold: 0,
      totalEarnings: 0,
      activeProjects: 0,
      messages: 0,
      rating: 0,
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/giris");
    }
  }, [authLoading, isAuthenticated, router]);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!isAuthenticated || !user) return;

      setIsLoading(true);
      setError("");

      try {
        const [projectsResponse, conversationsResponse, subscriptionResponse, statsResponse] =
          await Promise.all([
            projectsApi.getMyProjects(),
            messagesApi.getConversations(),
            paymentsApi.getMySubscription(),
            usersApi.getDashboardStats(),
          ]);

        if (projectsResponse.success) {
          setDashboardData((prev) => ({
            ...prev,
            projects: projectsResponse.data?.projects || [],
            stats: {
              ...prev.stats,
              activeProjects: projectsResponse.data?.projects?.length || 0,
              projectsSold:
                projectsResponse.data?.projects?.filter((p) => p.is_featured)?.length || 0,
            },
          }));
        }

        if (conversationsResponse.success) {
          setDashboardData((prev) => ({
            ...prev,
            conversations: conversationsResponse.data?.conversations || [],
            stats: {
              ...prev.stats,
              messages:
                conversationsResponse.data?.conversations?.reduce(
                  (acc, conv) => acc + conv.unread_count,
                  0
                ) || 0,
            },
          }));
        }

        if (subscriptionResponse.success) {
          setDashboardData((prev) => ({
            ...prev,
            subscription: subscriptionResponse.data?.subscription || null,
          }));
        }

        if (statsResponse.success) {
          setDashboardData((prev) => ({
            ...prev,
            stats: {
              ...prev.stats,
              profileViews: statsResponse.data?.profileViews || 0,
              totalEarnings: statsResponse.data?.totalEarnings || 0,
              rating: statsResponse.data?.rating || 0,
              projectsSold: statsResponse.data?.projectsSold || 0,
            },
          }));
        }
      } catch (error) {
        console.error("Dashboard data load error:", error);
        setError("SYSTEM FAILURE: Data Retrieval Interrupted");
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [isAuthenticated, user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) return `${diffInMinutes}m AGO`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h AGO`;
    return `${Math.floor(diffInMinutes / 1440)}d AGO`;
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-[#050505] text-zinc-900 dark:text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-500" />
          <span className="font-mono text-xs tracking-[0.2em] animate-pulse">SYSTEM INITIALIZING...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#050505] text-zinc-900 dark:text-white font-sans selection:bg-blue-500/30 transition-colors duration-300">
        
       {/* Background Grid */}
        <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none mix-blend-multiply dark:mix-blend-screen">
            <svg className="w-full h-full" width="100%" height="100%">
            <defs>
                <pattern id="grid-pattern-dash" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern-dash)" />
            </svg>
        </div>

      <div className="relative z-10 max-w-[1920px] mx-auto p-6 pt-32 sm:p-12 sm:pt-36 lg:p-16 lg:pt-40">
        
        {/* HERO HEADER SECTION */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-zinc-200 dark:border-white/10 pb-12">
          <div className="relative">
            {/* Decor line */}
            <div className="absolute -left-6 top-0 bottom-0 w-1 bg-blue-600/20 dark:bg-blue-500/20 hidden lg:block" />
            
            <div className="flex items-center gap-2 text-xs font-mono text-blue-600 dark:text-blue-500 mb-4 tracking-[0.2em] uppercase font-bold">
              <span className="w-2 h-2 bg-blue-600 dark:bg-blue-500 rounded-full animate-pulse" />
              System Status: Online
            </div>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] mb-4 text-zinc-900 dark:text-white">
              Mission<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-zinc-400 dark:from-zinc-500 dark:to-white">Control.</span>
            </h1>
            <p className="text-zinc-500 dark:text-zinc-500 font-mono text-sm uppercase tracking-widest max-w-md leading-relaxed">
              Welcome back, Agent {user.first_name || 'Architect'}. <br/>
              Your command center is ready for deployment.
            </p>
          </div>

          <div className="flex flex-col items-end gap-6">
             <div className="text-right hidden md:block bg-white dark:bg-white/5 p-4 rounded-xl border border-zinc-200 dark:border-white/5 backdrop-blur-sm">
                <div className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Current Session</div>
                <div className="text-2xl font-black font-mono tracking-tight text-zinc-900 dark:text-white">
                    {new Date().toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
                    <span className="dots animate-pulse">.</span>
                </div>
             </div>
             
             <div className="flex items-center gap-4">
                <Button variant="outline" className="h-14 w-14 rounded-full border-zinc-200 dark:border-white/10 bg-white dark:bg-transparent hover:bg-zinc-100 dark:hover:bg-white/5 hover:border-zinc-300 dark:hover:border-white/30 transition-all shadow-sm" asChild>
                    <Link href="/bildirimler">
                        <Bell className="w-6 h-6 text-zinc-600 dark:text-zinc-400" />
                    </Link>
                </Button>
                <Link href="/profil/me" className="group">
                    <div className="relative">
                        <Avatar className="h-16 w-16 border-2 border-zinc-200 dark:border-white/10 group-hover:border-blue-600 dark:group-hover:border-blue-500 transition-colors cursor-pointer shadow-lg">
                            <AvatarImage src={user.profile_image_url || user.avatar_url} />
                            <AvatarFallback className="bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white font-bold text-xl">{user.first_name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white dark:border-black rounded-full" />
                    </div>
                </Link>
             </div>
          </div>
        </header>

        {/* HUD STATS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
           
           {/* Metric Card 1 */}
           <div className="group relative bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-white/5 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all p-8 rounded-sm shadow-sm hover:shadow-md">
               <div className="absolute top-0 right-0 p-6 opacity-5 dark:opacity-10 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity">
                   <Eye className="w-20 h-20" />
               </div>
               <div className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-3">Profile Visits</div>
               <div className="text-5xl font-black font-mono tracking-tighter mb-4 text-zinc-900 dark:text-white">
                   {dashboardData.stats.profileViews.toLocaleString("tr-TR")}
               </div>
               <div className="flex items-center gap-2 text-xs font-bold uppercase text-green-600 dark:text-green-500 bg-green-100 dark:bg-green-500/10 py-1 px-2 w-fit rounded-full">
                   <TrendingUp className="w-3 h-3" />
                   <span>+12% Trend</span>
               </div>
           </div>

           {/* Metric Card 2 */}
           <div className="group relative bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-white/5 hover:border-green-500/50 dark:hover:border-green-500/50 transition-all p-8 rounded-sm shadow-sm hover:shadow-md">
               <div className="absolute top-0 right-0 p-6 opacity-5 dark:opacity-10 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity">
                   <Layers className="w-20 h-20" />
               </div>
               <div className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-3">Active Blueprints</div>
               <div className="text-5xl font-black font-mono tracking-tighter mb-4 text-zinc-900 dark:text-white">
                   {dashboardData.stats.activeProjects}
               </div>
               <div className="w-full bg-zinc-100 dark:bg-white/5 h-1.5 rounded-full overflow-hidden mt-auto">
                   <div className="bg-green-500 h-full w-[70%]" />
               </div>
           </div>

           {/* Metric Card 3 */}
           <div className="group relative bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-white/5 hover:border-purple-500/50 dark:hover:border-purple-500/50 transition-all p-8 rounded-sm shadow-sm hover:shadow-md">
               <div className="absolute top-0 right-0 p-6 opacity-5 dark:opacity-10 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity">
                   <Zap className="w-20 h-20" />
               </div>
               <div className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-3">Total Yield</div>
               <div className="text-5xl font-black font-mono tracking-tighter mb-4 text-zinc-900 dark:text-white">
                   ₺{dashboardData.stats.totalEarnings.toLocaleString("tr-TR", { notation: "compact" })}
               </div>
               <div className="flex items-center gap-2 text-xs font-bold uppercase text-purple-600 dark:text-purple-500 bg-purple-100 dark:bg-purple-500/10 py-1 px-2 w-fit rounded-full">
                   <Activity className="w-3 h-3" />
                   <span>Optimal</span>
               </div>
           </div>

           {/* Metric Card 4 */}
           <div className="group relative bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-white/5 hover:border-yellow-500/50 dark:hover:border-yellow-500/50 transition-all p-8 rounded-sm shadow-sm hover:shadow-md">
               <div className="absolute top-0 right-0 p-6 opacity-5 dark:opacity-10 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity">
                   <Star className="w-20 h-20" />
               </div>
               <div className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-3">Reputation</div>
               <div className="text-5xl font-black font-mono tracking-tighter mb-4 flex items-baseline gap-2 text-zinc-900 dark:text-white">
                   {dashboardData.stats.rating} <span className="text-lg text-zinc-400 font-bold">/ 5.0</span>
               </div>
               <div className="flex gap-1.5">
                   {[1,2,3,4,5].map(i => (
                       <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= Math.round(dashboardData.stats.rating) ? 'bg-yellow-500' : 'bg-zinc-100 dark:bg-white/10'}`} />
                   ))}
               </div>
           </div>

        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN - PROJECTS */}
            <div className="lg:col-span-2 space-y-8">
                
                {/* Projects List */}
                <div className="bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-white/5 shadow-sm rounded-sm overflow-hidden">
                    <div className="flex items-center justify-between p-6 md:p-8 border-b border-zinc-100 dark:border-white/5">
                        <div className="flex items-center gap-3">
                            <Layers className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                            <h2 className="font-black uppercase tracking-wider text-sm text-zinc-900 dark:text-white">Active Protocols</h2>
                        </div>
                        <Link href="/projeler/yeni" className="text-[10px] font-bold font-mono text-blue-600 dark:text-blue-500 hover:text-black dark:hover:text-white uppercase flex items-center gap-2 transition-colors">
                            <Plus className="w-3 h-3" /> Initiate New
                        </Link>
                    </div>

                    <div className="divide-y divide-zinc-100 dark:divide-white/5">
                        {dashboardData.projects.length === 0 ? (
                            <div className="p-16 text-center">
                                <Cpu className="w-16 h-16 text-zinc-200 dark:text-white/10 mx-auto mb-6" />
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">System Idle</h3>
                                <p className="font-mono text-xs text-zinc-500 uppercase mb-6">No active protocols found in the database.</p>
                                <Button asChild className="bg-blue-600 text-white hover:bg-black dark:hover:bg-white dark:hover:text-black rounded-none uppercase font-bold tracking-widest text-xs h-12 px-8">
                                    <Link href="/projeler/yeni">Deploy First Protocol</Link>
                                </Button>
                            </div>
                        ) : (
                            dashboardData.projects.slice(0, 5).map((project) => (
                                <div key={project.id} className="p-6 hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                                    <div className="flex items-center gap-6">
                                        <div className="hidden md:flex w-14 h-14 bg-zinc-100 dark:bg-white/5 items-center justify-center font-black text-sm text-zinc-400 dark:text-zinc-600 border border-zinc-200 dark:border-white/5 rounded-sm">
                                            {project.id.toString().padStart(2, '0')}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg uppercase tracking-tight text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-500 transition-colors">
                                                {project.title}
                                            </h3>
                                            <div className="flex items-center gap-4 mt-1.5">
                                                <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold bg-zinc-100 dark:bg-white/5 px-2 py-0.5 rounded">
                                                    {project.category}
                                                </span>
                                                <span className="text-[10px] font-mono text-zinc-400 uppercase">
                                                    {formatDate(project.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-6 pl-20 md:pl-0">
                                        <div className={`px-3 py-1.5 text-[10px] font-bold font-mono uppercase border rounded-sm ${project.is_featured ? 'border-yellow-500/30 text-yellow-600 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-500/5' : 'border-green-500/30 text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-500/5'}`}>
                                            {project.is_featured ? 'Featured' : 'Active'}
                                        </div>
                                        <Link href={`/proje/${project.id}`}>
                                            <Button variant="ghost" size="icon" className="h-10 w-10 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/10 rounded-full">
                                                <ArrowRight className="w-5 h-5" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                
                {/* Quick Actions Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { icon: Upload, label: "Deploy Project", href: "/projeler/yeni" },
                        { icon: Edit, label: "Edit Profile", href: "/profil/me" },
                        { icon: BarChart3, label: "All Projects", href: "/projeler" }, // Changed from Analytics to Projects
                        { icon: Settings, label: "Settings", href: "/ayarlar" }, // Changed from Export to Settings
                    ].map((action, i) => (
                        <Link key={i} href={action.href} className="group bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-white/5 p-8 hover:border-zinc-400 dark:hover:border-white/20 transition-all flex flex-col items-center justify-center gap-4 text-center rounded-sm shadow-sm hover:shadow-md">
                            <action.icon className="w-8 h-8 text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors">{action.label}</span>
                        </Link>
                    ))}
                </div>

            </div>

            {/* RIGHT COLUMN - SIDEBAR */}
            <div className="space-y-8">
                
                {/* Comms Panel */}
                <div className="bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-white/5 relative overflow-hidden rounded-sm shadow-sm">
                    <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-white/[0.02]">
                        <div className="flex items-center gap-2">
                             <Terminal className="w-4 h-4 text-green-600 dark:text-green-500" />
                             <span className="text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-white">Comms Channel</span>
                        </div>
                        <Badge variant="outline" className="border-zinc-300 dark:border-white/10 text-[10px] font-mono">{dashboardData.stats.messages}</Badge>
                    </div>
                    
                    <div className="p-2 space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar">
                         {dashboardData.conversations.length === 0 ? (
                            <div className="p-8 text-center text-[10px] font-mono text-zinc-500 uppercase">
                                No secure channels open.
                            </div>
                         ) : (
                            dashboardData.conversations.slice(0, 4).map((bg) => (
                                <Link key={bg.id} href="/mesajlar" className="block p-4 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-white/5 group rounded-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-bold uppercase text-zinc-700 dark:text-zinc-300 group-hover:text-black dark:group-hover:text-white">
                                            {bg.other_user?.first_name} {bg.other_user?.last_name}
                                        </span>
                                        <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-600">{bg.last_message_at ? getTimeAgo(bg.last_message_at) : ''}</span>
                                    </div>
                                    <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-500 truncate group-hover:text-zinc-700 dark:group-hover:text-zinc-400">
                                        {bg.last_message?.content}
                                    </p>
                                </Link>
                            ))
                         )}
                    </div>
                    
                    <div className="p-4 border-t border-zinc-100 dark:border-white/5">
                        <Button variant="ghost" className="w-full text-[10px] font-mono h-10 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-black dark:hover:text-white text-zinc-500 dark:text-zinc-500 uppercase border border-dashed border-zinc-200 dark:border-white/10 tracking-widest" asChild>
                            <Link href="/mesajlar">Access All Channels</Link>
                        </Button>
                    </div>
                </div>
                
                {/* System Status / Plan */}
                <div className="bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-white/5 p-8 relative overflow-hidden rounded-sm shadow-sm">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                     
                     <h3 className="text-xs font-black uppercase tracking-widest mb-8 flex items-center gap-2 text-zinc-900 dark:text-white">
                        <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                        Clearance Level
                     </h3>

                     <div className="flex items-center justify-between mb-6">
                        <span className="font-mono text-sm text-zinc-500 dark:text-zinc-400">Current Plan</span>
                        <span className="font-black text-xl uppercase text-zinc-900 dark:text-white">{dashboardData.subscription?.plan_type || 'STANDARD'}</span>
                     </div>

                     <div className="space-y-4 mb-8">
                        <div className="flex justify-between text-[10px] font-mono uppercase text-zinc-500">
                            <span>Storage</span>
                            <span>45% Used</span>
                        </div>
                        <div className="w-full bg-zinc-100 dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-blue-600 dark:bg-blue-500 h-full w-[45%]" />
                        </div>
                     </div>

                     <Button className="w-full bg-zinc-900 text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-bold uppercase text-xs tracking-widest rounded-none h-12">
                        Upgrade Clearance
                     </Button>
                </div>

            </div>

        </div>

      </div>
    </div>
  );
}
