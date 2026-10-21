// apps/frontend/src/features/productos/components/sistema-web-badge.tsx
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function SistemaWebBadge() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant="outline"
          aria-label="Sistema Web"
          className="h-6 w-6 p-0 flex items-center justify-center text-muted-foreground border-border/40 bg-muted/30 shrink-0"
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
        </Badge>
      </TooltipTrigger>
      <TooltipContent side="top">
        <p>Sistema Web</p>
      </TooltipContent>
    </Tooltip>
  );
}
