// src/features/entities/components/entity-data-table.tsx
"use client";

import { useState } from "react";
import { useCreateEntity, useEntities } from "../hooks/useEntities";
import { CreateEntityDto, CreateEntitySchema } from "@vivero/shared";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DataTable, SlideOverForm } from "@/components/data-display/data-table";
import { entityColumns } from "./columns";
import { EntityCreateForm } from "./entity-create-form";

export function EntityDataTable() {
  const { data: entities = [] } = useEntities();

  const [slideOverOpen, setSlideOverOpen] = useState(false);

  const { mutateAsync: createEntity, isPending: isCreatingEntity } =
    useCreateEntity();

  const formCreateEntity = useForm<CreateEntityDto>({
    resolver: zodResolver(CreateEntitySchema),
    defaultValues: {
      name: "",
      label: "",
      permissionType: "READ_ONLY",
    },
  });

  const handleNewEntity = () => {
    setSlideOverOpen(true);
  };

  const handleCreate = async (formData: CreateEntityDto) => {
    try {
      await createEntity(formData);
    } catch {}

    if (!isCreatingEntity) setSlideOverOpen(false);
  };

  return (
    <>
      <DataTable
        columns={entityColumns}
        data={entities}
        title="Entidades"
        description="Gestión de las entidades del sistema"
        tableName="entities"
        totalCount={entities.length}
        onCreate={handleNewEntity}
        createLabel="Nueva Entidad"
      />
      {slideOverOpen && (
        <SlideOverForm
          formId="create"
          open={slideOverOpen}
          onOpenChange={setSlideOverOpen}
          title="Crear nueva entidad"
          description="Rellena los campos para crear una nueva entidad."
          onCancel={() => setSlideOverOpen(false)}
          saveLabel="Crear Entidad"
          form={formCreateEntity}
        >
          <div className="space-y-2">
            <EntityCreateForm
              form={formCreateEntity}
              onSubmit={handleCreate}
              onCancel={() => setSlideOverOpen(false)}
              formId="create"
            />
          </div>
        </SlideOverForm>
      )}
    </>
  );
}
