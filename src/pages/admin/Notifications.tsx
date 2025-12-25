import { useState, useEffect } from "react";
import { dataService } from "@/lib/dataService";
import type { AdminNotification } from "@/types";
import { format } from "date-fns";
import {
  Mail,
  ShoppingBag,
  Check,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import LoadingScreen from "@/components/LoadingScreen";
import { useStatus } from "@/components/StatusOverlay";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { DeleteConfirmModal } from "@/components/admin/DeleteConfirmModal";

const ITEMS_PER_PAGE = 15;

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedNotification, setSelectedNotification] =
    useState<AdminNotification | null>(null);
  const [itemToDelete, setItemToDelete] = useState<AdminNotification | null>(
    null
  );
  const showStatus = useStatus((state) => state.showStatus);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await dataService.getNotifications();
      setNotifications(data || []);
    } catch (error) {
      console.error(error);
      showStatus("error", "Error", "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await dataService.markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      showStatus("error", "Error", "Failed to update notification");
    }
  };

  const handleDelete = (
    notification: AdminNotification,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setItemToDelete(notification);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await dataService.deleteNotification(itemToDelete.id);
      setNotifications((prev) => prev.filter((n) => n.id !== itemToDelete.id));
      showStatus("success", "Deleted", "Notification removed");
    } catch (error) {
      showStatus("error", "Error", "Failed to delete notification");
    } finally {
      setItemToDelete(null);
    }
  };

  // Pagination Logic
  const totalPages = Math.ceil(notifications.length / ITEMS_PER_PAGE);
  const currentNotifications = notifications.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) return <LoadingScreen text="Loading Notifications..." />;

  return (
    <div className="p-2 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold italic uppercase tracking-tighter text-black">
            Notifications
          </h1>
          <p className="text-black/40 mt-2">
            View and manage your system alerts
          </p>
        </div>
        <Button
          onClick={() => {
            dataService.markAllNotificationsAsRead().then(() => {
              setNotifications((prev) =>
                prev.map((n) => ({ ...n, isRead: true }))
              );
              showStatus("success", "Success", "All marked as read");
            });
          }}
          variant="outline"
          className="border-white/10 hover:bg-white/40 hover:text-black"
        >
          Mark All as Read
        </Button>
      </div>

      <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-muted">
            <p>No notifications found.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {currentNotifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "flex items-start gap-6 p-6 border-b border-white/5 last:border-none transition-colors group",
                  !notification.isRead ? "bg-white/2" : "hover:bg-white/2"
                )}
              >
                <div className="mt-1 shrink-0">
                  {notification.type === "ORDER" ? (
                    <div className="h-10 w-10 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
                      <ShoppingBag className="h-5 w-5" />
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center">
                      <Mail className="h-5 w-5" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <p
                      className={cn(
                        "text-base md:text-lg line-clamp-2",
                        !notification.isRead
                          ? "font-bold text-white"
                          : "text-white/80"
                      )}
                    >
                      {notification.message}
                    </p>
                    <span className="text-xs font-bold uppercase tracking-wider text-muted shrink-0">
                      {format(
                        new Date(notification.created_at),
                        "MMM d, h:mm a"
                      )}
                    </span>
                  </div>
                  {notification.referenceId && (
                    <p className="text-xs md:text-sm text-muted mt-1 font-mono hidden md:block">
                      Ref ID: {notification.referenceId}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:text-primary hover:bg-white/10"
                    onClick={() => setSelectedNotification(notification)}
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {!notification.isRead && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-primary hover:text-white hover:bg-primary/20"
                      onClick={(e) => handleMarkAsRead(notification.id, e)}
                      title="Mark as read"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted hover:text-red-500 hover:bg-red-500/10"
                    onClick={(e) => handleDelete(notification, e)}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-white/5 bg-white/2">
            <p className="text-sm text-muted">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="border-white/10 hover:bg-white/5"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="border-white/10 hover:bg-white/5"
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Notification Details Modal */}
      <Dialog
        open={!!selectedNotification}
        onOpenChange={(open) => !open && setSelectedNotification(null)}
      >
        <DialogContent className="max-w-md bg-[#111111] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold italic uppercase tracking-wider text-primary flex items-center gap-2">
              {selectedNotification?.type === "ORDER" ? (
                <ShoppingBag className="h-5 w-5" />
              ) : (
                <Mail className="h-5 w-5" />
              )}
              Notification Details
            </DialogTitle>
            <DialogDescription className="text-muted">
              Received on{" "}
              {selectedNotification &&
                format(new Date(selectedNotification.created_at), "PPP p")}
            </DialogDescription>
          </DialogHeader>

          {selectedNotification && (
            <div className="space-y-6 mt-4">
              <div className="space-y-2 bg-white/5 p-4 rounded-xl border border-white/5">
                <label className="text-xs font-bold uppercase tracking-widest text-muted">
                  Message
                </label>
                <p className="text-white/90 leading-relaxed">
                  {selectedNotification.message}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                {selectedNotification.referenceId && (
                  <div className="flex justify-between items-center p-3 bg-white/2 rounded-lg border border-white/5">
                    <span className="text-sm text-muted">Reference ID</span>
                    <span className="font-mono text-sm text-white">
                      {selectedNotification.referenceId}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center p-3 bg-white/2 rounded-lg border border-white/5">
                  <span className="text-sm text-muted">Status</span>
                  <span
                    className={cn(
                      "text-sm font-bold",
                      selectedNotification.isRead
                        ? "text-green-500"
                        : "text-yellow-500"
                    )}
                  >
                    {selectedNotification.isRead ? "Read" : "Unread"}
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-4 gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedNotification(null)}
                  className="border-white/10 hover:bg-white/5 hover:text-white"
                >
                  Close
                </Button>
                {!selectedNotification.isRead && (
                  <Button
                    className="bg-primary hover:bg-primary/90 text-white"
                    onClick={(e) => {
                      handleMarkAsRead(selectedNotification.id, e);
                      setSelectedNotification((prev) =>
                        prev ? { ...prev, isRead: true } : null
                      );
                    }}
                  >
                    <Check className="h-4 w-4 mr-2" /> Mark as Read
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Notification"
        itemName={itemToDelete?.message || "this notification"}
      />
    </div>
  );
}
