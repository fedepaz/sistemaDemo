/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, act, fireEvent } from "@testing-library/react";

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

jest.mock("../mezclaSelector", () => ({
  MezclaSelector: () => <div data-testid="mezcla-selector" />,
}));

jest.mock("../tratamientoSearch", () => ({
  TratamientoSearch: () => <div data-testid="tratamiento-search" />,
}));

let capturedProps: any = null;

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
    register: jest.fn().mockReturnValue({ name: "", ref: jest.fn(), onChange: jest.fn(), onBlur: jest.fn() }),
  }),
  useWatch: jest.fn().mockReturnValue(true),
}));

import { ProgramacionSiembraDataTable } from "../programacionSiembra-data-table";
import type { ProgramacionSiembraDto } from "@vivero/shared";

jest.mock("@/components/data-display/data-table", () => ({
  DataTable: ({
    title,
    onView,
    onEdit,
  }: {
    title: string;
    onView: (row: ProgramacionSiembraDto) => void;
    onEdit: (row: ProgramacionSiembraDto) => void;
  }) => (
    <div data-testid="data-table">
      <h1>{title}</h1>
      <button onClick={() => onView(mockPartidas[0])}>View Row</button>
      <button onClick={() => onEdit(mockPartidas[0])}>Edit Row</button>
    </div>
  ),
  SlideOverForm: (props: any) => {
    capturedProps = props;
    return props.open ? (
      <div data-testid="slide-over-form">{props.children}</div>
    ) : null;
  },
}));

jest.mock("../../hooks/useProgramacionSiembraPartidaMutation", () => ({
  useProgramacionSiembraAutorizacion: () => ({
    mutateAsync: jest.fn().mockResolvedValue(undefined),
  }),
  useProgramacionSiembraDesautorizacion: () => ({
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

const mockPartidas: ProgramacionSiembraDto[] = [
  {
    partidaId: 1,
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
    extendido: "Notas de prueba",
    germin: "85",
    sem_siembra: "S10-2024",
  },
];

const mockColumns = [
  { id: "partidaId", header: "Partida", accessorFn: (row: ProgramacionSiembraDto) => row.partidaId },
];

describe("ProgramacionSiembraDataTable", () => {
  beforeEach(() => {
    capturedProps = null;
  });

  it("renders DataTable with correct title", () => {
    render(
      <ProgramacionSiembraDataTable
        partidas={mockPartidas}
        columns={mockColumns}
        aSembrarKeys={new Set()}
        registradasKeys={new Set()}
      />,
    );

    expect(screen.getByTestId("data-table")).toBeInTheDocument();
    expect(screen.getByText("Programación de siembra")).toBeInTheDocument();
  });

  it("renders without crashing with empty data", () => {
    render(
      <ProgramacionSiembraDataTable
        partidas={[]}
        columns={mockColumns}
        aSembrarKeys={new Set()}
        registradasKeys={new Set()}
      />,
    );

    expect(screen.getByTestId("data-table")).toBeInTheDocument();
  });

  it("opens slide-over in view mode when view is triggered", () => {
    render(
      <ProgramacionSiembraDataTable
        partidas={mockPartidas}
        columns={mockColumns}
        aSembrarKeys={new Set()}
        registradasKeys={new Set()}
      />,
    );

    act(() => {
      screen.getByText("View Row").click();
    });

    expect(screen.getByTestId("slide-over-form")).toBeInTheDocument();
  });

  it("opens slide-over in edit mode when edit is triggered", () => {
    render(
      <ProgramacionSiembraDataTable
        partidas={mockPartidas}
        columns={mockColumns}
        aSembrarKeys={new Set()}
        registradasKeys={new Set()}
      />,
    );

    act(() => {
      screen.getByText("Edit Row").click();
    });

    expect(screen.getByTestId("slide-over-form")).toBeInTheDocument();
  });

  it("passes correct summaryFields to SlideOverForm", () => {
    render(
      <ProgramacionSiembraDataTable
        partidas={mockPartidas}
        columns={mockColumns}
        aSembrarKeys={new Set()}
        registradasKeys={new Set()}
      />,
    );

    act(() => {
      fireEvent.click(screen.getByText("Edit Row"));
    });

    expect(capturedProps).not.toBeNull();
    expect(capturedProps.confirm.summaryFields).toEqual([
      "partidaId",
      "anio",
      "indice",
    ]);
  });
});
