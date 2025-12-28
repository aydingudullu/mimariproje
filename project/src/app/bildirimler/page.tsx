"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Bell, 
    MessageCircle, 
    Star, 
    Briefcase, 
    Settings, 
    Check, 
    X,
    Filter,
    Activity,
    Terminal,
    AlertCircle,
    CheckCircle2,
    Clock,
    Shield,
    Loader2,
    Trash2
} from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from 'next/link';
import { notificationsApi, Notification } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function NotificationsPage() {
  const { user, isAuthenticated } = useAuth();
  const [filter, setFilter] = useState<'all' | 'unread' | 'system'>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const [preferences, setPreferences] = useState<any>(null);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await notificationsApi.getNotifications({ limit: 50 });
      if (res.success && res.data) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unread_count);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      toast.error("Bildirimler yüklenemedi");
    } finally {
        setIsLoading(false);
    }
  };

  const fetchPreferences = async () => {
      try {
          const res = await notificationsApi.getPreferences();
          if (res.success && res.data) {
              setPreferences(res.data);
          }
      } catch (error) {
          console.error("Failed to fetch preferences", error);
      }
  };

  const handleUpdatePreference = async (key: string, value: boolean) => {
      try {
          // Optimistic update
          setPreferences((prev: any) => ({ ...prev, [key]: value }));
          
          await notificationsApi.updatePreferences({ [key]: value });
          toast.success("Ayarlar güncellendi");
      } catch (error) {
          toast.error("Ayarlar güncellenemedi");
          fetchPreferences(); // Revert
      }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      fetchPreferences();
    }
  }, [isAuthenticated]);

  const handleMarkAllRead = async () => {
    try {
        const res = await notificationsApi.markAllAsRead();
        if (res.success) {
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
            toast.success("Tüm bildirimler okundu olarak işaretlendi");
        }
    } catch (error) {
        toast.error("İşlem başarısız");
    }
  };

  const handleMarkAsRead = async (id: number) => {
      try {
          const res = await notificationsApi.markAsRead(id);
          if (res.success) {
              setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
              setUnreadCount(prev => Math.max(0, prev - 1));
          }
      } catch (error) {
          console.error("Failed to mark as read", error);
      }
  };

  const handleDelete = async (id: number) => {
      try {
          // Optimistic update
          const original = [...notifications];
          setNotifications(prev => prev.filter(n => n.id !== id));
          
          const res = await notificationsApi.deleteNotification(id);
          if (!res.success) {
              setNotifications(original); // Revert on failure
              toast.error("Silinemedi");
          }
      } catch (error) {
          toast.error("Bir hata oluştu");
      }
  };

  const getIconForType = (type: string) => {
      switch (type) {
          case 'MESSAGE': return MessageCircle;
          case 'PROJECT_LIKE': return Star;
          case 'PROJECT_APPROVED': return CheckCircle2;
          case 'PROJECT_REJECTED': return X;
          case 'JOB_APPLICATION': return Briefcase;
          case 'PAYMENT_SUCCESS': return Shield;
          case 'SYSTEM_ANNOUNCEMENT': return Terminal;
          default: return Bell;
      }
  };

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const headers = Math.floor((now.getTime() - date.getTime()) / 1000 / 60 / 60);
    if (headers < 1) return `${Math.floor((now.getTime() - date.getTime()) / 1000 / 60)} MIN AGO`;
    if (headers < 24) return `${headers} HOURS AGO`;
    return `${Math.floor(headers / 24)} DAYS AGO`;
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'system') return n.type === 'SYSTEM_ANNOUNCEMENT';
    return true;
  });

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#050505] text-zinc-900 dark:text-white font-sans transition-colors duration-300">
        
       {/* Background Grid */}
        <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none mix-blend-multiply dark:mix-blend-screen">
            <svg className="w-full h-full" width="100%" height="100%">
            <defs>
                <pattern id="grid-pattern-notif" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern-notif)" />
            </svg>
        </div>

      <div className="relative z-10 max-w-[1600px] mx-auto p-4 pt-32 sm:p-8 sm:pt-36 lg:p-12 lg:pt-40">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 border-b border-zinc-200 dark:border-white/10 pb-8">
            <div>
                <div className="flex items-center gap-2 text-xs font-mono text-blue-600 dark:text-blue-500 mb-2 tracking-[0.2em] uppercase font-bold">
                    <Activity className="w-4 h-4 animate-pulse" />
                    System Log
                </div>
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white mb-2">
                    Notification<br/><span className="text-zinc-400 dark:text-zinc-600">Stream.</span>
                </h1>
                <p className="text-zinc-500 dark:text-gray-500 font-mono text-xs uppercase tracking-widest">
                    Monitoring {notifications.length} active events. {unreadCount} require attention.
                </p>
            </div>
            
            <div className="flex items-center gap-3">
                 <Button 
                    variant="outline" 
                    onClick={handleMarkAllRead}
                    disabled={unreadCount === 0 || isLoading}
                    className="h-10 border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 text-[10px] font-mono uppercase tracking-wider"
                 >
                    <CheckCircle2 className="w-3 h-3 mr-2 text-green-500" />
                    Ack All
                 </Button>
            </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* LEFT COLUMN - CONTROLS */}
            <div className="space-y-8">
                {/* Filter Panel */}
                <div className="bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-white/5 p-6 shadow-sm rounded-sm">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2 text-zinc-900 dark:text-white">
                        <Filter className="w-4 h-4" />
                        Signal Filter
                    </h3>
                    
                    <div className="space-y-2">
                        {[
                            { id: 'all', label: 'All Signals', count: notifications.length },
                            { id: 'unread', label: 'Unread Only', count: unreadCount },
                            { id: 'system', label: 'System Logs', count: notifications.filter(n => n.type === 'SYSTEM_ANNOUNCEMENT').length }
                        ].map((f) => (
                            <button
                                key={f.id}
                                onClick={() => setFilter(f.id as any)}
                                className={`w-full flex items-center justify-between p-3 text-xs font-mono uppercase transition-all border ${
                                    filter === f.id 
                                    ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-black dark:border-white' 
                                    : 'bg-transparent text-zinc-500 dark:text-gray-500 border-transparent hover:bg-zinc-100 dark:hover:bg-white/5'
                                }`}
                            >
                                <span>{f.label}</span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                    filter === f.id ? 'bg-zinc-700 text-white dark:bg-black/20 dark:text-black' : 'bg-zinc-100 dark:bg-white/10'
                                }`}>{f.count}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Settings Panel */}
                <div className="bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-white/5 p-6 shadow-sm rounded-sm opacity-60 hover:opacity-100 transition-opacity">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2 text-zinc-900 dark:text-white">
                        <Settings className="w-4 h-4" />
                        Config
                    </h3>
                    
                    {preferences ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono text-zinc-500 dark:text-gray-400 uppercase">Email Alerts</span>
                                <Switch 
                                    checked={preferences.email_enabled}
                                    onCheckedChange={(checked) => handleUpdatePreference('email_enabled', checked)}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono text-zinc-500 dark:text-gray-400 uppercase">Push Notifs</span>
                                <Switch 
                                    checked={preferences.push_enabled}
                                    onCheckedChange={(checked) => handleUpdatePreference('push_enabled', checked)}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono text-zinc-500 dark:text-gray-400 uppercase">Internal Log</span>
                                <Switch 
                                    checked={preferences.in_app_enabled}
                                    onCheckedChange={(checked) => handleUpdatePreference('in_app_enabled', checked)}
                                />
                            </div>
                        </div>
                    ) : (
                         <div className="py-4 text-center">
                             <Loader2 className="w-5 h-5 animate-spin mx-auto text-zinc-400" />
                         </div>
                    )}
                </div>
            </div>

            {/* RIGHT COLUMN - STREAM */}
            <div className="lg:col-span-3">
                 <div className="bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-white/5 min-h-[600px] shadow-sm rounded-sm relative">
                    
                    {/* Stream Header */}
                    <div className="bg-zinc-50 dark:bg-white/[0.02] border-b border-zinc-200 dark:border-white/5 p-4 flex items-center justify-between">
                         <div className="text-[10px] font-mono text-zinc-400 dark:text-gray-600 uppercase tracking-widest pl-2">
                             EVENT_ID // TIMESTAMP // SOURCE // PAYLOAD
                         </div>
                         <div className="flex gap-2">
                             <div className="w-2 h-2 rounded-full bg-red-500" />
                             <div className="w-2 h-2 rounded-full bg-yellow-500" />
                             <div className="w-2 h-2 rounded-full bg-green-500" />
                         </div>
                    </div>

                    {/* Stream Content */}
                    <ScrollArea className="h-[600px] w-full">
                        <div className="divide-y divide-zinc-100 dark:divide-white/5">
                            {isLoading ? (
                                <div className="h-full flex flex-col items-center justify-center p-20 gap-4">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-500" />
                                    <span className="font-mono text-xs animate-pulse">ESTABLISHING DATALINK...</span>
                                </div>
                            ) : filteredNotifications.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center p-20 text-zinc-300 dark:text-gray-700">
                                    <Shield className="w-16 h-16 mb-4 opacity-50" />
                                    <p className="font-mono text-sm uppercase">No signals detected relating to current filter.</p>
                                </div>
                            ) : (
                                filteredNotifications.map((n) => {
                                    const IconComponent = getIconForType(n.type);
                                    return (
                                    <div 
                                        key={n.id} 
                                        className={`group p-6 hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors flex items-start gap-6 relative overflow-hidden ${
                                            !n.is_read ? 'bg-blue-50/50 dark:bg-blue-500/[0.03]' : ''
                                        }`}
                                    >
                                        {!n.is_read && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 dark:bg-blue-500" />
                                        )}

                                        {/* Time / ID */}
                                        <div className="hidden md:flex flex-col items-end min-w-[100px] text-right gap-1 pt-1">
                                            <span className="font-mono text-[10px] text-zinc-400 dark:text-gray-600 uppercase">{getTimeAgo(n.created_at)}</span>
                                            <span className="font-mono text-[10px] text-zinc-300 dark:text-gray-700 uppercase">#{n.id.toString().padStart(4, '0')}</span>
                                        </div>

                                        {/* Icon */}
                                        <div className={`w-10 h-10 flex items-center justify-center border rounded-sm flex-shrink-0 ${
                                            !n.is_read 
                                            ? 'border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-500 bg-blue-100 dark:bg-blue-500/10' 
                                            : 'border-zinc-200 dark:border-white/10 text-zinc-400 dark:text-gray-500 bg-zinc-50 dark:bg-white/5'
                                        }`}>
                                            <IconComponent className="w-5 h-5" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h4 className={`text-sm font-bold uppercase tracking-tight ${!n.is_read ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-gray-400'}`}>
                                                    {n.title}
                                                </h4>
                                                {!n.is_read && (
                                                    <Badge className="h-4 bg-blue-600 dark:bg-blue-500 text-[9px] px-1 rounded-sm uppercase tracking-wider">New</Badge>
                                                )}
                                                {n.type === 'SYSTEM_ANNOUNCEMENT' && (
                                                     <Badge variant="outline" className="h-4 border-zinc-300 dark:border-gray-700 text-[9px] px-1 rounded-sm uppercase tracking-wider text-zinc-500 dark:text-gray-500">System</Badge>
                                                )}
                                            </div>
                                            <p className="text-xs md:text-sm font-mono text-zinc-600 dark:text-gray-400 leading-relaxed mb-2">
                                                {n.message}
                                            </p>
                                            {n.action_url && (
                                                <Link href={n.action_url} className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline uppercase flex items-center gap-1">
                                                    View Details <Terminal className="w-3 h-3" />
                                                </Link>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-4 md:relative md:opacity-100 md:right-auto md:top-auto">
                                            {!n.is_read && (
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 text-blue-600 dark:text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-500/20"
                                                    onClick={() => handleMarkAsRead(n.id)}
                                                    title="Mark as read"
                                                >
                                                    <div className="w-2 h-2 rounded-full bg-current" />
                                                </Button>
                                            )}
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                onClick={() => handleDelete(n.id)}
                                                title="Delete log"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>

                                    </div>
                                    );
                                })
                            )}
                        </div>
                    </ScrollArea>
                 </div>
            </div>

        </div>

      </div>
    </div>
  );
}
