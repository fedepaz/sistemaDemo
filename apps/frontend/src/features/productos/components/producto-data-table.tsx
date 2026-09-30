// apps/frontend/src/features/productos/components/producto-data-table.tsx
"use client";

import { useState, useCallback } from "react";
import { useCreateProducto, useProductos } from "../hooks/useProductos";
import {
  CreateProductoDto,
  CreateProductoSchema,
  ProductoDto,
  fieldLabels,
} from "@vivero/shared";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DataTable, SlideOverForm } from "@/components/data-display/data-table";
import { productoColumns, productoExportColumns } from "./columns";
import { ProductoCreateForm } from "./producto-create-form";
import { ProductoViewForm } from "./producto-view-form";

export function ProductoDataTable() {
  const { data: productos = [] } = useProductos();
  const [slideOverOpen, setSlideOverOpen] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState<ProductoDto | null>(
    null,
  );
  const [mode, setMode] = useState<"view" | "create">("create");

  const { mutateAsync: createProducto, isPending: isCreatingProducto } =
    useCreateProducto();

  const formCreateProducto = useForm<CreateProductoDto>({
    resolver: zodResolver(CreateProductoSchema),
    defaultValues: {
      nombre: "",
    },
  });

  const handleNewProducto = useCallback(() => {
    setSelectedProducto(null);
    setMode("create");
    formCreateProducto.reset({ nombre: "" });
    setSlideOverOpen(true);
  }, [formCreateProducto]);

  const handleView = useCallback((row: ProductoDto) => {
    setSelectedProducto(row);
    setMode("view");
    setSlideOverOpen(true);
  }, []);

  const handleCreate = async (formData: CreateProductoDto) => {
    try {
      await createProducto(formData);
    } catch {}

    if (!isCreatingProducto) setSlideOverOpen(false);
  };

  return (
    <>
      <DataTable
        columns={productoColumns}
        exportColumns={productoExportColumns}
        data={productos}
        title="Productos"
        description="Gestión de productos del sistema"
        tableName="productos"
        totalCount={productos.length}
        onCreate={handleNewProducto}
        createLabel="Nuevo Producto"
        onView={handleView}
        columnLabels={fieldLabels.Producto}
      />
      {slideOverOpen && (
        <SlideOverForm
          formId={mode === "create" ? "create" : "view"}
          open={slideOverOpen}
          onOpenChange={setSlideOverOpen}
          title={
            mode === "create"
              ? "Crear producto"
              : `Producto: ${selectedProducto?.nombre}`
          }
          description={
            mode === "create"
              ? "Rellena los campos para crear un nuevo producto."
              : undefined
          }
          onCancel={() => setSlideOverOpen(false)}
          saveLabel="Crear Producto"
          form={mode === "create" ? formCreateProducto : undefined}
          mode={mode === "create" ? "create" : "view"}
          fieldLabels={fieldLabels.CreateProducto}
          confirm={
            mode === "create"
              ? {
                  title: "Crear producto",
                  description: "¿Deseas crear este nuevo producto?",
                  label: "Crear",
                  summaryFields: ["partidaId", "anio", "indice"],
                }
              : undefined
          }
        >
          <div className="flex flex-col gap-3">
            {mode === "create" ? (
              <ProductoCreateForm
                form={formCreateProducto}
                onSubmit={handleCreate}
                onCancel={() => setSlideOverOpen(false)}
                formId="create"
              />
            ) : selectedProducto ? (
              <ProductoViewForm selectedProducto={selectedProducto} />
            ) : null}
          </div>
        </SlideOverForm>
      )}
    </>
  );
}
