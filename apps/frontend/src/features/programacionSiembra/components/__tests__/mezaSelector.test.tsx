import { render, screen } from "@testing-library/react";

jest.mock("@/features/mezclas", () => ({
  useMezclas: () => ({
    data: [
      {
        id: "m1",
        sustrato1Id: "s1",
        sustrato1Nombre: "Turba",
        porcentaje1: 60,
        sustrato2Id: "s2",
        sustrato2Nombre: "Perlita",
        porcentaje2: 40,
        sustrato3Id: null,
        sustrato3Nombre: null,
        porcentaje3: null,
        sustrato4Id: null,
        sustrato4Nombre: null,
        porcentaje4: null,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "m2",
        sustrato1Id: "s3",
        sustrato1Nombre: "Coco",
        porcentaje1: 100,
        sustrato2Id: null,
        sustrato2Nombre: null,
        porcentaje2: null,
        sustrato3Id: null,
        sustrato3Nombre: null,
        porcentaje3: null,
        sustrato4Id: null,
        sustrato4Nombre: null,
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

import { MezclaSelector } from "../mezclaSelector";

const mockForm = {
  control: {},
  watch: jest.fn().mockReturnValue(""),
  setValue: jest.fn(),
} as never;

describe("MezclaSelector", () => {
  it("renders the Mezcla label", () => {
    render(<MezclaSelector form={mockForm} />);
    expect(screen.getByText("Mezcla")).toBeInTheDocument();
  });

  it("renders placeholder text", () => {
    render(<MezclaSelector form={mockForm} />);
    expect(screen.getByText("Seleccione mezcla")).toBeInTheDocument();
  });

  it("only renders active mezclas", () => {
    render(<MezclaSelector form={mockForm} />);
    expect(screen.getByText("Turba / Perlita")).toBeInTheDocument();
    expect(screen.queryByText("Coco")).not.toBeInTheDocument();
  });
});
