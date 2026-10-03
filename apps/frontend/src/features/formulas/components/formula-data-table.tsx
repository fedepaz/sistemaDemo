// apps/frontend/src/features/formulas/components/formula-data-table.tsx
"use client";

import { useState, useCallback, useMemo } from "react";
import {
  useCreateFormula,
  useDeleteFormula,
  useFormulas,
} from "../hooks/useFormulas";
import { useProductos } from "@/features/productos/hooks/useProductos";
import {
  CreateFormulaDto,
  CreateFormulaSchema,
  FormulaDto,
  ProductoDto,
  fieldLabels,
} from "@vivero/shared";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DataTable, SlideOverForm } from "@/components/data-display/data-table";
import { createFormulaColumns, formulaExportColumns } from "./columns";
import { FormulaCreateForm } from "./formula-create-form";
import { FormulaViewForm } from "./formula-view-form";

export function computeInactiveProductoIds(
  formulas: FormulaDto[],
  productos: ProductoDto[],
): Set<string> {
  const byId = new Map(productos.map((p) => [p.id, p] as const));
  const ids = new Set<string>();
  for (const f of formulas) {
    for (const n of [1, 2, 3, 4] as const) {
      const id = f[`producto${n}Id`];
      if (!id) continue;
      const producto = byId.get(id);
      if (!producto || !producto.isActive) ids.add(id);
    }
  }
  return ids;
}

export function FormulaDataTable() {
  const { data: formulas = [] } = useFormulas();
  const { data: productos = [] } = useProductos();
  const [slideOverOpen, setSlideOverOpen] = useState(false);
  const [selectedFormula, setSelectedFormula] = useState<FormulaDto | null>(null);
  const [mode, setMode] = useState<"view" | "create">("create");

  const { mutateAsync: createFormula, isPending: isCreatingFormula } =
    useCreateFormula();

  const { mutateAsync: deleteFormula } = useDeleteFormula();

  const handleDelete = useCallback(async (row: FormulaDto) => {
    await deleteFormula(row.id);
  }, [deleteFormula]);

  const formCreateFormula = useForm<CreateFormulaDto>({
    resolver: zodResolver(CreateFormulaSchema),
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

  const watchedValues = useWatch({ control: formCreateFormula.control });
  const totalPorcentaje = useMemo(() => {
    return (
      (watchedValues.porcentaje1 ?? 0) +
      (watchedValues.porcentaje2 ?? 0) +
      (watchedValues.porcentaje3 ?? 0) +
      (watchedValues.porcentaje4 ?? 0)
    );
  }, [watchedValues]);

  const inactiveProductoIds = useMemo(
    () => computeInactiveProductoIds(formulas, productos),
    [formulas, productos],
  );

  const columns = useMemo(
    () => createFormulaColumns(inactiveProductoIds),
    [inactiveProductoIds],
  );

  const handleNewFormula = useCallback(() => {
    setSelectedFormula(null);
    setMode("create");
    formCreateFormula.reset();
    setSlideOverOpen(true);
  }, [formCreateFormula]);

  const handleView = useCallback((row: FormulaDto) => {
    setSelectedFormula(row);
    setMode("view");
    setSlideOverOpen(true);
  }, []);

  const handleCreate = async (formData: CreateFormulaDto) => {
    try {
      await createFormula(formData);
    } catch {}

    if (!isCreatingFormula) setSlideOverOpen(false);
  };

  return (
    <>
      <DataTable
        columns={columns}
        exportColumns={formulaExportColumns}
        data={formulas}
        title="Fórmulas"
        description="Gestión de fórmulas del sistema"
        tableName="formulas"
        totalCount={formulas.length}
        onCreate={handleNewFormula}
        createLabel="Nueva Fórmula"
        onView={handleView}
        onDelete={handleDelete}
        columnLabels={fieldLabels.Formula}
        getRowClassName={(row) =>
          !row.isActive ? "opacity-60 text-muted-foreground" : ""
        }
      />
      {slideOverOpen && (
        <SlideOverForm
          formId={mode === "create" ? "create" : "view"}
          open={slideOverOpen}
          onOpenChange={setSlideOverOpen}
          title={
            mode === "create"
              ? "Crear fórmula"
              : `Fórmula: ${selectedFormula?.producto1Nombre}`
          }
          description={
            mode === "create"
              ? "Rellena los campos para crear una nueva fórmula."
              : undefined
          }
          onCancel={() => setSlideOverOpen(false)}
          saveLabel="Crear Fórmula"
          form={mode === "create" ? formCreateFormula : undefined}
          mode={mode === "create" ? "create" : "view"}
          fieldLabels={fieldLabels.CreateFormula}
          confirm={
            mode === "create"
              ? {
                  title: "Crear fórmula",
                  description: "¿Deseas crear esta nueva fórmula?",
                  label: "Crear",
                  summaryFields: [
                    "producto1Id",
                    "porcentaje1",
                    "producto2Id",
                    "porcentaje2",
                    "producto3Id",
                    "porcentaje3",
                    "producto4Id",
                    "porcentaje4",
                  ],
                }
              : undefined
          }
        >
          <div className="flex flex-col gap-3">
            {mode === "create" ? (
              <FormulaCreateForm
                form={formCreateFormula}
                onSubmit={handleCreate}
                onCancel={() => setSlideOverOpen(false)}
                formId="create"
                productos={productos}
                totalPorcentaje={totalPorcentaje}
              />
            ) : selectedFormula ? (
              <FormulaViewForm selectedFormula={selectedFormula} />
            ) : null}
          </div>
        </SlideOverForm>
      )}
    </>
  );
}
