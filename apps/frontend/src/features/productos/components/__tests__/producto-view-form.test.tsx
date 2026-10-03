// apps/frontend/src/features/productos/components/__tests__/producto-view-form.test.tsx
import { render, screen } from "@testing-library/react";
import { ProductoViewForm } from "../producto-view-form";
import type { ProductoDto } from "@vivero/shared";

describe("ProductoViewForm", () => {
  const mockProducto: ProductoDto = {
    id: "1",
    nombre: "Producto Test",
    isActive: true,
    createdAt: "2024-03-15T00:00:00.000Z",
  };

  it("should display producto nombre in header", () => {
    render(<ProductoViewForm selectedProducto={mockProducto} />);
    const headers = screen.getAllByText("Producto Test");
    expect(headers.length).toBeGreaterThanOrEqual(1);
  });

  it("should display formatted creation date", () => {
    render(<ProductoViewForm selectedProducto={mockProducto} />);
    expect(screen.getByText(/de marzo de 2024/i)).toBeInTheDocument();
  });

  it("should not display any status badge when active", () => {
    render(<ProductoViewForm selectedProducto={mockProducto} />);
    expect(screen.queryByText("Activo")).toBeNull();
    expect(screen.queryByText("Inactivo")).toBeNull();
  });

  it("should display Inactivo badge when inactive", () => {
    render(
      <ProductoViewForm
        selectedProducto={{ ...mockProducto, isActive: false }}
      />,
    );
    expect(screen.getByText("Inactivo")).toBeInTheDocument();
    expect(screen.queryByText("Activo")).toBeNull();
  });
});
