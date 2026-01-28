// src/components/common/edit-dialog-button.tsx

import { AlertTriangle } from "lucide-react";
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

interface EditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  onConfirm: () => void;
  itemCount?: number;
  isLoading?: boolean;
}

export function EditDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  itemCount = 1,
  isLoading = false,
}: EditDialogProps) {
  const dialogTitle = title || "¿Estás seguro que quieres editar?";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <AlertDialogTitle className="text-xl">
              {dialogTitle}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base pt-2">
            {description ||
              `¿Estás seguro de que quieres editar ${itemCount} elemento(s)? Esta acción no se puede deshacer.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isLoading}
            className="min-h-[48px] min-w-[100px]"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 min-h-[48px] min-w-[100px]"
          >
            {isLoading ? "Editando..." : "Editar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
