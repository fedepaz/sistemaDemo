"use client";

import { AlertModalContent } from "./alert-modal-content";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAlertModal } from "@/providers/alert-modal-provider";

const TITLE_MAP: Record<string, string> = {
  critical: "Alertas Críticas",
  warning: "Alertas",
  info: "Información",
};

export function AlertModalDialog() {
  const { state, closeAlert } = useAlertModal();
  const { isOpen, alertType } = state;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) closeAlert(); }}>
      <DialogContent className="sm:max-w-[600px] max-h-[80dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {alertType ? TITLE_MAP[alertType] ?? "Alertas" : "Alertas"}
          </DialogTitle>
        </DialogHeader>
        <AlertModalContent alertType={alertType} data={state.data} />
      </DialogContent>
    </Dialog>
  );
}
