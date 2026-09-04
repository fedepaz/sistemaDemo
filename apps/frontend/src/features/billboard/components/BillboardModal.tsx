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
import { Megaphone } from "lucide-react";

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
        <DialogContent
          className="max-h-[90dvh] flex flex-col sm:max-w-xl md:max-w-3xl lg:max-w-4xl xl:max-w-6xl"
          aria-label="Actualizaciones del sistema"
        >
          <DialogHeader className="border-b border-border/40 pb-4">
            <div className="flex items-center justify-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Megaphone className="h-5 w-5 text-primary" />
              </div>
              <DialogTitle className="text-xl md:text-2xl font-black uppercase tracking-widest">
                Actualizaciones
              </DialogTitle>
            </div>
            <DialogDescription className="sr-only">
              Hay {messages.length}{" "}
              {messages.length === 1 ? "novedad" : "novedades"} para ti.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 py-2 mx-auto w-full">
            {[...messages]
              .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
              .map((msg) => (
              <article
                key={msg.id}
                // 🚀 Added more padding for that spacious, premium feel
                className="rounded-lg border bg-card p-4 sm:p-5 md:p-6 space-y-2"
              >
                <h3 className="font-semibold text-base md:text-lg">
                  {msg.title}
                </h3>
                {/* 🚀 Added leading-relaxed so wider text blocks breathe better */}
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  {msg.body}
                </p>
                <time className="text-xs text-muted-foreground">
                  {new Date(msg.createdAt).toLocaleDateString("es-AR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </time>
              </article>
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
