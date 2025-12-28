/**
 * Mimariproje.com - Notifications Panel
 * Bildirimler paneli component'i
 */

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  X,
  Settings,
  MessageCircle,
  Heart,
  Briefcase,
  CreditCard,
  AlertTriangle,
  Info,
  Clock,
  ExternalLink,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useNotifications, type Notification } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

interface NotificationsPanelProps {
  className?: string;
}

export function NotificationsPanel({ className }: NotificationsPanelProps) {
  const {
    notifications,
    unreadCount,
    isLoading,
    isConnected,
    connectionStatus,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  // Filter notifications
  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread") {
      return !notification.is_read;
    }
    return true;
  });

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // Navigate to action URL if exists
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  };

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case "project_like":
        return <Heart className="h-4 w-4 text-red-500" />;
      case "job_application":
        return <Briefcase className="h-4 w-4 text-green-500" />;
      case "payment_success":
        return <CreditCard className="h-4 w-4 text-green-500" />;
      case "payment_failed":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "system_announcement":
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get notification priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 border-red-200 dark:bg-red-900/20 dark:border-red-800";
      case "high":
        return "bg-orange-100 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800";
      case "normal":
        return "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800";
      case "low":
        return "bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800";
      default:
        return "bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800";
    }
  };

  // Format time
  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: tr,
      });
    } catch {
      return "Bilinmeyen zaman";
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <div className="relative">
            {isConnected ? (
              <BellRing className="h-4 w-4" />
            ) : (
              <Bell className="h-4 w-4 text-muted-foreground" />
            )}
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0" sideOffset={5}>
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Bildirimler</CardTitle>
              <div className="flex items-center gap-2">
                {/* Connection status indicator */}
                <div className="flex items-center gap-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isConnected
                        ? "bg-green-500"
                        : connectionStatus === "connecting"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  />
                  <span className="text-xs text-muted-foreground">
                    {connectionStatus === "connected"
                      ? "Canlı"
                      : connectionStatus === "connecting"
                      ? "Bağlanıyor"
                      : "Çevrimdışı"}
                  </span>
                </div>

                {/* Settings */}
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/ayarlar/bildirimler">
                    <Settings className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Filter and actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant={filter === "all" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFilter("all")}
                  className="h-7 text-xs"
                >
                  Tümü ({notifications.length})
                </Button>
                <Button
                  variant={filter === "unread" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFilter("unread")}
                  className="h-7 text-xs"
                >
                  Okunmamış ({unreadCount})
                </Button>
              </div>

              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="h-7 text-xs"
                >
                  <CheckCheck className="h-3 w-3 mr-1" />
                  Tümünü Oku
                </Button>
              )}
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Bell className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {filter === "unread"
                      ? "Okunmamış bildiriminiz yok"
                      : "Henüz bildiriminiz yok"}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredNotifications.map((notification, index) => (
                    <div key={notification.id}>
                      <div
                        className={`p-3 hover:bg-muted/50 cursor-pointer transition-colors ${
                          !notification.is_read
                            ? "bg-blue-50/50 dark:bg-blue-900/10"
                            : ""
                        } ${getPriorityColor(notification.priority)}`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <h4
                                className={`text-sm font-medium ${
                                  !notification.is_read
                                    ? "text-foreground"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {notification.title}
                              </h4>

                              {/* Actions */}
                              <div className="flex items-center gap-1 ml-2">
                                {!notification.is_read && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsRead(notification.id);
                                    }}
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notification.id);
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>

                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {notification.message}
                            </p>

                            {/* Metadata */}
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-2">
                                {/* Related user */}
                                {notification.related_user && (
                                  <div className="flex items-center gap-1">
                                    <Avatar className="h-4 w-4">
                                      <AvatarImage
                                        src={
                                          notification.related_user
                                            .profile_image_url
                                        }
                                        alt={
                                          notification.related_user.full_name
                                        }
                                      />
                                      <AvatarFallback className="text-xs">
                                        {notification.related_user.full_name?.charAt(
                                          0
                                        ) || "?"}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs text-muted-foreground">
                                      {notification.related_user.full_name}
                                    </span>
                                  </div>
                                )}

                                {/* Time */}
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">
                                    {formatTime(notification.created_at)}
                                  </span>
                                </div>
                              </div>

                              {/* Action button */}
                              {notification.action_url &&
                                notification.action_text && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.location.href =
                                        notification.action_url!;
                                    }}
                                  >
                                    {notification.action_text}
                                    <ExternalLink className="h-3 w-3 ml-1" />
                                  </Button>
                                )}
                            </div>
                          </div>

                          {/* Unread indicator */}
                          {!notification.is_read && (
                            <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2" />
                          )}
                        </div>
                      </div>

                      {index < filteredNotifications.length - 1 && (
                        <Separator />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>

          {filteredNotifications.length > 0 && (
            <>
              <Separator />
              <div className="p-3">
                <Button variant="ghost" size="sm" className="w-full" asChild>
                  <Link href="/bildirimler">Tüm Bildirimleri Görüntüle</Link>
                </Button>
              </div>
            </>
          )}
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
