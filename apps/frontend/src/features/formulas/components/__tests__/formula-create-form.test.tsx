/* eslint-disable @typescript-eslint/no-explicit-any */
// apps/frontend/src/features/formulas/components/__tests__/formula-create-form.test.tsx
import { render, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { FormulaCreateForm } from "../formula-create-form";
import type { CreateFormulaDto, ProductoDto } from "@vivero/shared";

const mockCapturedSelectItems: Array<{
  value?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}> = [];

jest.mock("@/components/ui/select", () => ({
  Select: ({ children }: any) => <div>{children}</div>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: (props: any) => {
    mockCapturedSelectItems.push(props);
    return null;
  },
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: () => null,
}));

jest.mock("@/components/ui/form", () => ({
  Form: ({ children }: any) => <div>{children}</div>,
  FormField: ({ render: renderProp }: any) =>
    renderProp({
      field: { value: "", onChange: jest.fn(), onBlur: jest.fn(), ref: jest.fn() },
    }),
  FormItem: ({ children }: any) => <div>{children}</div>,
  FormLabel: ({ children }: any) => <label>{children}</label>,
  FormControl: ({ children }: any) => <div>{children}</div>,
  FormMessage: () => null,
  FormDescription: ({ children }: any) => <p>{children}</p>,
}));

const activeProducto: ProductoDto = {
  id: "s1",
  nombre: "Turba",
  isActive: true,
  createdAt: new Date("2024-01-01"),
};
const inactiveProducto: ProductoDto = {
  id: "s2",
  nombre: "Perlita",
  isActive: false,
  createdAt: new Date("2024-01-01"),
};

function Harness() {
  const form = useForm<CreateFormulaDto>({
    defaultValues: {
      producto1Id: "",
      porcentaje1: 0,
      producto2Id: null,
      porcentaje2: null,
      producto3Id: null,
      porcentaje3: null,
      producto4Id: null,
      porcentaje4: null,
    },
  });
  return (
    <FormulaCreateForm
      form={form}
      onSubmit={jest.fn()}
      onCancel={jest.fn()}
      formId="create"
      productos={[activeProducto, inactiveProducto]}
      totalPorcentaje={100}
    />
  );
}

describe("FormulaCreateForm producto options", () => {
  beforeEach(() => {
    mockCapturedSelectItems.length = 0;
  });

  it("disables the inactive producto option and labels it Eliminado", () => {
    render(<Harness />);
    const inactive = mockCapturedSelectItems.find((i) => i.value === "s2");
    expect(inactive).toBeDefined();
    expect(inactive!.disabled).toBe(true);
    const text = render(<>{inactive!.children}</>);
    expect(text.getByText("Eliminado")).toBeInTheDocument();
  });

  it("keeps the active producto option enabled", () => {
    render(<Harness />);
    const active = mockCapturedSelectItems.find((i) => i.value === "s1");
    expect(active).toBeDefined();
    expect(active!.disabled).toBeFalsy();
    const text = render(<>{active!.children}</>);
    expect(screen.queryByText("Eliminado")).toBeNull();
    expect(text.getByText("Turba")).toBeInTheDocument();
  });
});
