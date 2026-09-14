/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, act, fireEvent } from "@testing-library/react";
import type { SiembraPartidaDto } from "@vivero/shared";

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

jest.mock("@/features/permissions", () => ({
  useTableByName: () => ({ data: { permissionType: "CRUD", id: "cperm001asembrart" } }),
}));

jest.mock("../../hooks/useASembrarMutation", () => ({
  useASembrarMutation: () => ({
    mutateAsync: jest.fn().mockResolvedValue(undefined),
  }),
}));

jest.mock("@/features/aSembrar/components/a-sembrar-edit-form", () => ({
  ASembrarEditForm: ({ onSubmit, onCancel }: any) => (
    <div data-testid="a-sembrar-edit-form">
      <button onClick={() => onSubmit({})}>Submit</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
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

let capturedProps: any = null;

jest.mock("@/components/data-display/data-table", () => ({
  DataTable: ({ title, onEdit }: any) => (
    <div data-testid="data-table">
      <h1>{title}</h1>
      <button onClick={() => onEdit?.(mockPartidas[0])}>Edit Row</button>
    </div>
  ),
  SlideOverForm: (props: any) => {
    capturedProps = props;
    return props.open ? <div data-testid="slide-over">{props.children}</div> : null;
  },
}));

import { ASembrarDataTable } from "../a-sembrar-data-table";

const mockPartidas: SiembraPartidaDto[] = [
  {
    id: "1",
    partidaId: 1,
    anio: 2024,
    indice: 1,
    cg: "5",
    cantidaNroCont: "100",
    prensadoSemilla: "Si",
    profundidadSemilla: "3cm",
    tratamientoSemilla: "Tratamiento A",
    metodoMaquina: "Manual",
    detalleExtendido: "Detalle test",
    lote: 1,
    anoLote: 2024,
    item: 1,
    semxgr: 10,
    createdAt: "2024-03-15T10:00:00Z",
  } as SiembraPartidaDto,
];

describe("ASembrarDataTable", () => {
  beforeEach(() => {
    capturedProps = null;
  });

  it("renders DataTable with correct title", () => {
    render(<ASembrarDataTable partidas={mockPartidas} />);
    expect(screen.getByTestId("data-table")).toBeInTheDocument();
    expect(screen.getByText("A Sembrar")).toBeInTheDocument();
  });

  it("passes correct summaryFields to SlideOverForm", () => {
    render(<ASembrarDataTable partidas={mockPartidas} />);

    act(() => {
      fireEvent.click(screen.getByText("Edit Row"));
    });

    expect(capturedProps).not.toBeNull();
    expect(capturedProps.confirm.summaryFields).toEqual([
      "cg",
      "cantidaNroCont",
      "prensadoSemilla",
      "profundidadSemilla",
      "tratamientoSemilla",
      "metodoMaquina",
      "detalleExtendido",
    ]);
  });
});
