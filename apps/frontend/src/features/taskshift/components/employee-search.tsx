"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { userService } from "@/features/users/api/userService";
import { usersQueryKeys } from "@/lib/queryKeys";
import type { UserProfileDto } from "@vivero/shared";

interface EmployeeSearchProps {
  selectedEmployees: UserProfileDto[];
  onSelect: (employee: UserProfileDto) => void;
  onRemove: (employee: UserProfileDto) => void;
}

function matchesSearch(user: UserProfileDto, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    user.firstName?.toLowerCase().includes(q) ||
    user.lastName?.toLowerCase().includes(q) ||
    user.username.toLowerCase().includes(q)
  );
}

export function EmployeeSearch({
  selectedEmployees,
  onSelect,
  onRemove,
}: EmployeeSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  const { data: allUsers = [], isLoading } = useQuery<UserProfileDto[]>({
    queryKey: usersQueryKeys.all(),
    queryFn: () => userService.fetchAll(),
    enabled: showResults,
  });

  const selectedIds = new Set(selectedEmployees.map((e) => e.id));
  const filteredUsers = allUsers.filter(
    (user) => matchesSearch(user, searchQuery) && !selectedIds.has(user.id),
  );

  function handleSearch() {
    setShowResults(true);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      handleSearch();
    }
  }

  return (
    <div className="flex flex-col gap-3 md:gap-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar empleados..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <Button type="button" variant="secondary" onClick={handleSearch}>
          Buscar
        </Button>
      </div>

      {showResults && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Empleados disponibles
            </span>
            {isLoading ? (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : filteredUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                {allUsers.length === 0
                  ? "No se encontraron usuarios."
                  : "No hay empleados disponibles."}
              </p>
            ) : (
              <ScrollArea className="h-48">
                <div className="flex flex-col gap-1">
                  {filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      className="flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors text-left cursor-pointer"
                      onClick={() => onSelect(user)}
                    >
                      <span className="font-medium">
                        {user.firstName} {user.lastName}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        @{user.username}
                      </span>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          {selectedEmployees.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Seleccionados ({selectedEmployees.length})
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedEmployees.map((user) => (
                  <Badge key={user.id} variant="secondary" className="gap-1 pr-1">
                    {user.firstName} {user.lastName}
                    <button
                      type="button"
                      className="ml-1 rounded-full p-0.5 hover:bg-muted cursor-pointer"
                      onClick={() => onRemove(user)}
                      aria-label={`Eliminar ${user.firstName} ${user.lastName}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
