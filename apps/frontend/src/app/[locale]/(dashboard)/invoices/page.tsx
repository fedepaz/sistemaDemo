//src/app/[locale]/(dashboard)/invoices/page.tsx

import {
  InvoicesDashboard,
  InvoicesDashboardSkeleton,
} from "@/features/invoices";

import { generateLocaleStaticParams } from "@/i18n/routing";
import { setRequestLocale } from "next-intl/server";
import { Suspense, use } from "react";

export function generateStaticParams() {
  return generateLocaleStaticParams();
}

interface InvoicesPageProps {
  params: Promise<{ locale: string }>;
}

export default function InvoicesPage({ params }: InvoicesPageProps) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return (
    <Suspense fallback={<InvoicesDashboardSkeleton />}>
      <InvoicesDashboard />
    </Suspense>
  );
}
