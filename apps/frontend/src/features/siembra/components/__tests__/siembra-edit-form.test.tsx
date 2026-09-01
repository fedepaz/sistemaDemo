jest.mock("react-hook-form", () => ({
  ...jest.requireActual("react-hook-form"),
  useWatch: jest.fn().mockReturnValue(true),
}));

import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

jest.mock("@/features/permissions", () => ({
  useTableByName: () => ({ data: { permissionType: "CRUD" } }),
}));
import userEvent from "@testing-library/user-event";
import { SiembraEditForm } from "../siembra-edit-form";
import type { SiembraDto } from "@vivero/shared";

const QueryWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

jest.mock("@/features/extendidos", () => ({
  useDepositos: () => ({
    data: [
      { codigo: 1, nombre: "Cámara 1", camara: "CAM01" },
      { codigo: 2, nombre: "Cámara 2", camara: "CAM02" },
    ],
  }),
}));

jest.mock("@/components/ui/tooltip", () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  TooltipContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip-content">{children}</div>
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

const mockSelectedSiembra: SiembraDto = {
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
  extendido: "Notas existentes",
  germin: "85",
};

const mockForm = {
  control: {
    _getWatch: jest.fn().mockReturnValue(true),
    _formValues: {},
    _subjects: {
      watch: { next: jest.fn() },
    },
  },
  handleSubmit: (fn: (data: Record<string, unknown>) => void) => (e: Event) => {
    e.preventDefault();
    fn({
      partidaId: 1,
      anio: 2024,
      indice: 1,
      cg: 1,
      cantidaNroCont: 100,
      germin: 85,
      detalle: "",
      metodoMaquina: true,
      presionSemilla: 40,
      profundidadSemilla: "1.525",
      tratamientoSemilla: false,
      mezclaId: "m1",
    });
  },
  formState: {
    isValid: true,
    isSubmitting: false,
  },
  setValue: jest.fn(),
  getValues: jest.fn().mockReturnValue({
    cantidaNroCont: 100,
  }),
} as never;

describe("SiembraEditForm", () => {
  const mockOnSubmit = jest.fn().mockResolvedValue(undefined);
  const mockOnCancel = jest.fn();

  const renderForm = (props = {}) =>
    render(
      <SiembraEditForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        form={mockForm}
        selectedSiembra={mockSelectedSiembra}
        {...props}
      />,
      { wrapper: QueryWrapper },
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders form with species header", () => {
    renderForm();

    expect(screen.getByText("ESP001")).toBeInTheDocument();
    expect(screen.getByText("Especie Test")).toBeInTheDocument();
  });

  it("renders camera select field", () => {
    renderForm();

    expect(screen.getByText("Cámara de Destino")).toBeInTheDocument();
  });

  it("renders method toggle with default Máquina label", () => {
    renderForm();

    expect(screen.getByText("Método")).toBeInTheDocument();
    expect(screen.getByText("Máquina")).toBeInTheDocument();
  });

  it("renders quantity field with default read-only value", () => {
    renderForm();

    expect(screen.getByText("Bandejas Confirmadas")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("renders observaciones textarea", () => {
    renderForm();

    expect(screen.getByText("Observaciones")).toBeInTheDocument();
  });

  it("toggles to edit mode when Edit button is clicked", async () => {
    const user = userEvent.setup();
    renderForm();

    const editButton = screen.getByText("Editar");
    await user.click(editButton);

    expect(screen.getByText("Cancelar")).toBeInTheDocument();
    expect(screen.getByRole("spinbutton")).toBeInTheDocument();
  });

  it("reverts to read-only when Cancel button is clicked", async () => {
    const user = userEvent.setup();
    renderForm();

    const editButton = screen.getByText("Editar");
    await user.click(editButton);

    const cancelButton = screen.getByText("Cancelar");
    await user.click(cancelButton);

    expect(screen.getByText("Editar")).toBeInTheDocument();
    expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();
  });

  it("calls form.setValue when canceling edit mode", async () => {
    const user = userEvent.setup();
    renderForm();

    const editButton = screen.getByText("Editar");
    await user.click(editButton);

    const cancelButton = screen.getByText("Cancelar");
    await user.click(cancelButton);

    expect(mockForm.setValue).toHaveBeenCalledWith("cantidaNroCont", 100);
  });

  it("displays method description badge", () => {
    renderForm();

    expect(
      screen.getByText(/Mecánica \(por defecto\)/),
    ).toBeInTheDocument();
  });

  it("renders all form sections", () => {
    renderForm();

    expect(screen.getByText("Cámara de Destino")).toBeInTheDocument();
    expect(screen.getByText("Método")).toBeInTheDocument();
    expect(screen.getByText("Bandejas Confirmadas")).toBeInTheDocument();
    expect(screen.getByText("Observaciones")).toBeInTheDocument();
  });
});
