// apps/frontend/src/features/mezclas/components/mezcla-data-table.tsx
"use client";

import { useState, useCallback, useMemo } from "react";
import { useCreateMezcla, useMezclas } from "../hooks/useMezclas";
import { useSustratos } from "@/features/sustratos/hooks/useSustratos";
import { CreateMezclaDto, CreateMezclaSchema, MezclaDto } from "@vivero/shared";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DataTable, SlideOverForm } from "@/components/data-display/data-table";
import { mezclaColumns, mezclaExportColumns } from "./columns";
import { MezclaCreateForm } from "./mezcla-create-form";
import { MezclaViewForm } from "./mezcla-view-form";

export function MezclaDataTable() {
  const { data: mezclas = [] } = useMezclas();
  const { data: sustratos = [] } = useSustratos();
  const [slideOverOpen, setSlideOverOpen] = useState(false);
  const [selectedMezcla, setSelectedMezcla] = useState<MezclaDto | null>(null);
  const [mode, setMode] = useState<"view" | "create">("create");

  const { mutateAsync: createMezcla, isPending: isCreatingMezcla } =
    useCreateMezcla();

  const formCreateMezcla = useForm<CreateMezclaDto>({
    resolver: zodResolver(CreateMezclaSchema),
    defaultValues: {
      sustrato1Id: "",
      porcentaje1: 0,
      sustrato2Id: null,
      porcentaje2: null,
      sustrato3Id: null,
      porcentaje3: null,
      sustrato4Id: null,
      porcentaje4: null,
    },
  });

  const watchedValues = formCreateMezcla.watch();
  const totalPorcentaje = useMemo(() => {
    return (
      (watchedValues.porcentaje1 ?? 0) +
      (watchedValues.porcentaje2 ?? 0) +
      (watchedValues.porcentaje3 ?? 0) +
      (watchedValues.porcentaje4 ?? 0)
    );
  }, [watchedValues]);

  const handleNewMezcla = useCallback(() => {
    setSelectedMezcla(null);
    setMode("create");
    formCreateMezcla.reset();
    setSlideOverOpen(true);
  }, [formCreateMezcla]);

  const handleView = useCallback((row: MezclaDto) => {
    setSelectedMezcla(row);
    setMode("view");
    setSlideOverOpen(true);
  }, []);

  const handleCreate = async (formData: CreateMezclaDto) => {
    try {
      await createMezcla(formData);
    } catch {}

    if (!isCreatingMezcla) setSlideOverOpen(false);
  };

  return (
    <>
      <DataTable
        columns={mezclaColumns}
        exportColumns={mezclaExportColumns}
        data={mezclas}
        title="Mezclas"
        description="Gestión de mezclas del sistema"
        tableName="siembra"
        totalCount={mezclas.length}
        onCreate={handleNewMezcla}
        createLabel="Nueva Mezcla"
        onView={handleView}
      />
      {slideOverOpen && (
        <SlideOverForm
          formId={mode === "create" ? "create" : "view"}
          open={slideOverOpen}
          onOpenChange={setSlideOverOpen}
          title={
            mode === "create"
              ? "Crear mezcla"
              : `Mezcla: ${selectedMezcla?.sustrato1Nombre}`
          }
          description={
            mode === "create"
              ? "Rellena los campos para crear una nueva mezcla."
              : undefined
          }
          onCancel={() => setSlideOverOpen(false)}
          saveLabel="Crear Mezcla"
          form={mode === "create" ? formCreateMezcla : undefined}
          mode={mode === "create" ? "create" : "view"}
          confirm={
            mode === "create"
              ? {
                  title: "Crear mezcla",
                  description: "¿Deseas crear esta nueva mezcla?",
                  label: "Crear",
                }
              : undefined
          }
        >
          <div className="space-y-2">
            {mode === "create" ? (
              <MezclaCreateForm
                form={formCreateMezcla}
                onSubmit={handleCreate}
                onCancel={() => setSlideOverOpen(false)}
                formId="create"
                sustratos={sustratos}
                totalPorcentaje={totalPorcentaje}
              />
            ) : selectedMezcla ? (
              <MezclaViewForm selectedMezcla={selectedMezcla} />
            ) : null}
          </div>
        </SlideOverForm>
      )}
    </>
  );
}
