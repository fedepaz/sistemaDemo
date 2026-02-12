// src/components/user-profile/user-edit.tsx
"use client";

import { useAuthContext } from "@/features/auth/providers/AuthProvider";
import { useUpdateUserProfile } from "@/features/users/hooks/usersHooks";
import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export function UserProfileEdit() {
  const { userProfile } = useAuthContext();
  const { mutateAsync, isPending } = useUpdateUserProfile();

  const [firstName, setFirstName] = useState<string>(
    userProfile?.firstName || "",
  );
  const [lastName, setLastName] = useState<string>(userProfile?.lastName || "");
  const [email, setEmail] = useState<string>(userProfile?.email || "");

  const handleSubmit = async () => {
    await mutateAsync({
      userUpdate: {
        firstName,
        lastName,
        email,
      },
    });
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Nombre"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        disabled={isPending}
      />
      <Input
        placeholder="Apellido"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        disabled={isPending}
      />
      <Input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isPending}
      />
      <Button
        className="w-full bg-primary text-white rounded p-2"
        onClick={handleSubmit}
        disabled={isPending}
      >
        Guardar
      </Button>
    </div>
  );
}
