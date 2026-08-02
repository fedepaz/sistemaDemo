// src/components/common/export-dropdown.tsx
"use client";

import { Download, FileSpreadsheet, FileText, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBreakpoint } from "@/hooks/useMediaQuery";

interface ExportDropdownProps {
  onExport: (format: "csv" | "excel" | "pdf") => void;
  selectedCount?: number;
  totalCount?: number;
  disabled?: boolean;
  hasExportColumns?: boolean;
}

export function ExportDropdown({
  onExport,
  selectedCount = 0,
  totalCount = 0,
  disabled = false,
  hasExportColumns = false,
}: ExportDropdownProps) {
  const breakpoint = useBreakpoint();

  const exportLabel =
    selectedCount > 0
      ? `Exportar ${selectedCount} seleccionado(s)`
      : `Exportar todo (${totalCount})`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || !hasExportColumns}
          className="min-h-[40px] bg-transparent"
          aria-label={exportLabel}
        >
          <Download className="mr-2 h-4 w-4" />
          {breakpoint === "sm" ? "" : "Exportar"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{exportLabel}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onExport("csv")}>
          <FileText className="mr-2 h-4 w-4" />
          CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onExport("excel")}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onExport("pdf")}>
          <FileDown className="mr-2 h-4 w-4" />
          PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
