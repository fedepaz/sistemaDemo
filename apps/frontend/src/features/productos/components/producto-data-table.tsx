// apps/frontend/src/features/productos/components/producto-data-table.tsx
"use client";

import { useState, useCallback } from "react";
import {
  useCreateProducto,
  useDeleteProducto,
  useProductos,
  useUpdateProducto,
} from "../hooks/useProductos";
import {
  CreateProductoDto,
  CreateProductoSchema,
  ProductoDto,
  UpdateProductoDto,
  UpdateProductoSchema,
  fieldLabels,
} from "@vivero/shared";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DataTable, SlideOverForm } from "@/components/data-display/data-table";
import { productoColumns, productoExportColumns } from "./columns";
import { ProductoCreateForm } from "./producto-create-form";
import { ProductoEditForm } from "./producto-edit-form";
import { ProductoViewForm } from "./producto-view-form";

export function ProductoDataTable() {
  const { data: productos = [] } = useProductos();
  const [slideOverOpen, setSlideOverOpen] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState<ProductoDto | null>(
    null,
  );
  const [mode, setMode] = useState<"view" | "create" | "edit">("create");

  const { mutateAsync: createProducto, isPending: isCreatingProducto } =
    useCreateProducto();
  const { mutateAsync: updateProducto, isPending: isUpdatingProducto } =
    useUpdateProducto();
  const { mutateAsync: deleteProducto } = useDeleteProducto();

  const formCreateProducto = useForm<CreateProductoDto>({
    resolver: zodResolver(CreateProductoSchema),
    defaultValues: {
      nombre: "",
    },
  });

  const formEditProducto = useForm<UpdateProductoDto>({
    resolver: zodResolver(UpdateProductoSchema),
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

  const handleEdit = useCallback(
    (row: ProductoDto) => {
      setSelectedProducto(row);
      setMode("edit");
      formEditProducto.reset({ nombre: row.nombre });
      setSlideOverOpen(true);
    },
    [formEditProducto],
  );

  const handleDelete = useCallback(
    async (row: ProductoDto) => {
      await deleteProducto(row.id);
    },
    [deleteProducto],
  );

  const handleCreate = async (formData: CreateProductoDto) => {
    try {
      await createProducto(formData);
    } catch {}

    if (!isCreatingProducto) setSlideOverOpen(false);
  };

  const handleUpdate = async (formData: UpdateProductoDto) => {
    if (selectedProducto) {
      try {
        await updateProducto({ id: selectedProducto.id, data: formData });
      } catch {}

      if (!isUpdatingProducto) setSlideOverOpen(false);
    }
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
        onEdit={handleEdit}
        onDelete={handleDelete}
        columnLabels={fieldLabels.Producto}
      />
      {slideOverOpen && (
        <SlideOverForm
          formId={
            mode === "create" ? "create" : mode === "edit" ? "edit" : "view"
          }
          open={slideOverOpen}
          onOpenChange={setSlideOverOpen}
          title={
            mode === "create"
              ? "Crear producto"
              : mode === "edit"
                ? `Editar producto: ${selectedProducto?.nombre}`
                : `Producto: ${selectedProducto?.nombre}`
          }
          description={
            mode === "create"
              ? "Rellena los campos para crear un nuevo producto."
              : mode === "edit"
                ? `Edita el nombre del producto ${selectedProducto?.nombre}.`
                : undefined
          }
          onCancel={() => setSlideOverOpen(false)}
          saveLabel={
            mode === "edit" ? "Actualizar Producto" : "Crear Producto"
          }
          form={
            mode === "create"
              ? formCreateProducto
              : mode === "edit"
                ? formEditProducto
                : undefined
          }
          mode={mode}
          fieldLabels={fieldLabels.CreateProducto}
          confirm={
            mode === "create"
              ? {
                  title: "Crear producto",
                  description: "¿Deseas crear este nuevo producto?",
                  label: "Crear",
                  summaryFields: ["nombre"],
                }
              : mode === "edit"
                ? {
                    title: "Actualizar producto",
                    description: `¿Deseas guardar los cambios en ${selectedProducto?.nombre}?`,
                    label: "Actualizar",
                    summaryFields: ["nombre"],
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
            ) : mode === "edit" ? (
              <ProductoEditForm
                form={formEditProducto}
                onSubmit={handleUpdate}
                onCancel={() => setSlideOverOpen(false)}
                formId="edit"
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
