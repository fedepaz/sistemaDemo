import { render, screen, act } from "@testing-library/react";

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

jest.mock("@/features/permissions", () => ({
  useTableByName: () => ({ data: { permissionType: "CRUD", id: "cperm001entitysiembrat" } }),
}));

const mockReset = jest.fn();
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
    reset: mockReset,
    setValue: jest.fn(),
    getValues: jest.fn().mockReturnValue({}),
    watch: jest.fn(),
  }),
  useWatch: jest.fn().mockReturnValue(true),
}));

import { SiembraDataTable } from "../siembra-data-table";
import type { SiembraDto } from "@vivero/shared";

jest.mock("@/components/data-display/data-table", () => ({
  DataTable: ({
    title,
    onView,
    onEdit,
  }: {
    title: string;
    onView: (row: SiembraDto) => void;
    onEdit: (row: SiembraDto) => void;
  }) => (
    <div data-testid="data-table">
      <h1>{title}</h1>
      <button onClick={() => onView(mockPartidas[0])}>View Row</button>
      <button onClick={() => onEdit(mockPartidas[0])}>Edit Row</button>
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

jest.mock("@/features/siembra/hooks/useSiembraPartidaMutation", () => ({
  useSiembraMutation: () => ({
    mutateAsync: jest.fn().mockResolvedValue(undefined),
  }),
}));

jest.mock("@/features/extendidos", () => ({
  useDepositos: () => ({
    data: [
      { codigo: 1, nombre: "Cámara 1", camara: "CAM01" },
      { codigo: 2, nombre: "Cámara 2", camara: "CAM02" },
    ],
  }),
}));

jest.mock("@/features/taskshift/components/employee-search", () => ({
  EmployeeSearch: ({ onSelect }: { onSelect: (users: { id: string; nombre: string }[]) => void }) => (
    <button onClick={() => onSelect([{ id: "u1", nombre: "Test User" }])}>Search Employee</button>
  ),
}));

jest.mock("@/components/ui/tooltip", () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  TooltipContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

jest.mock("@/components/ui/form", () => ({
  Form: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  FormField: ({
    render: renderProp,
  }: {
    render: (props: { field: Record<string, unknown> }) => React.ReactNode;
  }) =>
    renderProp({
      field: {
        value: "",
        onChange: jest.fn(),
        onBlur: jest.fn(),
        ref: jest.fn(),
      },
    }),
  FormItem: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  FormLabel: ({ children }: { children: React.ReactNode }) => (
    <label>{children}</label>
  ),
  FormControl: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  FormDescription: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  FormMessage: () => null,
}));

const mockPartidas: SiembraDto[] = [
  {
    partidaId: 1,
    anio: 2024,
    indice: 1,
    hai: "H",
    codigoEspecie: "ESP001",
    nombreEspecie: "Especie Test",
    injerto: "N",
    contenedor: "Bandeja 288",
    fechaSugeridaSiembra: "2024-03-15",
    propiedad: "Propiedad A",
    solicito: "Juan",
    nrocont: "100",
    extendido: "Notas de prueba",
    germin: "85",
  },
];

describe("SiembraDataTable", () => {
  it("renders DataTable with correct title", () => {
    render(<SiembraDataTable partidas={mockPartidas} />);

    expect(screen.getByTestId("data-table")).toBeInTheDocument();
    expect(screen.getByText("Siembra")).toBeInTheDocument();
  });

  it("renders without crashing with empty data", () => {
    render(<SiembraDataTable partidas={[]} />);

    expect(screen.getByTestId("data-table")).toBeInTheDocument();
  });

  it("opens slide-over in view mode when view is triggered", () => {
    render(<SiembraDataTable partidas={mockPartidas} />);

    act(() => {
      screen.getByText("View Row").click();
    });

    expect(screen.getByTestId("slide-over-form")).toBeInTheDocument();
  });

  it("opens slide-over in edit mode when edit is triggered", () => {
    render(<SiembraDataTable partidas={mockPartidas} />);

    act(() => {
      screen.getByText("Edit Row").click();
    });

    expect(screen.getByTestId("slide-over-form")).toBeInTheDocument();
  });
});
