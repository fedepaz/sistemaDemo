// src/features/users/components/restore-password-button.tsx
"use client";

import { Button } from "@/components/ui/button";
import { UserProfileDto } from "@vivero/shared";
import { KeyRound, Loader2 } from "lucide-react";
import { useRestorePassword } from "../hooks/usersHooks";

type Props = {
  selectedUser: UserProfileDto;
  onSuccess: () => void;
};

export function RestorePasswordButton({ selectedUser, onSuccess }: Props) {
  const { mutateAsync: restorePassword, isPending: isRestoring } =
    useRestorePassword();
  const handleRestorePassword = async () => {
    if (!selectedUser) return;
    try {
      await restorePassword({ userId: selectedUser.id });
      onSuccess();
    } catch {}
  };
  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={handleRestorePassword}
      disabled={isRestoring}
    >
      {isRestoring ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <KeyRound className="mr-2 h-4 w-4" />
      )}
      Restaurar contraseña
    </Button>
  );
}
