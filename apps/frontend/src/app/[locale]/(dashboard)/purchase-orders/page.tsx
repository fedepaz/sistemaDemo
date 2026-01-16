//src/app/[locale]/(dashboard)/purchase-orders/page.tsx

import {
  PurchaseOrdersDashboard,
  PurchaseOrdersDashboardSkeleton,
} from "@/features/purchase-orders";
import { generateLocaleStaticParams } from "@/i18n/routing";
import { setRequestLocale } from "next-intl/server";
import { Suspense, use } from "react";

export function generateStaticParams() {
  return generateLocaleStaticParams();
}

interface PurchaseOrdersPageProps {
  params: Promise<{ locale: string }>;
}

export default function PurchaseOrdersPage({
  params,
}: PurchaseOrdersPageProps) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return (
    <Suspense fallback={<PurchaseOrdersDashboardSkeleton />}>
      <PurchaseOrdersDashboard />
    </Suspense>
  );
}
