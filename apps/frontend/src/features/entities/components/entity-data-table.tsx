// src/features/entities/components/entity-data-table.tsx
"use client";

import { useState, useCallback } from "react";
import {
  useCreateEntity,
  useDeleteEntity,
  useEntities,
  useUpdateEntity,
} from "../hooks/useEntities";
import {
  CreateEntityDto,
  CreateEntitySchema,
  Entity,
  UpdateEntityDto,
  UpdateEntitySchema,
  fieldLabels,
} from "@vivero/shared";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DataTable, SlideOverForm } from "@/components/data-display/data-table";
import { entityColumns } from "./columns";
import { EntityCreateForm } from "./entity-create-form";
import { EntityEditForm } from "./entity-edit-form";
import { EntityViewForm } from "./entity-view-form";

export function EntityDataTable() {
  const { data: entities = [] } = useEntities();

  const [slideOverOpen, setSlideOverOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [mode, setMode] = useState<"view" | "create" | "edit">("create");

  const { mutateAsync: createEntity, isPending: isCreatingEntity } =
    useCreateEntity();
  const { mutateAsync: updateEntity, isPending: isUpdatingEntity } =
    useUpdateEntity();
  const { mutateAsync: deleteEntity } = useDeleteEntity();

  const formCreateEntity = useForm<CreateEntityDto>({
    resolver: zodResolver(CreateEntitySchema),
    defaultValues: {
      name: "",
      label: "",
      permissionType: "READ_ONLY",
    },
  });

  const formEditEntity = useForm<UpdateEntityDto>({
    resolver: zodResolver(UpdateEntitySchema),
    defaultValues: {
      label: "",
      permissionType: "READ_ONLY",
    },
  });

  const handleNewEntity = useCallback(() => {
    setSelectedEntity(null);
    setMode("create");
    formCreateEntity.reset({
      name: "",
      label: "",
      permissionType: "READ_ONLY",
    });
    setSlideOverOpen(true);
  }, [formCreateEntity]);

  const handleView = useCallback((row: Entity) => {
    setSelectedEntity(row);
    setMode("view");
    setSlideOverOpen(true);
  }, []);

  const handleEdit = useCallback(
    (row: Entity) => {
      setSelectedEntity(row);
      setMode("edit");
      formEditEntity.reset({
        label: row.label,
        permissionType: row.permissionType,
      });
      setSlideOverOpen(true);
    },
    [formEditEntity],
  );

  const handleDelete = useCallback(
    async (row: Entity) => {
      await deleteEntity(row.id);
    },
    [deleteEntity],
  );

  const handleCreate = async (formData: CreateEntityDto) => {
    try {
      await createEntity(formData);
    } catch {}

    if (!isCreatingEntity) setSlideOverOpen(false);
  };

  const handleUpdate = async (formData: UpdateEntityDto) => {
    if (selectedEntity) {
      try {
        await updateEntity({ id: selectedEntity.id, data: formData });
      } catch {}

      if (!isUpdatingEntity) setSlideOverOpen(false);
    }
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
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        columnLabels={fieldLabels.Entity}
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
              ? "Crear nueva entidad"
              : mode === "edit"
                ? `Editar entidad: ${selectedEntity?.label}`
                : `Entidad: ${selectedEntity?.label}`
          }
          description={
            mode === "create"
              ? "Rellena los campos para crear una nueva entidad."
              : mode === "edit"
                ? `Edita la etiqueta o el tipo de permiso de ${selectedEntity?.label}.`
                : undefined
          }
          onCancel={() => setSlideOverOpen(false)}
          saveLabel={mode === "edit" ? "Actualizar Entidad" : "Crear Entidad"}
          form={
            mode === "create"
              ? formCreateEntity
              : mode === "edit"
                ? formEditEntity
                : undefined
          }
          mode={mode}
          fieldLabels={
            mode === "edit" ? fieldLabels.UpdateEntity : fieldLabels.CreateEntity
          }
          confirm={
            mode === "create"
              ? {
                  title: "Crear entidad",
                  description: "¿Deseas crear esta nueva entidad?",
                  label: "Crear",
                  summaryFields: ["name", "label", "permissionType"],
                }
              : mode === "edit"
                ? {
                    title: "Actualizar entidad",
                    description: `¿Deseas guardar los cambios en ${selectedEntity?.label}?`,
                    label: "Actualizar",
                    summaryFields: ["label", "permissionType"],
                  }
                : undefined
          }
        >
          <div className="flex flex-col gap-3">
            {mode === "create" ? (
              <EntityCreateForm
                form={formCreateEntity}
                onSubmit={handleCreate}
                onCancel={() => setSlideOverOpen(false)}
                formId="create"
              />
            ) : mode === "edit" ? (
              <EntityEditForm
                form={formEditEntity}
                onSubmit={handleUpdate}
                onCancel={() => setSlideOverOpen(false)}
                formId="edit"
              />
            ) : selectedEntity ? (
              <EntityViewForm selectedEntity={selectedEntity} />
            ) : null}
          </div>
        </SlideOverForm>
      )}
    </>
  );
}
