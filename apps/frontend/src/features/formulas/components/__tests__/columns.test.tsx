/* eslint-disable @typescript-eslint/no-explicit-any */
// apps/frontend/src/features/formulas/components/__tests__/columns.test.tsx
import { render, screen } from "@testing-library/react";
import { createFormulaColumns } from "../columns";
import type { FormulaDto } from "@vivero/shared";

const baseFormula: FormulaDto = {
  id: "1",
  producto1Id: "s1",
  producto1Nombre: "Turba",
  porcentaje1: 60,
  producto2Id: "s2",
  producto2Nombre: "Perlita",
  porcentaje2: 40,
  producto3Id: null,
  producto3Nombre: null,
  porcentaje3: null,
  producto4Id: null,
  producto4Nombre: null,
  porcentaje4: null,
  isActive: true,
  createdAt: new Date("2024-03-14"),
};

function renderCell(
  accessorKey: string,
  formula: FormulaDto,
  inactiveIds: Set<string>,
) {
  const columns = createFormulaColumns(inactiveIds);
  const column = columns.find((c) => c.accessorKey === accessorKey) as any;
  return render(column.cell({ row: { original: formula } }));
}

describe("formulaColumns cell marking", () => {
  it("marks the slot when its producto is in the inactive set", () => {
    renderCell("producto2Nombre", baseFormula, new Set(["s2"]));
    expect(screen.getByTitle("Producto eliminado")).toBeInTheDocument();
  });

  it("does not mark a slot whose producto is active", () => {
    renderCell("producto2Nombre", baseFormula, new Set(["s1"]));
    expect(screen.queryByTitle("Producto eliminado")).toBeNull();
  });

  it("does not mark an empty slot", () => {
    renderCell("producto3Nombre", baseFormula, new Set(["s3"]));
    expect(screen.queryByTitle("Producto eliminado")).toBeNull();
  });
});
