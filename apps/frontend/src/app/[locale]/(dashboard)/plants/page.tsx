//src/app/[locale]/(dashboard)/plants/page.tsx

import { PlantsDashboard, PlantsDashboardSkeleton } from "@/features/plants";
import { generateLocaleStaticParams } from "@/i18n/routing";
import { setRequestLocale } from "next-intl/server";
import { Suspense, use } from "react";

export function generateStaticParams() {
  return generateLocaleStaticParams();
}

interface PlantsPageProps {
  params: Promise<{ locale: string }>;
}

export default function PlantsPage({ params }: PlantsPageProps) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return (
    <Suspense fallback={<PlantsDashboardSkeleton />}>
      <PlantsDashboard />
    </Suspense>
  );
}
