// apps/frontend/src/features/formulas/components/__tests__/formula-view-form.test.tsx
import { render, screen } from "@testing-library/react";
import { FormulaViewForm } from "../formula-view-form";
import type { FormulaDto } from "@vivero/shared";

const mockFormula: FormulaDto = {
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
  deletedAt: null,
  deletedByUserId: null,
  deletedByUsername: null,
};

describe("FormulaViewForm", () => {
  it("should display producto names and percentages", () => {
    render(<FormulaViewForm selectedFormula={mockFormula} />);
    expect(screen.getByText("Turba")).toBeInTheDocument();
    expect(screen.getByText("Perlita")).toBeInTheDocument();
    expect(screen.getByText("60%")).toBeInTheDocument();
    expect(screen.getByText("40%")).toBeInTheDocument();
  });

  it("should not display any status badge when active", () => {
    render(<FormulaViewForm selectedFormula={mockFormula} />);
    expect(screen.queryByText("Activo")).toBeNull();
    expect(screen.queryByText("Inactivo")).toBeNull();
  });

  it("should display Inactivo badge when inactive", () => {
    render(
      <FormulaViewForm
        selectedFormula={{ ...mockFormula, isActive: false }}
      />,
    );
    expect(screen.getByText("Inactivo")).toBeInTheDocument();
    expect(screen.queryByText("Activo")).toBeNull();
  });

  it("should display formatted creation date", () => {
    render(<FormulaViewForm selectedFormula={mockFormula} />);
    expect(screen.getByText(/de marzo de 2024/i)).toBeInTheDocument();
  });

  it("should show dash for empty slots", () => {
    render(<FormulaViewForm selectedFormula={mockFormula} />);
    const dashes = screen.getAllByText("-");
    expect(dashes.length).toBe(4);
  });

  it("should show deletion date and deleter when deleted", () => {
    render(
      <FormulaViewForm
        selectedFormula={{
          ...mockFormula,
          isActive: false,
          deletedAt: new Date("2026-10-01T12:00:00.000Z"),
          deletedByUserId: "u1",
          deletedByUsername: "admin",
        }}
      />,
    );
    expect(screen.getByText(/de octubre de 2026/)).toBeInTheDocument();
    expect(screen.getByText(/por admin/)).toBeInTheDocument();
  });

  it("should omit the deleter clause when username is null", () => {
    render(
      <FormulaViewForm
        selectedFormula={{
          ...mockFormula,
          deletedAt: new Date("2026-10-01T12:00:00.000Z"),
          deletedByUserId: "u1",
          deletedByUsername: null,
        }}
      />,
    );
    expect(screen.getByText(/de octubre de 2026/)).toBeInTheDocument();
    expect(screen.queryByText(/por admin/)).toBeNull();
  });

  it("should not show a deletion line for active records", () => {
    render(<FormulaViewForm selectedFormula={mockFormula} />);
    expect(screen.queryByText(/Eliminado/)).toBeNull();
  });
});
