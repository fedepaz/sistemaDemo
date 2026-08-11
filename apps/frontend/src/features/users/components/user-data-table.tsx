//src/features/users/components/user-data-table.tsx
"use client";

import { useDataTableActions } from "@/hooks/useDataTable";
import {
  useDeleteUser,
  useUpdateUser,
  useUsers,
  useRestorePassword,
} from "../hooks/usersHooks";
import { usePermission } from "@/hooks/usePermission";
import { useAuthContext } from "@/features/auth/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Loader2, KeyRound } from "lucide-react";

import { DataTable, SlideOverForm } from "@/components/data-display/data-table";
import { userColumns, userExportColumns } from "./columns";
import { UserEditForm } from "./user-edit-form";
import { useEffect, useState } from "react";
import {
  UpdateUserProfileDto,
  UpdateUserProfileSchema,
  UserProfileDto,
} from "@vivero/shared";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export function UsersDataTable() {
  const { data: users = [] } = useUsers();

  const [slideOverOpen, setSlideOverOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfileDto>();

  const { mutateAsync: updateUser, isPending: isUpdatingUser } =
    useUpdateUser();
  const { mutateAsync: deleteUser } = useDeleteUser();

  const { mutateAsync: restorePassword, isPending: isRestoring } =
    useRestorePassword();
  const { canUpdate } = usePermission("users");
  const { userProfile: currentUser } = useAuthContext();

  const formEditUser = useForm<UpdateUserProfileDto>({
    resolver: zodResolver(UpdateUserProfileSchema),
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

  const handleDelete = async (row: UserProfileDto) => {
    if (row.username) {
      await deleteUser(row.username);
    }
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

  const handleRestorePassword = async () => {
    if (!selectedUser) return;
    try {
      await restorePassword({ userId: selectedUser.id });
    } catch {}

    if (!isRestoring) setSlideOverOpen(false);
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
        exportColumns={userExportColumns}
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
          form={selectedUser ? formEditUser : null}
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
            ) : null}
            {selectedUser &&
              canUpdate &&
              selectedUser.id !== currentUser?.id && (
                <div className="pt-4 border-t">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleRestorePassword}
                    disabled={isRestoring}
                  >
                    {isRestoring ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <KeyRound className="mr-2 h-4 w-4" />
                    )}
                    Restaurar contraseña
                  </Button>
                </div>
              )}
          </div>
        </SlideOverForm>
      )}
    </>
  );
}
