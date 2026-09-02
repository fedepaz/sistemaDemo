// src/features/billboard/components/BillboardModal.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useMarkBillboardRead } from "../hooks/useMarkBillboardRead";
import type { BillboardMessageDto } from "@vivero/shared";

interface BillboardModalProps {
  open: boolean;
  messages: BillboardMessageDto[];
  onClose: () => void;
}

export function BillboardModal({
  open,
  messages,
  onClose,
}: BillboardModalProps) {
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const markAsRead = useMarkBillboardRead();

  const handleConfirmRead = () => {
    markAsRead.mutate(undefined, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  const handleCloseAttempt = () => {
    setShowConfirmClose(true);
  };

  const handleConfirmClose = () => {
    setShowConfirmClose(false);
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(isOpen) => !isOpen && handleCloseAttempt()}
      >
        <DialogContent className="max-h-[90vh] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Actualizaciones</DialogTitle>
            <DialogDescription>
              Hay {messages.length}{" "}
              {messages.length === 1 ? "novedad" : "novedades"} para ti.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 py-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="rounded-lg border bg-card p-4 space-y-2"
              >
                <h3 className="font-semibold text-sm">{msg.title}</h3>
                <p className="text-sm text-muted-foreground">{msg.body}</p>
                <time className="text-xs text-muted-foreground">
                  {new Date(msg.createdAt).toLocaleDateString("es-AR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </time>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button onClick={handleConfirmRead} disabled={markAsRead.isPending}>
              {markAsRead.isPending ? "Marcando..." : "Entendido"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmClose} onOpenChange={setShowConfirmClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cerrar sin marcar como leído?</AlertDialogTitle>
            <AlertDialogDescription>
              Los mensajes no se marcarán como leídos. Los verás en tu próximo
              inicio de sesión.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClose}>
              Cerrar de todos modos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
