import { render, screen } from "@testing-library/react";
import { SiembraPartidasRegistradasViewForm } from "../siembra-partidas-registradas-view-form";
import type { SiembraPartidaDto } from "@vivero/shared";

const mockPartida: SiembraPartidaDto = {
  id: "test-id-1",
  partidaId: 456,
  anio: 2025,
  indice: 2,
  codigoEspecie: "ABCOM",
  nombreEspecie: "PLA.ALBAHACA COMPACTA M009",
  metodoMaquina: true,
  presionSemilla: 45,
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
};

describe("SiembraPartidasRegistradasViewForm", () => {
  it("renders header with partida number", () => {
    render(<SiembraPartidasRegistradasViewForm selectedPartida={mockPartida} />);

    expect(screen.getByText("Partida #456")).toBeInTheDocument();
  });

  it("renders mezcla nombre in header", () => {
    render(<SiembraPartidasRegistradasViewForm selectedPartida={mockPartida} />);

    const matches = screen.getAllByText("Tierra (70%) + Perlita (30%)");
    expect(matches.length).toBe(1);
  });

  it("displays specs grid with year, index, and especie", () => {
    render(<SiembraPartidasRegistradasViewForm selectedPartida={mockPartida} />);

    expect(screen.getByText("2025")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("PLA.ALBAHACA COMPACTA M009")).toBeInTheDocument();
  });

  it("displays siembra tab content by default", () => {
    render(<SiembraPartidasRegistradasViewForm selectedPartida={mockPartida} />);

    expect(screen.getByText("Profundidad")).toBeInTheDocument();
    expect(screen.getByText("1.5 cm")).toBeInTheDocument();
    expect(screen.getByText("Tratamiento")).toBeInTheDocument();
    expect(screen.getByText("Tratamiento Test")).toBeInTheDocument();
    expect(screen.getByText("Cámara Germinación")).toBeInTheDocument();
  });

  it("displays formatted date for fSiembra", () => {
    render(<SiembraPartidasRegistradasViewForm selectedPartida={mockPartida} />);

    expect(screen.getByText("01/09/25")).toBeInTheDocument();
  });

  it("displays fallback for missing values", () => {
    const partidaWithMissingValues = {
      ...mockPartida,
      cg: undefined,
      cantidaNroCont: undefined,
      entityNombre: undefined,
      empleados: [],
    };

    render(<SiembraPartidasRegistradasViewForm selectedPartida={partidaWithMissingValues} />);

    const dashes = screen.getAllByText("-");
    expect(dashes.length).toBeGreaterThan(0);
  });

  it("renders tab triggers for Siembra, Lote, and Turno", () => {
    render(<SiembraPartidasRegistradasViewForm selectedPartida={mockPartida} />);

    expect(screen.getByRole("tab", { name: /siembra/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /lote/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /turno/i })).toBeInTheDocument();
  });
});
