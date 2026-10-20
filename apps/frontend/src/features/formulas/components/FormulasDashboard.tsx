// apps/frontend/src/features/formulas/components/FormulasDashboard.tsx
import { DataTableSkeleton } from "@/components/data-display/data-table";
import { FormulaDataTable } from "./formula-data-table";
import { formulaColumns } from "./columns";
import { LoadingBoundary } from "@/components/common/loading-boundary";

export function FormulasDashboard() {
  return (
    <div className="flex flex-col gap-3 xl:gap-4">
      <LoadingBoundary
        skeleton={<DataTableSkeleton columnCount={formulaColumns.length} />}
      >
        <FormulaDataTable />
      </LoadingBoundary>
    </div>
  );
}
