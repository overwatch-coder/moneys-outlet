import { useState, useEffect } from "react";
import { dataService } from "@/lib/dataService";
import type { ContactMessage } from "@/types";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Trash2 } from "lucide-react";

const ITEMS_PER_PAGE = 15;

export default function AdminContactMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(
    null
  );
  const [itemToDelete, setItemToDelete] = useState<ContactMessage | null>(null);
  const showStatus = useStatus((state) => state.showStatus);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const data = await dataService.getContactMessages();
      setMessages(data || []);
    } catch (error) {
      console.error(error);
      showStatus("error", "Error", "Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (message: ContactMessage, e: React.MouseEvent) => {
    e.stopPropagation();
    setItemToDelete(message);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      // Assuming deleteContactMessage exists or will exist.
      // I will add it to dataService in a moment.
      await dataService.deleteContactMessage(itemToDelete.id);
      setMessages((prev) => prev.filter((m) => m.id !== itemToDelete.id));
      showStatus("success", "Deleted", "Message removed");
    } catch (error) {
      showStatus("error", "Error", "Failed to delete message");
    } finally {
      setItemToDelete(null);
    }
  };

  // Pagination Logic
  const totalPages = Math.ceil(messages.length / ITEMS_PER_PAGE);
  const currentMessages = messages.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) return <LoadingScreen text="Loading Messages..." />;

  return (
    <div className="p-3 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold italic uppercase tracking-tighter text-black">
            Contact Messages
          </h1>
          <p className="text-black/40 mt-2">
            Inquiries from the Contact Us page
          </p>
        </div>
      </div>

      <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/2">
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted">
                  Date
                </th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted">
                  Name
                </th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted">
                  Email
                </th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted">
                  Subject
                </th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {currentMessages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted">
                    No messages found.
                  </td>
                </tr>
              ) : (
                currentMessages.map((msg) => (
                  <tr
                    key={msg.id}
                    className="hover:bg-white/2 transition-colors group"
                  >
                    <td className="p-4 text-sm font-medium text-white/60 whitespace-nowrap">
                      {format(new Date(msg.created_at), "MMM d, yyyy")}
                    </td>
                    <td className="p-2 md:p-4 font-bold text-white text-sm md:base">
                      {msg.name}
                    </td>
                    <td className="p-4 text-sm text-primary">{msg.email}</td>
                    <td className="p-4 text-sm text-white/80 max-w-xs truncate">
                      {msg.subject || (
                        <span className="text-muted italic">No Subject</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-primary hover:text-white"
                          onClick={() => setSelectedMessage(msg)}
                        >
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted hover:text-red-500 hover:bg-red-500/10"
                          onClick={(e) => handleDelete(msg, e)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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

      {/* Message Details Modal */}
      <Dialog
        open={!!selectedMessage}
        onOpenChange={(open) => !open && setSelectedMessage(null)}
      >
        <DialogContent className="max-w-2xl bg-[#111111] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold italic uppercase tracking-wider text-primary">
              Message Details
            </DialogTitle>
            <DialogDescription className="text-muted">
              Received on{" "}
              {selectedMessage &&
                format(new Date(selectedMessage.created_at), "PPP p")}
            </DialogDescription>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted">
                    From
                  </label>
                  <p className="text-white font-bold text-lg">
                    {selectedMessage.name}
                  </p>
                  <p className="text-primary">{selectedMessage.email}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted">
                    Subject
                  </label>
                  <p className="text-white">
                    {selectedMessage.subject || "N/A"}
                  </p>
                </div>
              </div>

              <div className="space-y-2 bg-white/5 p-4 rounded-xl border border-white/5">
                <label className="text-xs font-bold uppercase tracking-widest text-muted">
                  Message
                </label>
                <p className="text-white/90 leading-relaxed whitespace-pre-wrap">
                  {selectedMessage.message}
                </p>
              </div>

              <div className="flex justify-end pt-4 gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedMessage(null)}
                  className="border-white/10"
                >
                  Close
                </Button>
                <Button
                  className="bg-primary hover:bg-primary/90 text-white"
                  onClick={() =>
                    window.open(
                      `mailto:${selectedMessage.email}?subject=Re: ${
                        selectedMessage.subject || "Inquiry"
                      }`
                    )
                  }
                >
                  <Mail className="h-4 w-4 mr-2" /> Reply via Email
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Message"
        itemName={
          itemToDelete ? `Message from ${itemToDelete.name}` : "this message"
        }
      />
    </div>
  );
}
