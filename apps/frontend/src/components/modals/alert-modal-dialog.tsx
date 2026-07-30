"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AlertsDashboardV1 } from "@/features/alerts";
import { useAlertModal } from "@/providers/alert-modal-provider";
import { Bell } from "lucide-react";

export function AlertModalDialog() {
  const { state, closeAlert } = useAlertModal();
  const { isOpen } = state;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closeAlert();
      }}
    >
      <DialogContent
        className="sm:max-w-5xl lg:max-w-7xl max-h-[90dvh] overflow-y-auto p-4 sm:p-6 lg:p-8"
        showCloseButton={false}
      >
        <DialogHeader className="border-b border-border/40 pb-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-black uppercase tracking-widest">
              Alertas
            </DialogTitle>
          </div>
          <DialogDescription className="sr-only">
            Panel de alertas del sistema
          </DialogDescription>
        </DialogHeader>
        <AlertsDashboardV1 />
      </DialogContent>
    </Dialog>
  );
}
