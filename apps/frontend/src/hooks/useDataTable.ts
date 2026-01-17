//src/hooks/useDataTable.ts

import { toast } from "sonner";

import { useState } from "react";

interface UseDataTableActionsOptions<T> {
  entityName: string; // For translations: "invoice", "plant", "purchaseOrder"
  onDelete?: (id: string) => Promise<void>;
  onExport?: (data: T[]) => void;
}

export function useDataTableActions<T extends { id: string }>({
  entityName,
  onDelete,
  onExport,
}: UseDataTableActionsOptions<T>) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<T | null>(null);

  const handleAdd = () => {
    setSelectedEntity(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (entity: T) => {
    setSelectedEntity(entity);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (entity: T) => {
    if (!onDelete) return;

    const confirmed = window.confirm(`¿Estás seguro de que quieres eliminar este ${entityName} (${entity.id})?`);

    if (!confirmed) return;

    try {
      await onDelete(entity.id);
      toast.success(`${entityName} eliminado(a) con éxito.`);
    } catch (error) {
      toast.error(`Error al eliminar ${entityName}.`);
      console.error(`Failed to delete ${entityName}:`, error);
    }
  };

  const handleExport = (data: T[]) => {
    if (onExport) {
      onExport(data);
    } else {
      // Default CSV export
      const headers = Object.keys(data[0] || {}).join(",");
      const rows = data.map((item) => Object.values(item).join(",")).join("\n");
      const csvContent = `${headers}\n${rows}`;

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${entityName}-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success(`${entityName} exportado(a) con éxito.`);
    }
  };

  const closeCreateModal = () => setIsCreateModalOpen(false);
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedEntity(null);
  };

  return {
    // State
    isCreateModalOpen,
    isEditModalOpen,
    selectedEntity,
    // Actions
    handleAdd,
    handleEdit,
    handleDelete,
    handleExport,
    // Modal controls
    closeCreateModal,
    closeEditModal,
  };
}
