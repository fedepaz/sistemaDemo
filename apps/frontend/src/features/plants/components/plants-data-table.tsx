//src/features/plants/components/plants-data-table.tsx
"use client";

import {
  DataTable,
  FloatingActionButton,
  SlideOverForm,
} from "@/components/data-display/data-table";
import { plantColumns } from "./columns";
import {
  useCreatePlant,
  useDeletePlant,
  usePlants,
  useUpdatePlant,
} from "../hooks/hooks";
import { Plant } from "../types";

import { useDataTableActions } from "@/hooks/useDataTable";
import { PlantForm } from "./plants-form";
import { useState } from "react";

export function PlantsDataTable() {
  const { data: plants = [] } = usePlants();

  const [slideOverOpen, setSlideOverOpen] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [formData, setFormData] = useState<Partial<Plant>>({});

  const createPlant = useCreatePlant();
  const updatePlant = useUpdatePlant();
  const deletePlant = useDeletePlant();

  const {} = useDataTableActions<Plant>({
    entityName: "Entities",
    onDelete: (id) => deletePlant.mutateAsync(id),
  });

  const handleEdit = (row: Plant) => {
    setSelectedPlant(row);
    setFormData(row);
    setSlideOverOpen(true);
  };

  const handleAdd = () => {
    setSelectedPlant(null);
    setFormData({
      name: "",
      species: "",
      location: "",
      status: "healthy",
      growthStage: "",
      plantedDate: "",
      lastWatered: "",
    });
    setSlideOverOpen(true);
  };
  const handleDelete = (rows: Plant[]) => {
    console.log("Delete Entities:", rows);
  };

  const handleExport = (
    format: "csv" | "excel" | "json" | "pdf",
    selectedRows: Plant[],
  ) => {
    console.log("Export Entities:", selectedRows);
  };

  const handleSave = async () => {
    if (selectedPlant) {
      await updatePlant.mutateAsync({
        id: selectedPlant.id,
        plantUpdate: formData,
      });
      setSlideOverOpen(false);
    }
  };
  return (
    <>
      <DataTable
        columns={plantColumns}
        data={plants}
        title="Entidades"
        description="Gestión de la información de las entidades"
        tableName="entities"
        totalCount={plants.length}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onExport={handleExport}
        onQuickEdit={(plant) => console.log(`Quick edit entity: ${plant.name}`)}
      />

      <FloatingActionButton onClick={handleAdd} label="Añadir nueva entidad" />
      <SlideOverForm
        open={slideOverOpen}
        onOpenChange={setSlideOverOpen}
        title={
          selectedPlant
            ? `Editar entidad: ${selectedPlant.name}`
            : "Crear nueva entidad"
        }
        description={
          selectedPlant
            ? `Edita los detalles de la entidad ${selectedPlant.name}.`
            : "Rellena los campos para crear una nueva entidad."
        }
        onSave={handleSave}
        onCancel={() => setSlideOverOpen(false)}
        saveLabel={selectedPlant ? "Actualizar" : "Crear"}
      >
        <div className="space-y-2">
          <PlantForm
            onSubmit={handleSave}
            onCancel={() => setSlideOverOpen(false)}
            isSubmitting={createPlant.isPending}
          />
        </div>
      </SlideOverForm>
    </>
  );
}
