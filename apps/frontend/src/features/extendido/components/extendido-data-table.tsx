//src/features/plants/components/plants-data-table.tsx
"use client";

import { DataTable, SlideOverForm } from "@/components/data-display/data-table";
import { plantColumns } from "./columns";
import { usePlants } from "../hooks/useExtendido";
import { Plant } from "../types";

import { useState } from "react";
import { ExtendidosForm } from "./extendido-form";

export function ExtendidoDataTable() {
  const { data: plants } = usePlants();

  const [slideOverOpen, setSlideOverOpen] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<Plant>();

  const handleExtendidoView = (row: Plant) => {
    setSelectedPlant(row);
    setSlideOverOpen(true);
  };
  const handleExport = () => {
    console.log("Export Entities:", plants);
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
        onExport={handleExport}
        onView={handleExtendidoView}
      />
      {selectedPlant && (
        <SlideOverForm
          open={slideOverOpen}
          onOpenChange={setSlideOverOpen}
          title="Ver entidad"
          description="Ver detalles de la entidad"
          formId="extendido-form"
          mode="view"
        >
          <div className="space-y-2">
            <ExtendidosForm selectedExtendido={selectedPlant} />
          </div>
        </SlideOverForm>
      )}
    </>
  );
}
