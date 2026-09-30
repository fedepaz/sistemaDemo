import { render, screen } from "@testing-library/react";

jest.mock("@/features/formulas", () => ({
  useFormulas: () => ({
    data: [
      {
        id: "m1",
        producto1Id: "s1",
        producto1Nombre: "Turba",
        porcentaje1: 60,
        producto2Id: "s2",
        producto2Nombre: "Perlita",
        porcentaje2: 40,
        producto3Id: null,
        producto3Nombre: null,
        porcentaje3: null,
        producto4Id: null,
        producto4Nombre: null,
        porcentaje4: null,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "m2",
        producto1Id: "s3",
        producto1Nombre: "Coco",
        porcentaje1: 100,
        producto2Id: null,
        producto2Nombre: null,
        porcentaje2: null,
        producto3Id: null,
        producto3Nombre: null,
        porcentaje3: null,
        producto4Id: null,
        producto4Nombre: null,
        porcentaje4: null,
        isActive: false,
        createdAt: new Date(),
      },
    ],
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
}));

jest.mock("@/components/ui/select", () => ({
  Select: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SelectItem: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SelectValue: ({ placeholder }: { placeholder?: string }) => (
    <span>{placeholder}</span>
  ),
}));

import { FormulaSelector } from "../formulaSelector";

const mockForm = {
  control: {},
  watch: jest.fn().mockReturnValue(""),
  setValue: jest.fn(),
} as never;

describe("FormulaSelector", () => {
  it("renders the Fórmula label", () => {
    render(<FormulaSelector form={mockForm} />);
    expect(screen.getByText("Fórmula")).toBeInTheDocument();
  });

  it("renders placeholder text", () => {
    render(<FormulaSelector form={mockForm} />);
    expect(screen.getByText("Seleccione fórmula")).toBeInTheDocument();
  });

  it("only renders active fórmulas", () => {
    render(<FormulaSelector form={mockForm} />);
    expect(screen.getByText("Turba / Perlita")).toBeInTheDocument();
    expect(screen.queryByText("Coco")).not.toBeInTheDocument();
  });
});
