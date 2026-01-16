//src/app/[locale]/page.tsx

import { RootDashboard, RootDashboardSkeleton } from "@/features/dashboard";
import { Suspense, use } from "react";
import { setRequestLocale } from "next-intl/server";
import { generateLocaleStaticParams } from "@/i18n/routing";

export function generateStaticParams() {
  return generateLocaleStaticParams();
}

interface DashboardPageProps {
  params: Promise<{ locale: string }>;
}

export default function RootDashboardPage({ params }: DashboardPageProps) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Suspense fallback={<RootDashboardSkeleton />}>
        <RootDashboard />
      </Suspense>
    </div>
  );
}
