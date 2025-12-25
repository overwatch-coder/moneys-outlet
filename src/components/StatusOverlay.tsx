import { create } from "zustand";
import { CheckCircle2, AlertCircle, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StatusType = "success" | "error" | "loading";

interface StatusStore {
  isOpen: boolean;
  type: StatusType;
  title: string;
  message: string;
  showStatus: (type: StatusType, title: string, message: string) => void;
  hideStatus: () => void;
}

export const useStatus = create<StatusStore>((set) => ({
  isOpen: false,
  type: "loading",
  title: "",
  message: "",
  showStatus: (type, title, message) =>
    set({ isOpen: true, type, title, message }),
  hideStatus: () => set({ isOpen: false }),
}));

export function StatusOverlay() {
  const { isOpen, type, title, message, hideStatus } = useStatus();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-999 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={type !== "loading" ? hideStatus : undefined}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-bg-secondary border border-white/10 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl"
          >
            {type !== "loading" && (
              <button
                onClick={hideStatus}
                className="absolute top-4 right-4 text-muted hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}

            <div className="flex flex-col items-center gap-6">
              <div
                className={cn(
                  "h-20 w-20 rounded-full flex items-center justify-center shadow-lg",
                  type === "success" &&
                    "bg-green-500/20 text-green-500 shadow-green-500/10",
                  type === "error" &&
                    "bg-primary/20 text-primary shadow-primary/10",
                  type === "loading" && "bg-white/10 text-white shadow-white/5"
                )}
              >
                {type === "success" && <CheckCircle2 className="h-10 w-10" />}
                {type === "error" && <AlertCircle className="h-10 w-10" />}
                {type === "loading" && (
                  <Loader2 className="h-10 w-10 animate-spin" />
                )}
              </div>

              <div>
                <h3 className="text-2xl font-black uppercase italic mb-2 tracking-tighter text-white">
                  {title}
                </h3>
                <p className="text-muted leading-relaxed">{message}</p>
              </div>

              {type !== "loading" && (
                <Button
                  onClick={hideStatus}
                  className={cn(
                    "w-full py-8 font-black uppercase italic rounded-2xl transition-all text-lg",
                    type === "success"
                      ? "bg-green-500 hover:bg-green-600 text-white"
                      : "bg-primary hover:bg-primary/80 text-white"
                  )}
                >
                  {type === "success" ? "Great!" : "Try Again"}
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
