// src/components/common/floating-action-button.tsx

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FloatingActionButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
}

export function FloatingActionButton({
  onClick,
  label,
  className,
}: FloatingActionButtonProps) {
  const finalLabel = label || "Añadir nuevo";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={onClick}
          size="lg"
          className={cn(
            "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all z-50",
            "md:h-auto md:w-auto md:rounded-md md:px-6",
            className,
          )}
          aria-label={finalLabel}
        >
          <Plus className="h-6 w-6 md:mr-2" />
          <span className="hidden md:inline">{finalLabel}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent
        side="left"
        className="md:hidden border border-border shadow-md"
      >
        <p>{finalLabel}</p>
      </TooltipContent>
    </Tooltip>
  );
}
