import { render, screen, act } from "@testing-library/react";
import { SiembraPartidasRegistradasDataTable } from "../siembra-partidas-registradas-data-table";
import type { SiembraPartidaDto } from "@vivero/shared";

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const mockPartidas: SiembraPartidaDto[] = [
  {
    id: "test-id-1",
    partidaId: 456,
    anio: 2025,
    indice: 2,
    metodoMaquina: true,
    prensadoSemilla: 45,
    profundidadSemilla: "1.5",
    tratamientoSemilla: "T",
    mezclaId: "mezcla-1",
    userId: "user-1",
    mezclaNombre: "Tierra (70%) + Perlita (30%)",
    usuarioNombre: "juan.perez",
    cg: 3,
    fSiembra: "2025-09-01",
    lote: 15,
    anoLote: 2025,
    item: 1,
    semxgr: 2.5,
    ajuste: "N",
    cantidadGrs: 500,
    cantidaNroCont: 10,
    detalleExtendido: "Siembra estándar",
    tratamientoNombre: "Tratamiento Test",
    entityId: "entity-1",
    entityNombre: "Cosecha",
    startTime: "2025-09-01T08:00:00.000Z",
    endTime: "2025-09-01T16:00:00.000Z",
    empleados: [
      { userId: "emp-1", username: "maria.garcia" },
      { userId: "emp-2", username: "carlos.lopez" },
    ],
  },
];

jest.mock("@/components/data-display/data-table", () => ({
  DataTable: ({
    title,
    onView,
  }: {
    title: string;
    onView: (row: SiembraPartidaDto) => void;
  }) => (
    <div data-testid="data-table">
      <h1>{title}</h1>
      <button onClick={() => onView(mockPartidas[0])}>View Row</button>
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

describe("SiembraPartidasRegistradasDataTable", () => {
  it("renders DataTable with correct title", () => {
    render(<SiembraPartidasRegistradasDataTable partidas={mockPartidas} />);

    expect(screen.getByTestId("data-table")).toBeInTheDocument();
    expect(screen.getByText("Partidas Registradas")).toBeInTheDocument();
  });

  it("renders without crashing with empty data", () => {
    render(<SiembraPartidasRegistradasDataTable partidas={[]} />);

    expect(screen.getByTestId("data-table")).toBeInTheDocument();
  });

  it("opens slide-over in view mode when view is triggered", () => {
    render(<SiembraPartidasRegistradasDataTable partidas={mockPartidas} />);

    act(() => {
      screen.getByText("View Row").click();
    });

    expect(screen.getByTestId("slide-over-form")).toBeInTheDocument();
  });

  it("displays view form content when slide-over is open", () => {
    render(<SiembraPartidasRegistradasDataTable partidas={mockPartidas} />);

    act(() => {
      screen.getByText("View Row").click();
    });

    expect(screen.getByText("Partida #456")).toBeInTheDocument();
    expect(screen.getAllByText("Tierra (70%) + Perlita (30%)").length).toBeGreaterThanOrEqual(1);
  });
});
