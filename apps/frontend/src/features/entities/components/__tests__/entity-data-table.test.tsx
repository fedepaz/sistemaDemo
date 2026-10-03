/* eslint-disable @typescript-eslint/no-explicit-any */
// apps/frontend/src/features/entities/components/__tests__/entity-data-table.test.tsx
import { render, screen, act, fireEvent } from "@testing-library/react";

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});
import { EntityDataTable } from "../entity-data-table";
import type { Entity } from "@vivero/shared";

const mockUpdateEntity = jest.fn().mockResolvedValue(undefined);
const mockDeleteEntity = jest.fn().mockResolvedValue(undefined);
let capturedProps: any = null;

const mockEntities: Entity[] = [
  {
    id: "1",
    name: "products",
    label: "Productos",
    isActive: true,
    permissionType: "CRUD",
  },
];

jest.mock("@/components/data-display/data-table", () => ({
  DataTable: (props: any) => {
    const { title, onCreate, onView, onEdit, onDelete } = props;
    return (
      <div data-testid="data-table">
        <h1>{title}</h1>
        <button onClick={onCreate}>Create Entity</button>
        <button onClick={() => onView(mockEntities[0])}>View Row</button>
        <button onClick={() => onEdit(mockEntities[0])}>Edit Row</button>
        <button onClick={() => onDelete(mockEntities[0])}>Delete Row</button>
      </div>
    );
  },
  SlideOverForm: (props: any) => {
    capturedProps = props;
    return props.open ? (
      <div data-testid="slide-over-form">{props.children}</div>
    ) : null;
  },
}));

jest.mock("../../hooks/useEntities", () => ({
  useEntities: () => ({
    data: mockEntities,
  }),
  useCreateEntity: () => ({
    mutateAsync: jest.fn().mockResolvedValue(undefined),
    isPending: false,
  }),
  useUpdateEntity: () => ({
    mutateAsync: mockUpdateEntity,
    isPending: false,
  }),
  useDeleteEntity: () => ({
    mutateAsync: mockDeleteEntity,
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

describe("EntityDataTable", () => {
  beforeEach(() => {
    capturedProps = null;
  });

  it("renders DataTable with correct title", () => {
    render(<EntityDataTable />);

    expect(screen.getByTestId("data-table")).toBeInTheDocument();
    expect(screen.getByText("Entidades")).toBeInTheDocument();
  });

  it("passes create summaryFields to SlideOverForm", () => {
    render(<EntityDataTable />);

    act(() => {
      screen.getByText("Create Entity").click();
    });

    expect(capturedProps).not.toBeNull();
    expect(capturedProps.formId).toBe("create");
    expect(capturedProps.confirm.summaryFields).toEqual([
      "name",
      "label",
      "permissionType",
    ]);
  });

  it("opens slide-over in view mode when view is triggered", () => {
    render(<EntityDataTable />);

    act(() => {
      screen.getByText("View Row").click();
    });

    expect(capturedProps).not.toBeNull();
    expect(capturedProps.mode).toBe("view");
    expect(capturedProps.formId).toBe("view");
    expect(screen.getByTestId("slide-over-form")).toBeInTheDocument();
  });

  it("deletes entity by id when delete is triggered", async () => {
    mockDeleteEntity.mockClear();
    render(<EntityDataTable />);

    await act(async () => {
      screen.getByText("Delete Row").click();
    });

    expect(mockDeleteEntity).toHaveBeenCalledWith("1");
  });

  it("opens slide-over in edit mode with label summaryFields", async () => {
    render(<EntityDataTable />);

    await act(async () => {
      screen.getByText("Edit Row").click();
    });

    expect(capturedProps).not.toBeNull();
    expect(capturedProps.formId).toBe("edit");
    expect(capturedProps.confirm.summaryFields).toEqual([
      "label",
      "permissionType",
    ]);
  });

  it("updates entity when edit form is submitted", async () => {
    mockUpdateEntity.mockClear();
    render(<EntityDataTable />);

    await act(async () => {
      screen.getByText("Edit Row").click();
    });

    const editForm = document.getElementById("edit");
    expect(editForm).not.toBeNull();

    await act(async () => {
      fireEvent.submit(editForm as HTMLFormElement);
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(mockUpdateEntity).toHaveBeenCalledWith({
      id: "1",
      data: { label: "Productos", permissionType: "CRUD" },
    });
  });
});
