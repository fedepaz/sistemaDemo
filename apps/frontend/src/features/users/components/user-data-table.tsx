//src/features/users/components/user-data-table.tsx
"use client";

import { useDataTableActions } from "@/hooks/useDataTable";
import { useDeleteUser, useUpdateUser, useUsers } from "../hooks/usersHooks";

import { DataTable, SlideOverForm } from "@/components/data-display/data-table";
import { userColumns } from "./columns";
import { UserForm } from "./user-form";
import { useState } from "react";
import { UpdateUserProfileDto, UserProfileDto } from "@vivero/shared";

export function UsersDataTable() {
  const { data: users = [] } = useUsers();

  const [slideOverOpen, setSlideOverOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfileDto>();

  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const {} = useDataTableActions<UserProfileDto>({
    entityName: "Usuarios",
    onDelete: (id) => deleteUser.mutateAsync(id),
  });

  const handleEdit = (row: UserProfileDto) => {
    setSelectedUser(row);
    setSlideOverOpen(true);
  };

  const handleDelete = async (row: UserProfileDto) => {
    if (row.username) {
      await deleteUser.mutateAsync(row.username);
    }
  };

  const handleExport = (
    format: "csv" | "excel" | "json" | "pdf",
    selectedRows: UserProfileDto[],
  ) => {
    console.log("Export Users:", selectedRows);
  };

  const handleSave = async (formData: UpdateUserProfileDto) => {
    if (selectedUser) {
      try {
        await updateUser.mutateAsync({
          username: selectedUser.username,
          userUpdate: formData,
        });
      } catch (error) {
        throw error;
      }
      setSlideOverOpen(false);
    }
  };

  return (
    <>
      <DataTable
        columns={userColumns}
        data={users}
        title="Usuarios"
        description="Gestión de los usuarios del sistema"
        tableName="users"
        totalCount={users.length}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onExport={handleExport}
      />
      {}

      <SlideOverForm
        formId={selectedUser ? `edit-${selectedUser.username}` : "create"}
        open={slideOverOpen}
        onOpenChange={setSlideOverOpen}
        title={selectedUser ? `Editar usuario` : "Crear nuevo usuario"}
        description={
          selectedUser
            ? `Edita los detalles del usuario ${selectedUser.username}.`
            : "Rellena los campos para crear un nuevo usuario."
        }
        onCancel={() => setSlideOverOpen(false)}
        saveLabel={selectedUser ? "Actualizar" : "Crear"}
      >
        <div className="space-y-2">
          <UserForm
            initialData={selectedUser}
            onSubmit={handleSave}
            onCancel={() => setSlideOverOpen(false)}
            formId={selectedUser ? `edit-${selectedUser.username}` : "create"}
          />
        </div>
      </SlideOverForm>
    </>
  );
}
