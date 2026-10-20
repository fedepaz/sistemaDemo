// apps/frontend/src/features/productos/components/ProductosDashboard.tsx
import { DataTableSkeleton } from "@/components/data-display/data-table";
import { ProductoDataTable } from "./producto-data-table";
import { productoColumns } from "./columns";
import { LoadingBoundary } from "@/components/common/loading-boundary";

export function ProductosDashboard() {
  return (
    <div className="flex flex-col gap-3 xl:gap-4">
      <LoadingBoundary
        skeleton={<DataTableSkeleton columnCount={productoColumns.length} />}
      >
        <ProductoDataTable />
      </LoadingBoundary>
    </div>
  );
}
