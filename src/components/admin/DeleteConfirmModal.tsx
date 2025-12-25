import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemName: string;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
}: DeleteConfirmModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white border-none max-w-sm">
        <DialogHeader className="flex flex-col items-center pt-6">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Trash2 className="h-8 w-8 text-red-500" />
          </div>
          <DialogTitle className="text-xl font-black text-black text-center">
            {title}
          </DialogTitle>
          <DialogDescription className="text-center text-black/60 pt-2">
            Are you sure you want to delete{" "}
            <span className="font-bold text-black">"{itemName}"</span>? This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-black/10 text-white hover:text-black hover:bg-black/5"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white border-none"
          >
            Confirm Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
