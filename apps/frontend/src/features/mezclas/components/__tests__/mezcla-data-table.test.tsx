// apps/frontend/src/features/mezclas/components/__tests__/mezcla-data-table.test.tsx
import { render, screen, act } from "@testing-library/react";

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});
import { MezclaDataTable } from "../mezcla-data-table";
import type { MezclaDto } from "@vivero/shared";

jest.mock("@/components/data-display/data-table", () => ({
  DataTable: ({
    title,
    onView,
  }: {
    title: string;
    onView: (row: MezclaDto) => void;
    onCreate: () => void;
  }) => (
    <div data-testid="data-table">
      <h1>{title}</h1>
      <button onClick={() => onView(mockMezclas[0])}>View Row</button>
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

jest.mock("@/features/mezclas/hooks/useMezclas", () => ({
  useMezclas: () => ({
    data: mockMezclas,
  }),
  useCreateMezcla: () => ({
    mutateAsync: jest.fn().mockResolvedValue(undefined),
    isPending: false,
  }),
}));

jest.mock("@/features/sustratos/hooks/useSustratos", () => ({
  useSustratos: () => ({
    data: [{ id: "s1", nombre: "Turba", createdAt: new Date() }],
  }),
}));

const mockMezclas: MezclaDto[] = [
  {
    id: "1",
    sustrato1Id: "s1",
    sustrato1Nombre: "Turba",
    porcentaje1: 60,
    sustrato2Id: "s2",
    sustrato2Nombre: "Perlita",
    porcentaje2: 40,
    sustrato3Id: null,
    sustrato3Nombre: null,
    porcentaje3: null,
    sustrato4Id: null,
    sustrato4Nombre: null,
    porcentaje4: null,
    isActive: true,
    createdAt: new Date("2024-03-14"),
  },
];

describe("MezclaDataTable", () => {
  it("renders DataTable with correct title", () => {
    render(<MezclaDataTable />);
    expect(screen.getByTestId("data-table")).toBeInTheDocument();
    expect(screen.getByText("Mezclas")).toBeInTheDocument();
  });

  it("opens slide-over in view mode when view is triggered", () => {
    render(<MezclaDataTable />);
    act(() => {
      screen.getByText("View Row").click();
    });
    expect(screen.getByTestId("slide-over-form")).toBeInTheDocument();
  });
});
