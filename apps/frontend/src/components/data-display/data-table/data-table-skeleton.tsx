import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function DataTableSkeleton({
  columnCount,
  rowCount = 7,
  toolbarContent,
}: {
  columnCount: number;
  rowCount?: number;
  toolbarContent?: ReactNode;
}) {
  return (
    <Card className="w-full flex flex-col overflow-hidden bg-card/40 border-border/40 shadow-premium rounded-none my-2">
      <CardHeader className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-[150px] sm:w-[200px]" />
            <Skeleton className="h-4 w-full max-w-[300px]" />
          </div>
          <Skeleton className="h-6 w-[80px] sm:w-[100px] rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Search bar */}
        <div className="flex items-center gap-2 px-4 py-2 shrink-0 border-b">
          <div className="relative flex-1 max-w-sm">
            <Skeleton className="h-8 w-full" />
          </div>
          <Skeleton className="h-5 w-[120px] rounded-full hidden md:inline-flex" />
        </div>

        {/* Toolbar row */}
        <div className="flex items-center px-4 py-2 space-x-2 shrink-0">
          <Skeleton className="h-8 w-[80px] sm:w-[90px]" />
          <Skeleton className="h-8 w-[80px] sm:w-[90px]" />
          {toolbarContent && (
            <div className="flex-1 flex items-center gap-2">{toolbarContent}</div>
          )}
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto px-4">
          <div className="rounded-md border">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  {Array.from({ length: columnCount }).map((_, index) => (
                    <TableHead
                      key={index}
                      className={cn(
                        "h-9 py-1 text-xs font-semibold",
                        index >= 2 && "hidden sm:table-cell",
                      )}
                    >
                      <Skeleton className="h-4 w-[80px]" />
                    </TableHead>
                  ))}
                  {/* Actions column */}
                  <TableHead className="h-9 py-1 text-xs font-semibold">
                    <Skeleton className="h-4 w-[60px]" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: rowCount }).map((_, rowIndex) => (
                  <TableRow key={rowIndex} className="hover:bg-accent/50">
                    {Array.from({ length: columnCount }).map((_, cellIndex) => (
                      <TableCell
                        key={cellIndex}
                        className={cn(
                          "py-1 px-3 text-sm h-10",
                          cellIndex >= 2 && "hidden sm:table-cell",
                        )}
                      >
                        <Skeleton className="h-4 w-full max-w-[120px]" />
                      </TableCell>
                    ))}
                    {/* Actions cell */}
                    <TableCell className="py-1 px-3 h-10">
                      <div className="flex items-center justify-center gap-2">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-2 shrink-0 border-t mt-auto">
          <div className="flex-1 text-[11px] text-muted-foreground">
            <Skeleton className="h-4 w-[200px]" />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-[80px]" />
              <Skeleton className="h-7 w-[60px]" />
            </div>
            <div className="flex w-[80px] items-center justify-center">
              <Skeleton className="h-4 w-[100px]" />
            </div>
            <div className="flex items-center space-x-1">
              <Skeleton className="hidden lg:block h-7 w-7" />
              <Skeleton className="h-7 w-7" />
              <Skeleton className="h-7 w-7" />
              <Skeleton className="hidden lg:block h-7 w-7" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
