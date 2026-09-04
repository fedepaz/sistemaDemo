import { render, screen } from "@testing-library/react";
import { SiembraViewForm } from "../siembra-view-form";
import type { SiembraDto } from "@vivero/shared";

const mockSiembra: SiembraDto = {
  partidaId: 123,
  anio: 2024,
  indice: 1,
  codigoEspecie: "ESP001",
  nombreEspecie: "Especie Test",
  propiedad: "Propiedad A",
  injerto: "N",
  nrocont: "100",
  sem_siembra: "S1-2024",
  fechaSugeridaSiembra: "2024-03-15",
  fechaSiembraReal: "2024-03-16",
  lote: "L001",
  anoLote: "2024",
  semxgr: "2",
  c: "3",
  g: "4",
};

describe("SiembraViewForm", () => {
  it("renders header with species code and name", () => {
    render(<SiembraViewForm selectedExtendido={mockSiembra} />);

    expect(screen.getByText("ESP001")).toBeInTheDocument();
    expect(screen.getByText("Especie Test")).toBeInTheDocument();
  });

  it("displays data content by default", () => {
    render(<SiembraViewForm selectedExtendido={mockSiembra} />);

    expect(screen.getByText("Fecha Sugerida")).toBeInTheDocument();
    expect(screen.getByText("Sem/Gr")).toBeInTheDocument();
    expect(screen.getByText("C")).toBeInTheDocument();
    expect(screen.getByText("G")).toBeInTheDocument();
  });

  it("displays property in data content", () => {
    render(<SiembraViewForm selectedExtendido={mockSiembra} />);

    expect(screen.getByText("Propiedad A")).toBeInTheDocument();
  });

  it("displays semxgr, c, and g values", () => {
    render(<SiembraViewForm selectedExtendido={mockSiembra} />);

    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("displays lote", () => {
    render(<SiembraViewForm selectedExtendido={mockSiembra} />);

    expect(screen.getByText("L001")).toBeInTheDocument();
  });
});
