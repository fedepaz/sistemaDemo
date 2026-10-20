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
    deletedAt: null,
    deletedByUserId: null,
    deletedByUsername: null,
  };

  const deletedProducto: ProductoDto = {
    ...mockProducto,
    isActive: false,
    deletedAt: new Date("2026-10-01T12:00:00.000Z"),
    deletedByUserId: "u1",
    deletedByUsername: "admin",
  };

  it("should show deletion date and deleter when deleted", () => {
    render(<ProductoViewForm selectedProducto={deletedProducto} />);
    expect(screen.getByText(/de octubre de 2026/)).toBeInTheDocument();
    expect(screen.getByText(/por admin/)).toBeInTheDocument();
  });

  it("should omit the deleter clause when username is null", () => {
    render(
      <ProductoViewForm
        selectedProducto={{ ...deletedProducto, deletedByUsername: null }}
      />,
    );
    expect(screen.getByText(/de octubre de 2026/)).toBeInTheDocument();
    expect(screen.queryByText(/por admin/)).toBeNull();
  });

  it("should not show a deletion line for active records", () => {
    render(<ProductoViewForm selectedProducto={mockProducto} />);
    expect(screen.queryByText(/Eliminado/)).toBeNull();
  });

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
