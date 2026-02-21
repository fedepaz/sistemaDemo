// src/features/permissions/components/user-selector.tsx

import { Users } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useUsers } from "@/features/users/hooks/usersHooks";
import { useCallback, useState } from "react";

interface UserSelectorProps {
  onSelectedUserId: (userId: string) => void;
}

export function UserSelector({ onSelectedUserId }: UserSelectorProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data: users = [], isLoading: isLoadingUsers } = useUsers();

  const handleUserChange = useCallback(
    (userId: string) => {
      setSelectedUserId(userId);
      onSelectedUserId(userId);
    },
    [onSelectedUserId],
  );
  return (
    <div className="px-6 py-6 bg-background">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
        <div className="space-y-1.5 lg:flex-1">
          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">
            <Users className="h-3.5 w-3.5" />
            Seleccionar Usuario
          </label>
          <Select
            value={selectedUserId ?? ""}
            onValueChange={handleUserChange}
            disabled={isLoadingUsers}
          >
            <SelectTrigger className="w-full h-11 rounded-xl bg-muted/30 border-border/60 transition-all hover:bg-muted/50 focus:ring-primary/20 lg:max-w-md">
              <SelectValue
                placeholder={
                  isLoadingUsers
                    ? "Cargando usuarios..."
                    : "Elige un usuario para empezar"
                }
              />
            </SelectTrigger>
            <SelectContent className="rounded-xl shadow-xl">
              {users?.map((user) => {
                const initials =
                  [user.firstName?.[0], user.lastName?.[0]]
                    .filter(Boolean)
                    .join("")
                    .toUpperCase() ||
                  user.username[0]?.toUpperCase() ||
                  "U";
                const displayName =
                  [user.firstName, user.lastName].filter(Boolean).join(" ") ||
                  user.username;
                return (
                  <SelectItem
                    key={user.id}
                    value={user.id}
                    className="rounded-lg my-1"
                  >
                    <div className="flex items-center gap-3 py-1">
                      <Avatar className="h-8 w-8 border border-border/50">
                        <AvatarFallback className="bg-primary/5 text-xs font-bold text-primary">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">
                          {displayName}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          @{user.username}
                        </span>
                      </div>
                      {!user.isActive ? (
                        <Badge
                          variant="secondary"
                          className="h-4 text-[9px] ml-auto uppercase tracking-tighter"
                        >
                          Inactivo
                        </Badge>
                      ) : null}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
