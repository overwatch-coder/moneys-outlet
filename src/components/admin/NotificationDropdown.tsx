import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, Check, Trash2, Mail, ShoppingBag } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { dataService } from "@/lib/dataService";
import { supabase } from "@/lib/supabase";
import type { AdminNotification } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const data = await dataService.getNotifications();
      // console.log("Fetching notifications...", data);
      setNotifications(data || []);
      setUnreadCount(data?.filter((n) => !n.isRead).length || 0);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    fetchNotifications();

    // Subscribe to real-time changes
    const channel = supabase
      .channel("admin_notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "admin_notification",
        },
        (payload) => {
          const newNotification = payload.new as AdminNotification;
          setNotifications((prev) => [newNotification, ...prev]);
          setUnreadCount((prev) => prev + 1);
          // Optional: Play a sound
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await dataService.markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await dataService.markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await dataService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      // Re-calculate unread count just in case
      const notification = notifications.find((n) => n.id === id);
      if (notification && !notification.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-white hover:text-primary hover:bg-white/5 transition-colors"
        >
          <Bell className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-background animate-pulse">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-96 bg-[#111111] border-white/10 text-white shadow-2xl rounded-xl"
      >
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <DropdownMenuLabel className="font-bold text-lg p-0">
            Notifications
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="text-xs text-muted hover:text-white h-auto p-0 hover:bg-transparent"
            >
              Mark all as read
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-muted">
              <Bell className="h-12 w-12 mb-4 opacity-20" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    "flex items-start gap-4 p-4 focus:bg-white/5 cursor-default border-b border-white/5 last:border-none",
                    !notification.isRead && "bg-white/2"
                  )}
                >
                  <div className="mt-1">
                    {notification.type === "ORDER" ? (
                      <div className="h-8 w-8 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
                        <ShoppingBag className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center">
                        <Mail className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p
                      className={cn(
                        "text-sm leading-snug",
                        !notification.isRead
                          ? "font-semibold text-white"
                          : "text-muted"
                      )}
                    >
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium opacity-60">
                        {formatDistanceToNow(
                          new Date(notification.created_at),
                          { addSuffix: true }
                        )}
                      </p>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-primary hover:text-white hover:bg-primary/20"
                            onClick={(e) =>
                              handleMarkAsRead(notification.id, e)
                            }
                            title="Mark as read"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted hover:text-red-500 hover:bg-red-500/10"
                          onClick={(e) => handleDelete(notification.id, e)}
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="p-3 border-t border-white/5 bg-white/2">
          <Link onClick={() => setIsOpen(false)} to="/admin/notifications">
            <Button
              variant="ghost"
              className="w-full text-xs font-bold uppercase tracking-widest text-muted hover:text-white"
            >
              View all notifications
            </Button>
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
