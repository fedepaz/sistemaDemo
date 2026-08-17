//src/features/users/components/user-data-table.tsx
"use client";

import { useDataTableActions } from "@/hooks/useDataTable";
import {
  useDeleteUser,
  useUpdateUser,
  useUsers,
  useUsersToActivate,
} from "../hooks/usersHooks";
import { usePermission } from "@/hooks/usePermission";
import { useAuthContext } from "@/features/auth/providers/AuthProvider";

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
import { RestorePasswordButton } from "./restore-password-button";
import { ActivateUserButton } from "./activate-user-button";

import { Button } from "@/components/ui/button";
import { UserCheck, UserPlus } from "lucide-react";

export function UsersDataTable() {
  const { data: users = [] } = useUsers();
  const { data: usersToActivate = [] } = useUsersToActivate();

  const [slideOverOpen, setSlideOverOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfileDto>();
  const [showActivate, setShowActivate] = useState(false);

  const { mutateAsync: updateUser, isPending: isUpdatingUser } =
    useUpdateUser();
  const { mutateAsync: deleteUser } = useDeleteUser();

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

  return (
    <>
      {!showActivate ? (
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
          toolbarContent={
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => setShowActivate(true)}
              aria-label="Activar usuarios"
            >
              <UserPlus className="mr-1.5 h-3.5 w-3.5" />
              Activar usuarios
            </Button>
          }
        />
      ) : (
        <DataTable
          columns={userColumns}
          data={usersToActivate}
          title="Usuarios pendientes de activación"
          description="Gestión a los usuarios que tienen una cuenta pero no han sido activadas."
          tableName="users"
          onEdit={handleEdit}
          totalCount={usersToActivate.length}
          exportColumns={userExportColumns}
          toolbarContent={
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => setShowActivate(false)}
              aria-label="Usuarios Activos"
            >
              <UserCheck className="mr-1.5 h-3.5 w-3.5" />
              Usuarios Activos
            </Button>
          }
        />
      )}

      {selectedUser && (
        <SlideOverForm
          formId={`edit-${selectedUser.username}`}
          open={slideOverOpen}
          onOpenChange={setSlideOverOpen}
          title="Editar usuario"
          description={`Edita los detalles del usuario ${selectedUser.username}.`}
          onCancel={() => setSlideOverOpen(false)}
          saveLabel="Actualizar Usuario"
          form={formEditUser}
        >
          <div className="space-y-2">
            <UserEditForm
              form={formEditUser}
              onSubmit={handleUpdate}
              onCancel={() => setSlideOverOpen(false)}
              formId={`edit-${selectedUser.username}`}
            />
            {canUpdate && selectedUser.id !== currentUser?.id && (
              <div className="pt-4 border-t">
                {showActivate ? (
                  <ActivateUserButton
                    selectedUser={selectedUser}
                    onSuccess={() => setSlideOverOpen(false)}
                  />
                ) : (
                  <RestorePasswordButton
                    selectedUser={selectedUser}
                    onSuccess={() => setSlideOverOpen(false)}
                  />
                )}
              </div>
            )}
          </div>
        </SlideOverForm>
      )}
    </>
  );
}
