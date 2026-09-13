/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, act, fireEvent } from "@testing-library/react";
import type { ExtendidoDto } from "@vivero/shared";

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

jest.mock("../../hooks/useDepositos", () => ({
  useCamaras: () => ({
    data: [
      { codigo: 1, nombre: "Cámara 1" },
    ],
  }),
}));

jest.mock("../../hooks/usePartidaMutation", () => ({
  usePartidaMutation: () => ({
    mutateAsync: jest.fn().mockResolvedValue(undefined),
    isPending: false,
  }),
}));

jest.mock("../extendido-view-form", () => ({
  ExtendidosViewForm: () => <div data-testid="extendido-view-form" />,
}));

jest.mock("../extendido-edit-form", () => ({
  ExtendidosEditForm: ({ onSubmit, onCancel }: any) => (
    <div data-testid="extendido-edit-form">
      <button onClick={() => onSubmit({})}>Submit</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

jest.mock("@/components/ui/select", () => ({
  Select: ({ children }: any) => <div>{children}</div>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children }: any) => <div>{children}</div>,
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: () => null,
}));

jest.mock("@/components/ui/tooltip", () => ({
  Tooltip: ({ children }: any) => <div>{children}</div>,
  TooltipTrigger: ({ children }: any) => <div>{children}</div>,
  TooltipContent: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}));

jest.mock("lucide-react", () => ({
  Building2: () => null,
  RotateCcw: () => null,
  CalendarDays: () => null,
}));

jest.mock("react-hook-form", () => ({
  ...jest.requireActual("react-hook-form"),
  useForm: () => ({
    control: {
      _getWatch: jest.fn().mockReturnValue(true),
      _formValues: {},
      _subjects: { watch: { next: jest.fn() } },
    },
    handleSubmit: (fn: (data: Record<string, unknown>) => void) => (e: Event) => {
      e.preventDefault();
      fn({});
    },
    formState: { isValid: true, isSubmitting: false },
    reset: jest.fn(),
    setValue: jest.fn(),
    getValues: jest.fn().mockReturnValue({}),
    watch: jest.fn(),
    register: jest.fn().mockReturnValue({ name: "", ref: jest.fn(), onChange: jest.fn(), onBlur: jest.fn() }),
  }),
}));

jest.mock("@/lib/date-utils", () => ({
  getLocalDateStr: (d: Date) => d.toISOString().split("T")[0],
}));

let capturedProps: any = null;

jest.mock("@/components/data-display/data-table", () => ({
  DataTable: ({ title, onEdit }: any) => (
    <div data-testid="data-table">
      <h1>{title}</h1>
      <button onClick={() => onEdit(mockPartidas[0])}>Edit Row</button>
    </div>
  ),
  SlideOverForm: (props: any) => {
    capturedProps = props;
    return props.open ? <div data-testid="slide-over">{props.children}</div> : null;
  },
}));

import { ExtendidoDataTable } from "../extendido-data-table";

const mockPartidas: ExtendidoDto[] = [
  {
    partidaId: 1,
    anio: 2024,
    indice: 1,
    codigoEspecie: "ESP001",
    nombreEspecie: "Especie Test",
    hai: "H",
    nrocont: "50",
    injerto: "N",
    codigoCamaraGerminacion: 7,
    fechaSugeridaSiembra: "2024-03-15",
    fechaSiembraReal: "2024-03-15",
    diasEnCamara: 30,
    fechaEgresoCamara: "2024-04-14",
    extendido: "Sin observaciones",
    codigoUbicacion: null,
    nombreUbicacion: null,
    stockInicial: 100,
    detalle: null,
    baja: null,
  },
];

describe("ExtendidoDataTable", () => {
  beforeEach(() => {
    capturedProps = null;
  });

  it("renders DataTable with correct title", () => {
    render(<ExtendidoDataTable partidas={mockPartidas} />);
    expect(screen.getByTestId("data-table")).toBeInTheDocument();
    expect(screen.getByText("Partidas a Extender")).toBeInTheDocument();
  });

  it("passes correct summaryFields to SlideOverForm", () => {
    render(<ExtendidoDataTable partidas={mockPartidas} />);

    act(() => {
      fireEvent.click(screen.getByText("Edit Row"));
    });

    expect(capturedProps).not.toBeNull();
    expect(capturedProps.confirm.summaryFields).toEqual([
      "ubicacion",
      "baja",
      "extendido",
    ]);
  });
});
