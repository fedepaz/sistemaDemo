// src/features/permissions/components/permission-selector.tsx

import { Check, ChevronsUpDown } from "lucide-react";
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
import { useTables } from "../hooks/permsHooks";
import { useCallback, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Entity } from "@vivero/shared";

interface PermissionSelectorProps {
  onSelectedEntityId: (entityId: string) => void;
}

export function PermissionSelector({
  onSelectedEntityId,
}: PermissionSelectorProps) {
  const [open, setOpen] = useState(false);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

  const { data: tables = [] } = useTables();

  const selectedTable = useMemo(
    () => tables.find((t) => t.id === selectedEntityId),
    [tables, selectedEntityId],
  );

  const handleTableChange = useCallback(
    (tableId: string) => {
      setSelectedEntityId(tableId);
      onSelectedEntityId(tableId);
      setOpen(false);
    },
    [onSelectedEntityId],
  );

  const getInitials = (table: Entity) => {
    return (
      [table.name[0], table.label[0]].filter(Boolean).join("").toUpperCase() ||
      table.name[0]?.toUpperCase() ||
      "T"
    );
  };

  const getDisplayName = (table: Entity) => {
    if (table.label) {
      // turn first letter all words to uppercase
      return table.label
        .split(" ")
        .map((w) => w[0].toUpperCase() + w.slice(1))
        .join(" ");
    } else {
      return [table.name];
    }
  };

  return (
    <div className="px-6 py-6 bg-background">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
        <div className="space-y-1.5 lg:flex-1">
          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">
            <Check className="h-3.5 w-3.5" />
            Seleccionar Tabla
          </label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full h-11 rounded-xl bg-muted/30 border-border/60 justify-between font-normal hover:bg-muted/50 focus:ring-primary/20 lg:max-w-md"
              >
                {selectedTable ? (
                  <div className="flex items-center gap-2 truncate">
                    <Avatar className="h-6 w-6 border border-border/50">
                      <AvatarFallback className="bg-primary/5 text-[10px] font-bold text-primary">
                        {getInitials(selectedTable)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate">
                      {getDisplayName(selectedTable)}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">
                    Elige una tabla para empezar
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
                  placeholder="Buscar tabla..."
                  className="h-11 border-none focus:ring-0"
                />
                <CommandList className="max-h-[320px] scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                  <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                    No se encontraron tablas.
                  </CommandEmpty>
                  <CommandGroup>
                    {tables.map((table) => (
                      <CommandItem
                        key={table.id}
                        value={`${table.name} ${table.label} ${table.id}`}
                        onSelect={() => handleTableChange(table.id)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg my-1 cursor-pointer data-[selected=true]:bg-primary/10 data-[selected=true]:text-foreground"
                      >
                        <Avatar className="h-8 w-8 border border-border/50">
                          <AvatarFallback className="bg-primary/5 text-xs font-bold text-primary">
                            {getInitials(table)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-sm font-semibold truncate">
                            {getDisplayName(table)}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            @{table.name}
                          </span>
                        </div>
                        {!table.isActive && (
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
                            selectedEntityId === table.id
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
