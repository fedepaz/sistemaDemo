//src/features/users/components/user-data-table.tsx
"use client";

import { useDataTableActions } from "@/hooks/useDataTable";
import { useDeleteUser, useUpdateUser, useUsers } from "../hooks/usersHooks";

import {
  DataTable,
  DataTableSkeleton,
  SlideOverForm,
} from "@/components/data-display/data-table";
import { userColumns } from "./columns";
import { UserForm } from "./user-form";
import { useEffect, useState } from "react";
import {
  UpdateUserProfileDto,
  UpdateUserProfileSchema,
  UserProfileDto,
} from "@vivero/shared";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export function UsersDataTable() {
  const { data: users = [], isLoading } = useUsers();

  const [slideOverOpen, setSlideOverOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfileDto>();

  const { mutateAsync: updateUser, isPending: isUpdatingUser } =
    useUpdateUser();
  const { mutateAsync: deleteUser, isPending: isDeletingUser } =
    useDeleteUser();

  const formUser = useForm<UpdateUserProfileDto>({
    resolver: zodResolver(UpdateUserProfileSchema),
  });

  useEffect(() => {
    if (selectedUser) {
      formUser.reset({
        firstName: selectedUser?.firstName || "",
        lastName: selectedUser?.lastName || "",
        email: selectedUser?.email || "",
      });
    }
  }, [selectedUser, formUser]);

  const {} = useDataTableActions<UserProfileDto>({
    entityName: "Usuarios",
    onDelete: (id) => deleteUser(id),
  });

  const handleEdit = (row: UserProfileDto) => {
    setSelectedUser(row);
    setSlideOverOpen(true);
  };

  const handleDelete = async (row: UserProfileDto) => {
    if (row.username) {
      await deleteUser(row.username);
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
        await updateUser({
          username: selectedUser.username,
          userUpdate: formData,
        });
      } catch {}

      if (!isUpdatingUser) setSlideOverOpen(false);
    }
  };

  if (isLoading) return <DataTableSkeleton columnCount={userColumns.length} />;

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
      {selectedUser && (
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
          saveLabel={selectedUser ? "Actualizar Usuario" : "Crear Usuario"}
          form={formUser}
        >
          <div className="space-y-2">
            <UserForm
              form={formUser}
              onSubmit={handleSave}
              onCancel={() => setSlideOverOpen(false)}
              formId={selectedUser ? `edit-${selectedUser.username}` : "create"}
            />
          </div>
        </SlideOverForm>
      )}
    </>
  );
}
