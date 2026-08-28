// apps/frontend/src/features/sustratos/components/__tests__/sustrato-data-table.test.tsx
import { render, screen, act } from "@testing-library/react";

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});
import { SustratoDataTable } from "../sustrato-data-table";
import type { SustratoDto } from "@vivero/shared";

jest.mock("@/components/data-display/data-table", () => ({
  DataTable: ({
    title,
    onView,
  }: {
    title: string;
    onView: (row: SustratoDto) => void;
    onCreate: () => void;
  }) => (
    <div data-testid="data-table">
      <h1>{title}</h1>
      <button onClick={() => onView(mockSustratos[0])}>View Row</button>
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

jest.mock("@/features/sustratos/hooks/useSustratos", () => ({
  useSustratos: () => ({
    data: mockSustratos,
  }),
  useCreateSustrato: () => ({
    mutateAsync: jest.fn().mockResolvedValue(undefined),
    isPending: false,
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

const mockSustratos: SustratoDto[] = [
  {
    id: "1",
    nombre: "Sustrato Test",
    createdAt: "2024-03-15T00:00:00.000Z",
  },
];

describe("SustratoDataTable", () => {
  it("renders DataTable with correct title", () => {
    render(<SustratoDataTable />);

    expect(screen.getByTestId("data-table")).toBeInTheDocument();
    expect(screen.getByText("Sustratos")).toBeInTheDocument();
  });

  it("opens slide-over in view mode when view is triggered", () => {
    render(<SustratoDataTable />);

    act(() => {
      screen.getByText("View Row").click();
    });

    expect(screen.getByTestId("slide-over-form")).toBeInTheDocument();
  });
});
