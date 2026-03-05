//src/features/users/components/user-data-table.tsx
"use client";

import { useDataTableActions } from "@/hooks/useDataTable";
import { useDeleteUser, useUpdateUser, useUsers } from "../hooks/usersHooks";

import { DataTable, SlideOverForm } from "@/components/data-display/data-table";
import { userColumns } from "./columns";
import { UserEditForm } from "./user-edit-form";
import { useEffect, useState } from "react";
import {
  RegisterAuthDto,
  RegisterAuthSchema,
  UpdateUserProfileDto,
  UpdateUserProfileSchema,
  UserProfileDto,
} from "@vivero/shared";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserCreateForm } from "./user-create-form";
import { useRegister } from "../hooks/useRegister";

export function UsersDataTable() {
  const { data: users = [] } = useUsers();

  const [slideOverOpen, setSlideOverOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfileDto>();

  const { mutateAsync: updateUser, isPending: isUpdatingUser } =
    useUpdateUser();
  const { mutateAsync: deleteUser } = useDeleteUser();

  const { mutateAsync: createUser, isPending: isCreatingUser } = useRegister();

  const formEditUser = useForm<UpdateUserProfileDto>({
    resolver: zodResolver(UpdateUserProfileSchema),
  });

  const formCreateUser = useForm<RegisterAuthDto>({
    resolver: zodResolver(RegisterAuthSchema),
    defaultValues: {
      username: "",
      firstName: "",
      lastName: "",
      email: "",
    },
  });

  useEffect(() => {
    if (selectedUser) {
      formEditUser.reset({
        firstName: selectedUser?.firstName || "",
        lastName: selectedUser?.lastName || "",
        email: selectedUser?.email || "",
      });
    }
  }, [selectedUser, formEditUser]);

  const {} = useDataTableActions<UserProfileDto>({
    entityName: "Usuarios",
    onDelete: (id) => deleteUser(id),
  });

  const handleEdit = (row: UserProfileDto) => {
    setSelectedUser(row);
    setSlideOverOpen(true);
  };

  const handleNewUser = () => {
    setSelectedUser(undefined);
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

  const handleUpdate = async (formData: UpdateUserProfileDto) => {
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

  const handleCreate = async (formData: RegisterAuthDto) => {
    try {
      await createUser(formData);
    } catch {}

    if (!isCreatingUser) setSlideOverOpen(false);
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
        onCreate={handleNewUser}
        createLabel="Nuevo Usuario"
        onEdit={handleEdit}
        onDelete={handleDelete}
        onExport={handleExport}
      />
      {slideOverOpen && (
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
          form={selectedUser ? formEditUser : formCreateUser}
        >
          <div className="space-y-2">
            {selectedUser ? (
              <UserEditForm
                form={formEditUser}
                onSubmit={handleUpdate}
                onCancel={() => setSlideOverOpen(false)}
                formId={
                  selectedUser ? `edit-${selectedUser.username}` : "create"
                }
              />
            ) : (
              <UserCreateForm
                form={formCreateUser}
                onSubmit={handleCreate}
                onCancel={() => setSlideOverOpen(false)}
                formId="create"
              />
            )}
          </div>
        </SlideOverForm>
      )}
    </>
  );
}
