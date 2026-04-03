//src/app/(dashboard)/users/page.tsx

import { UsersDashboard } from "@/features/users";

export const dynamic = "force-dynamic";

export default function UsersPage() {
  return <UsersDashboard />;
}
