//src/app/[locale]/(dashboard)/users/page.tsx

import { UsersDashboard, UsersDashboardSkeleton } from "@/features/users";
import { generateLocaleStaticParams } from "@/i18n/routing";
import { setRequestLocale } from "next-intl/server";
import { Suspense, use } from "react";

export function generateStaticParams() {
  return generateLocaleStaticParams();
}

interface UsersPageProps {
  params: Promise<{ locale: string }>;
}

export default function UsersPage({ params }: UsersPageProps) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return (
    <Suspense fallback={<UsersDashboardSkeleton />}>
      <UsersDashboard />
    </Suspense>
  );
}
