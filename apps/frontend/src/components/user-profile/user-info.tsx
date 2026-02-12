// src/components/user-profile/user-info.tsx

import { useAuthContext } from "@/features/auth/providers/AuthProvider";

export function UserProfileInfo() {
  const { userProfile } = useAuthContext();
  if (!userProfile) return null;
  return (
    <div className="space-y-4 text-sm">
      <p>
        <strong>Email:</strong> {userProfile.email}
      </p>
      <p>
        <strong>Nombre:</strong> {userProfile.firstName}
      </p>
      <p>
        <strong>Apellido:</strong> {userProfile.lastName}
      </p>
      <p>
        <strong>Empresa:</strong> {userProfile.tenantId}
      </p>
    </div>
  );
}
