// apps/frontend/src/features/formulas/components/__tests__/formula-data-table.test.tsx
import { render, screen, act } from "@testing-library/react";

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});
import { FormulaDataTable } from "../formula-data-table";
import type { FormulaDto } from "@vivero/shared";

jest.mock("@/components/data-display/data-table", () => ({
  DataTable: ({
    title,
    onView,
  }: {
    title: string;
    onView: (row: FormulaDto) => void;
    onCreate: () => void;
  }) => (
    <div data-testid="data-table">
      <h1>{title}</h1>
      <button onClick={() => onView(mockFormulas[0])}>View Row</button>
    </div>
  ),
  SlideOverForm: ({
    open,
    children,
  }: {
    open: boolean;
    children: React.ReactNode;
  }) =>
    open ? (
      <div data-testid="slide-over-form">{children}</div>
    ) : null,
}));

jest.mock("@/features/formulas/hooks/useFormulas", () => ({
  useFormulas: () => ({
    data: mockFormulas,
  }),
  useCreateFormula: () => ({
    mutateAsync: jest.fn().mockResolvedValue(undefined),
    isPending: false,
  }),
}));

jest.mock("@/features/productos/hooks/useProductos", () => ({
  useProductos: () => ({
    data: [{ id: "p1", nombre: "Turba", createdAt: new Date() }],
  }),
}));

const mockFormulas: FormulaDto[] = [
  {
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
  },
];

describe("FormulaDataTable", () => {
  it("renders DataTable with correct title", () => {
    render(<FormulaDataTable />);
    expect(screen.getByTestId("data-table")).toBeInTheDocument();
    expect(screen.getByText("Fórmulas")).toBeInTheDocument();
  });

  it("opens slide-over in view mode when view is triggered", () => {
    render(<FormulaDataTable />);
    act(() => {
      screen.getByText("View Row").click();
    });
    expect(screen.getByTestId("slide-over-form")).toBeInTheDocument();
  });
});
