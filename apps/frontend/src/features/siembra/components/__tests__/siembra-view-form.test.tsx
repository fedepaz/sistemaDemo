import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SiembraViewForm } from "../siembra-view-form";
import type { SiembraDto } from "@vivero/shared";

const mockSiembra: SiembraDto = {
  partidaId: 123,
  anio: 2024,
  indice: 1,
  hai: "H",
  codigoEspecie: "ESP001",
  nombreEspecie: "Especie Test",
  injerto: "N",
  fechaSugeridaSiembra: "2024-03-15",
  fechaSiembraReal: "2024-03-16",
  propiedad: "Propiedad A",
  solicito: "Juan",
  lote: "L001",
  anoLote: "2024",
  ajuste: "Ninguno",
  nrocont: "100",
  extendido: "Sin observaciones",
  germin: "85",
};

describe("SiembraViewForm", () => {
  it("renders header with species code and name", () => {
    render(<SiembraViewForm selectedExtendido={mockSiembra} />);

    expect(screen.getByText("ESP001")).toBeInTheDocument();
    expect(screen.getByText("Especie Test")).toBeInTheDocument();
  });

  it("renders tab navigation (Datos and Notas)", () => {
    render(<SiembraViewForm selectedExtendido={mockSiembra} />);

    expect(screen.getByRole("tab", { name: /datos/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /notas/i })).toBeInTheDocument();
  });

  it("displays Datos tab content by default", () => {
    render(<SiembraViewForm selectedExtendido={mockSiembra} />);

    expect(screen.getByText("Semilla")).toBeInTheDocument();
    expect(screen.getByText("Solicitadas")).toBeInTheDocument();
    expect(screen.getByText("Fecha Sugerida")).toBeInTheDocument();
    expect(screen.getByText("Germinación")).toBeInTheDocument();
  });

  it("displays property and requester in Datos tab", () => {
    render(<SiembraViewForm selectedExtendido={mockSiembra} />);

    expect(screen.getByText("Propiedad A")).toBeInTheDocument();
    expect(screen.getByText("Juan")).toBeInTheDocument();
  });

  it("displays germination value in Datos tab", () => {
    render(<SiembraViewForm selectedExtendido={mockSiembra} />);

    expect(screen.getByText("85")).toBeInTheDocument();
  });

  it("displays extendido notes when switching to Notas tab", async () => {
    const user = userEvent.setup();
    render(<SiembraViewForm selectedExtendido={mockSiembra} />);

    const notasTab = screen.getByRole("tab", { name: /notas/i });
    await user.click(notasTab);

    await waitFor(() => {
      expect(screen.getByText("Sin observaciones")).toBeInTheDocument();
    });
  });

  it("displays placeholder when extendido is empty", async () => {
    const user = userEvent.setup();
    const siembraWithoutNotes = { ...mockSiembra, extendido: "" };
    render(<SiembraViewForm selectedExtendido={siembraWithoutNotes} />);

    const notasTab = screen.getByRole("tab", { name: /notas/i });
    await user.click(notasTab);

    await waitFor(() => {
      expect(screen.getByText("Sin observaciones.")).toBeInTheDocument();
    });
  });
});
