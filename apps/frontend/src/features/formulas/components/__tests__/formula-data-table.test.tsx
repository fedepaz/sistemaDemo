/* eslint-disable @typescript-eslint/no-explicit-any */
// apps/frontend/src/features/formulas/components/__tests__/formula-data-table.test.tsx
import { render, screen, act } from "@testing-library/react";

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});
import { FormulaDataTable, computeInactiveProductoIds } from "../formula-data-table";
import type { FormulaDto, ProductoDto } from "@vivero/shared";

const mockDeleteFormula = jest.fn().mockResolvedValue(undefined);
let capturedTableProps: any = null;

jest.mock("@/components/data-display/data-table", () => ({
  DataTable: (props: any) => {
    capturedTableProps = props;
    const { title, onView, onDelete } = props;
    return (
      <div data-testid="data-table">
        <h1>{title}</h1>
        <button onClick={() => onView(mockFormulas[0])}>View Row</button>
        <button onClick={() => onDelete(mockFormulas[0])}>Delete Row</button>
      </div>
    );
  },
  SlideOverForm: ({ open, children }: any) =>
    open ? <div data-testid="slide-over-form">{children}</div> : null,
}));

jest.mock("@/features/formulas/hooks/useFormulas", () => ({
  useFormulas: () => ({
    data: mockFormulas,
  }),
  useCreateFormula: () => ({
    mutateAsync: jest.fn().mockResolvedValue(undefined),
    isPending: false,
  }),
  useDeleteFormula: () => ({
    mutateAsync: mockDeleteFormula,
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
  beforeEach(() => {
    capturedTableProps = null;
  });

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

  it("deletes formula when delete is triggered", async () => {
    mockDeleteFormula.mockClear();
    render(<FormulaDataTable />);

    await act(async () => {
      screen.getByText("Delete Row").click();
    });

    expect(mockDeleteFormula).toHaveBeenCalledWith("1");
  });

  it("dims inactive formulas and leaves active rows untouched", () => {
    render(<FormulaDataTable />);
    expect(capturedTableProps.getRowClassName).toBeDefined();
    expect(capturedTableProps.getRowClassName(mockFormulas[0])).toBe("");
    expect(
      capturedTableProps.getRowClassName({ ...mockFormulas[0], isActive: false }),
    ).toContain("opacity-60");
  });
});

describe("computeInactiveProductoIds", () => {
  const makeProducto = (id: string, isActive: boolean): ProductoDto => ({
    id,
    nombre: id,
    isActive,
    createdAt: new Date("2024-01-01"),
  });

  const makeFormula = (
    slots: Partial<
      Record<
        "producto1Id" | "producto2Id" | "producto3Id" | "producto4Id",
        string | null | undefined
      >
    >,
  ): FormulaDto =>
    ({
      id: "f1",
      producto1Id: "s1",
      producto1Nombre: "Sustrato 1",
      porcentaje1: 50,
      producto2Id: null,
      producto2Nombre: null,
      porcentaje2: null,
      producto3Id: null,
      producto3Nombre: null,
      porcentaje3: null,
      producto4Id: null,
      producto4Nombre: null,
      porcentaje4: null,
      isActive: true,
      createdAt: new Date("2024-03-14"),
      ...slots,
    }) as FormulaDto;

  it("marks slot ids absent from productos (deleted producto never returned)", () => {
    const formulas = [
      makeFormula({ producto1Id: "absent-1", producto2Id: "absent-2" }),
    ];
    const productos = [makeProducto("present", true)];

    const result = computeInactiveProductoIds(formulas, productos);

    expect(result.has("absent-1")).toBe(true);
    expect(result.has("absent-2")).toBe(true);
    expect(result.has("present")).toBe(false);
  });

  it("marks ids of productos with isActive false", () => {
    const result = computeInactiveProductoIds(
      [makeFormula({ producto1Id: "inactive-1" })],
      [makeProducto("inactive-1", false)],
    );

    expect(result.has("inactive-1")).toBe(true);
  });

  it("does not mark ids of productos with isActive true", () => {
    const result = computeInactiveProductoIds(
      [makeFormula({ producto1Id: "active-1" })],
      [makeProducto("active-1", true)],
    );

    expect(result.size).toBe(0);
    expect(result.has("active-1")).toBe(false);
  });

  it("skips null and undefined slot ids without throwing", () => {
    const formula = makeFormula({
      producto1Id: null,
      producto2Id: undefined,
      producto3Id: null,
      producto4Id: undefined,
    });

    let result: Set<string> | undefined;
    expect(() => {
      result = computeInactiveProductoIds([formula], []);
    }).not.toThrow();
    expect(result).toBeDefined();
    expect(result!.size).toBe(0);
  });
});
