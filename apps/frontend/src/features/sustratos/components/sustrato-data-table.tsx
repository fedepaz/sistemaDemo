// apps/frontend/src/features/sustratos/components/sustrato-data-table.tsx
"use client";

import { useState, useCallback } from "react";
import { useCreateSustrato, useSustratos } from "../hooks/useSustratos";
import { CreateSustratoDto, CreateSustratoSchema, SustratoDto } from "@vivero/shared";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DataTable, SlideOverForm } from "@/components/data-display/data-table";
import { sustratoColumns } from "./columns";
import { SustratoCreateForm } from "./sustrato-create-form";
import { SustratoViewForm } from "./sustrato-view-form";

export function SustratoDataTable() {
  const { data: sustratos = [] } = useSustratos();
  const [slideOverOpen, setSlideOverOpen] = useState(false);
  const [selectedSustrato, setSelectedSustrato] = useState<SustratoDto | null>(null);
  const [mode, setMode] = useState<"view" | "create">("create");

  const { mutateAsync: createSustrato, isPending: isCreatingSustrato } =
    useCreateSustrato();

  const formCreateSustrato = useForm<CreateSustratoDto>({
    resolver: zodResolver(CreateSustratoSchema),
    defaultValues: {
      nombre: "",
    },
  });

  const handleNewSustrato = useCallback(() => {
    setSelectedSustrato(null);
    setMode("create");
    formCreateSustrato.reset({ nombre: "" });
    setSlideOverOpen(true);
  }, [formCreateSustrato]);

  const handleView = useCallback((row: SustratoDto) => {
    setSelectedSustrato(row);
    setMode("view");
    setSlideOverOpen(true);
  }, []);

  const handleCreate = async (formData: CreateSustratoDto) => {
    try {
      await createSustrato(formData);
    } catch {}

    if (!isCreatingSustrato) setSlideOverOpen(false);
  };

  return (
    <>
      <DataTable
        columns={sustratoColumns}
        data={sustratos}
        title="Sustratos"
        description="Gestión de sustratos del sistema"
        tableName="sustratos"
        totalCount={sustratos.length}
        onCreate={handleNewSustrato}
        createLabel="Nuevo Sustrato"
        onView={handleView}
      />
      {slideOverOpen && (
        <SlideOverForm
          formId={mode === "create" ? "create" : "view"}
          open={slideOverOpen}
          onOpenChange={setSlideOverOpen}
          title={mode === "create" ? "Crear sustrato" : `Sustrato: ${selectedSustrato?.nombre}`}
          description={mode === "create" ? "Rellena los campos para crear un nuevo sustrato." : undefined}
          onCancel={() => setSlideOverOpen(false)}
          saveLabel="Crear Sustrato"
          form={mode === "create" ? formCreateSustrato : undefined}
          mode={mode === "create" ? "create" : "view"}
          confirm={mode === "create" ? {
            title: "Crear sustrato",
            description: "¿Deseas crear este nuevo sustrato?",
            label: "Crear",
          } : undefined}
        >
          <div className="space-y-2">
            {mode === "create" ? (
              <SustratoCreateForm
                form={formCreateSustrato}
                onSubmit={handleCreate}
                onCancel={() => setSlideOverOpen(false)}
                formId="create"
              />
            ) : selectedSustrato ? (
              <SustratoViewForm selectedSustrato={selectedSustrato} />
            ) : null}
          </div>
        </SlideOverForm>
      )}
    </>
  );
}
