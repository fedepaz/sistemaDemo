// src/features/permissions/components/user-selector.tsx

import { Users, Check, ChevronsUpDown } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useUsers } from "@/features/users/hooks/usersHooks";
import { useCallback, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { UserProfileDto } from "@vivero/shared";

interface UserSelectorProps {
  onSelectedUserId: (userId: string) => void;
}

export function UserSelector({ onSelectedUserId }: UserSelectorProps) {
  const [open, setOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data: users = [] } = useUsers();

  const selectedUser = useMemo(
    () => users.find((u) => u.id === selectedUserId),
    [users, selectedUserId],
  );

  const handleUserChange = useCallback(
    (userId: string) => {
      setSelectedUserId(userId);
      onSelectedUserId(userId);
      setOpen(false);
    },
    [onSelectedUserId],
  );

  const getInitials = (user: UserProfileDto) => {
    return (
      [user.firstName?.[0], user.lastName?.[0]]
        .filter(Boolean)
        .join("")
        .toUpperCase() ||
      user.username[0]?.toUpperCase() ||
      "U"
    );
  };

  const getDisplayName = (user: UserProfileDto) => {
    return (
      [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username
    );
  };

  return (
    <div className="px-6 py-6 bg-background">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
        <div className="space-y-1.5 lg:flex-1">
          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">
            <Users className="h-3.5 w-3.5" />
            Seleccionar Usuario
          </label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full h-11 rounded-xl bg-muted/30 border-border/60 justify-between font-normal hover:bg-muted/50 focus:ring-primary/20 lg:max-w-md"
              >
                {selectedUser ? (
                  <div className="flex items-center gap-2 truncate">
                    <Avatar className="h-6 w-6 border border-border/50">
                      <AvatarFallback className="bg-primary/5 text-[10px] font-bold text-primary">
                        {getInitials(selectedUser)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate">
                      {getDisplayName(selectedUser)}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">
                    Elige un usuario para empezar
                  </span>
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[var(--radix-popover-trigger-width)] p-0 rounded-xl shadow-xl overflow-hidden border-border/60"
              align="start"
            >
              <Command className="w-full">
                <CommandInput
                  placeholder="Buscar usuario..."
                  className="h-11 border-none focus:ring-0"
                />
                <CommandList className="max-h-[320px] scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                  <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                    No se encontraron usuarios.
                  </CommandEmpty>
                  <CommandGroup>
                    {users.map((user) => (
                      <CommandItem
                        key={user.id}
                        value={`${user.firstName} ${user.lastName} ${user.username} ${user.id}`}
                        onSelect={() => handleUserChange(user.id)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg my-1 cursor-pointer data-[selected=true]:bg-primary/10 data-[selected=true]:text-foreground"
                      >
                        <Avatar className="h-8 w-8 border border-border/50">
                          <AvatarFallback className="bg-primary/5 text-xs font-bold text-primary">
                            {getInitials(user)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-sm font-semibold truncate">
                            {getDisplayName(user)}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            @{user.username}
                          </span>
                        </div>
                        {!user.isActive && (
                          <Badge
                            variant="secondary"
                            className="h-4 text-[9px] uppercase tracking-tighter"
                          >
                            Inactivo
                          </Badge>
                        )}
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4 text-primary transition-opacity",
                            selectedUserId === user.id
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
