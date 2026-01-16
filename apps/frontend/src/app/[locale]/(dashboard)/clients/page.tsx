// src/app/[locale]/(dashboard)/clients/page.tsx

import { ClientsDashboard, ClientsDashboardSkeleton } from "@/features/clients";
import { generateLocaleStaticParams } from "@/i18n/routing";
import { setRequestLocale } from "next-intl/server";
import { use, Suspense } from "react";

export function generateStaticParams() {
  return generateLocaleStaticParams();
}

interface ClientsPageProps {
  params: Promise<{ locale: string }>;
}

export default function ClientsPage({ params }: ClientsPageProps) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return (
    <Suspense fallback={<ClientsDashboardSkeleton />}>
      <ClientsDashboard />
    </Suspense>
  );
}
