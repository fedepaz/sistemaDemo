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

export function DataTableSkeleton({
  columnCount,
  rowCount = 7,
}: {
  columnCount: number;
  rowCount?: number;
}) {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-[200px]" />
              <Skeleton className="h-4 w-[300px]" />
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-6 w-[80px]" />
              <Skeleton className="h-8 w-[90px]" />
              <Skeleton className="h-8 w-[90px]" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and filter controls */}
          <div className="flex items-center py-4 space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Skeleton className="h-9 w-full" />
            </div>
            <Skeleton className="h-9 w-[100px]" />
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {Array.from({ length: columnCount }).map((_, index) => (
                    <TableHead key={index} className="font-semibold">
                      <Skeleton className="h-4 w-[80px]" />
                    </TableHead>
                  ))}
                  {/* Actions column */}
                  <TableHead className="font-semibold">
                    <Skeleton className="h-4 w-[60px]" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: rowCount }).map((_, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {Array.from({ length: columnCount }).map((_, cellIndex) => (
                      <TableCell key={cellIndex}>
                        <Skeleton className="h-4 w-full max-w-[120px]" />
                      </TableCell>
                    ))}
                    {/* Actions cell */}
                    <TableCell>
                      <Skeleton className="h-8 w-8" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="flex-1">
              <Skeleton className="h-4 w-[200px]" />
            </div>
            <div className="flex items-center space-x-6 lg:space-x-8">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-8 w-[70px]" />
              </div>
              <div className="flex items-center justify-center">
                <Skeleton className="h-4 w-[100px]" />
              </div>
              <div className="flex items-center space-x-2">
                <Skeleton className="hidden lg:block h-8 w-8" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="hidden lg:block h-8 w-8" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
