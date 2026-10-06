// __tests__/autorizar-programacionSiembra-edit-form.test.tsx
import { render, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { AutorizarSiembraDto, ProgramacionSiembraDto } from "@vivero/shared";
import { AutorizarProgramacionSiembraEditForm } from "../autorizar-programacionSiembra-edit-form";

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

jest.mock("@/features/formulas", () => ({
  useFormulas: () => ({
    data: [
      {
        id: "clx1234567890abcdef123467",
        isActive: true,
        producto1Nombre: "Turba",
        porcentaje1: 60,
        producto2Nombre: "Perlita",
        porcentaje2: 40,
        producto3Nombre: null,
        porcentaje3: null,
        producto4Nombre: null,
        porcentaje4: null,
      },
    ],
  }),
}));

const selectedSiembra = {
  partidaId: 1,
  anio: 2024,
  indice: 1,
  codigoEspecie: "ESP001",
  nombreEspecie: "Especie Test",
  fechaSugeridaSiembra: "2024-03-15",
  propiedad: "Propiedad A",
  lote: "L001",
  anoLote: "2024",
  nrocont: "10",
  tipocont: "CJ",
  cantTipoCont: 200,
  sem_siembra: "S10-2024",
} as unknown as ProgramacionSiembraDto;

function Wrapper({
  defaultValues,
}: {
  defaultValues: Partial<AutorizarSiembraDto>;
}) {
  const form = useForm<AutorizarSiembraDto>({
    defaultValues: {
      partidaId: 1,
      anio: 2024,
      indice: 1,
      ...defaultValues,
    },
  });
  return (
    <AutorizarProgramacionSiembraEditForm
      form={form}
      onSubmit={async () => {}}
      onCancel={() => {}}
      selectedSiembra={selectedSiembra}
    />
  );
}

describe("AutorizarProgramacionSiembraEditForm formula breakdown", () => {
  it("renders product breakdown when formulaId is selected", () => {
    render(<Wrapper defaultValues={{ formulaId: "clx1234567890abcdef123467" }} />);

    const turbaRow = screen.getByText("Turba (60%)").closest("div");
    expect(turbaRow).toHaveTextContent("1200");

    const perlitaRow = screen.getByText("Perlita (40%)").closest("div");
    expect(perlitaRow).toHaveTextContent("800");

    const totalRow = screen.getByText("Total Productos (L)").closest("div");
    expect(totalRow).toHaveTextContent("2000");
  });

  it("renders no breakdown when no formula is selected", () => {
    render(<Wrapper defaultValues={{}} />);

    expect(screen.queryByText("Total Productos (L)")).not.toBeInTheDocument();
    expect(screen.queryByText("Turba (60%)")).not.toBeInTheDocument();
  });

  it("renders no breakdown for an unknown formulaId", () => {
    render(<Wrapper defaultValues={{ formulaId: "clx1234567890abcdef123499" }} />);

    expect(screen.queryByText("Total Productos (L)")).not.toBeInTheDocument();
    expect(screen.queryByText("Turba (60%)")).not.toBeInTheDocument();
  });
});
