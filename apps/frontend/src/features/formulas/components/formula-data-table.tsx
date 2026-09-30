// apps/frontend/src/features/formulas/components/formula-data-table.tsx
"use client";

import { useState, useCallback, useMemo } from "react";
import { useCreateFormula, useFormulas } from "../hooks/useFormulas";
import { useProductos } from "@/features/productos/hooks/useProductos";
import {
  CreateFormulaDto,
  CreateFormulaSchema,
  FormulaDto,
  fieldLabels,
} from "@vivero/shared";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DataTable, SlideOverForm } from "@/components/data-display/data-table";
import { formulaColumns, formulaExportColumns } from "./columns";
import { FormulaCreateForm } from "./formula-create-form";
import { FormulaViewForm } from "./formula-view-form";

export function FormulaDataTable() {
  const { data: formulas = [] } = useFormulas();
  const { data: productos = [] } = useProductos();
  const [slideOverOpen, setSlideOverOpen] = useState(false);
  const [selectedFormula, setSelectedFormula] = useState<FormulaDto | null>(null);
  const [mode, setMode] = useState<"view" | "create">("create");

  const { mutateAsync: createFormula, isPending: isCreatingFormula } =
    useCreateFormula();

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
        columns={formulaColumns}
        exportColumns={formulaExportColumns}
        data={formulas}
        title="Fórmulas"
        description="Gestión de fórmulas del sistema"
        tableName="programacion_siembra"
        totalCount={formulas.length}
        onCreate={handleNewFormula}
        createLabel="Nueva Fórmula"
        onView={handleView}
        columnLabels={fieldLabels.Formula}
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
