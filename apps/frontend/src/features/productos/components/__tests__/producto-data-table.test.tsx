/* eslint-disable @typescript-eslint/no-explicit-any */
// apps/frontend/src/features/productos/components/__tests__/producto-data-table.test.tsx
import { render, screen, act } from "@testing-library/react";

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});
import { ProductoDataTable } from "../producto-data-table";
import type { ProductoDto } from "@vivero/shared";

const mockUpdateProducto = jest.fn().mockResolvedValue(undefined);
const mockDeleteProducto = jest.fn().mockResolvedValue(undefined);
let capturedProps: any = null;

jest.mock("@/components/data-display/data-table", () => ({
  DataTable: ({
    title,
    onView,
    onEdit,
    onDelete,
  }: {
    title: string;
    onView: (row: ProductoDto) => void;
    onEdit: (row: ProductoDto) => void;
    onDelete: (row: ProductoDto) => void;
    onCreate: () => void;
  }) => (
    <div data-testid="data-table">
      <h1>{title}</h1>
      <button onClick={() => onView(mockProductos[0])}>View Row</button>
      <button onClick={() => onEdit(mockProductos[0])}>Edit Row</button>
      <button onClick={() => onDelete(mockProductos[0])}>Delete Row</button>
    </div>
  ),
  SlideOverForm: (props: any) => {
    capturedProps = props;
    return props.open ? (
      <div data-testid="slide-over-form">{props.children}</div>
    ) : null;
  },
}));

jest.mock("@/features/productos/hooks/useProductos", () => ({
  useProductos: () => ({
    data: mockProductos,
  }),
  useCreateProducto: () => ({
    mutateAsync: jest.fn().mockResolvedValue(undefined),
    isPending: false,
  }),
  useUpdateProducto: () => ({
    mutateAsync: mockUpdateProducto,
    isPending: false,
  }),
  useDeleteProducto: () => ({
    mutateAsync: mockDeleteProducto,
  }),
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
  FormMessage: () => null,
  FormDescription: ({ children }: { children: React.ReactNode }) => (
    <p>{children}</p>
  ),
}));

const mockProductos: ProductoDto[] = [
  {
    id: "1",
    nombre: "Producto Test",
    createdAt: "2024-03-15T00:00:00.000Z",
  },
];

describe("ProductoDataTable", () => {
  beforeEach(() => {
    capturedProps = null;
  });

  it("renders DataTable with correct title", () => {
    render(<ProductoDataTable />);

    expect(screen.getByTestId("data-table")).toBeInTheDocument();
    expect(screen.getByText("Productos")).toBeInTheDocument();
  });

  it("opens slide-over in view mode when view is triggered", () => {
    render(<ProductoDataTable />);

    act(() => {
      screen.getByText("View Row").click();
    });

    expect(screen.getByTestId("slide-over-form")).toBeInTheDocument();
  });

  it("deletes producto when delete is triggered", async () => {
    mockDeleteProducto.mockClear();
    render(<ProductoDataTable />);

    await act(async () => {
      screen.getByText("Delete Row").click();
    });

    expect(mockDeleteProducto).toHaveBeenCalledWith("1");
  });

  it("opens slide-over in edit mode with nombre summaryFields", async () => {
    render(<ProductoDataTable />);

    await act(async () => {
      screen.getByText("Edit Row").click();
    });

    expect(capturedProps).not.toBeNull();
    expect(capturedProps.formId).toBe("edit");
    expect(capturedProps.confirm.summaryFields).toEqual(["nombre"]);
  });
});
