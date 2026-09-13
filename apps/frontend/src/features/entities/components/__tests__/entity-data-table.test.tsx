/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, act, fireEvent } from "@testing-library/react";

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

jest.mock("../../hooks/useEntities", () => ({
  useEntities: () => ({
    data: [
      { name: "users", label: "Usuarios", permissionType: "CRUD" },
    ],
  }),
  useCreateEntity: () => ({
    mutateAsync: jest.fn().mockResolvedValue(undefined),
    isPending: false,
  }),
  useDeleteEntity: () => ({
    mutateAsync: jest.fn().mockResolvedValue(undefined),
  }),
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

jest.mock("../entity-create-form", () => ({
  EntityCreateForm: ({ onSubmit, onCancel }: any) => (
    <div data-testid="entity-create-form">
      <button onClick={() => onSubmit({})}>Submit</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

let capturedProps: any = null;

jest.mock("@/components/data-display/data-table", () => ({
  DataTable: ({ title, onCreate }: any) => (
    <div data-testid="data-table">
      <h1>{title}</h1>
      <button onClick={onCreate}>Create Entity</button>
    </div>
  ),
  SlideOverForm: (props: any) => {
    capturedProps = props;
    return props.open ? <div data-testid="slide-over">{props.children}</div> : null;
  },
}));

import { EntityDataTable } from "../entity-data-table";

describe("EntityDataTable", () => {
  beforeEach(() => {
    capturedProps = null;
  });

  it("renders DataTable with correct title", () => {
    render(<EntityDataTable />);
    expect(screen.getByTestId("data-table")).toBeInTheDocument();
    expect(screen.getByText("Entidades")).toBeInTheDocument();
  });

  it("passes correct summaryFields to SlideOverForm", () => {
    render(<EntityDataTable />);

    act(() => {
      fireEvent.click(screen.getByText("Create Entity"));
    });

    expect(capturedProps).not.toBeNull();
    expect(capturedProps.confirm.summaryFields).toEqual([
      "name",
      "label",
      "permissionType",
    ]);
  });
});
