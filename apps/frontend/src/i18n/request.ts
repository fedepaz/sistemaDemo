// src/i18n/request.ts

import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  // Get the locale from the request
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: {
      ...(await import(`../../messages/${locale}/common.json`)).default,
      ...(await import(`../../messages/${locale}/main.json`)).default,
      ...(await import(`../../messages/${locale}/alerts.json`)).default,
      ...(await import(`../../messages/${locale}/navigation.json`)).default,
      ...(
        await import(
          `../components/layout/DashboardHeader/messages/${locale}.json`
        )
      ).default,
      ...(
        await import(
          `../components/common/LanguageSwitcher/messages/${locale}.json`
        )
      ).default,
      ...(
        await import(`../components/common/ThemeToggle/messages/${locale}.json`)
      ).default,
      ...(
        await import(
          `../components/common/LoadingSpinner/messages/${locale}.json`
        )
      ).default,
      ...(
        await import(
          `../components/common/NotFoundPage/messages/${locale}.json`
        )
      ).default,
      ...(
        await import(
          `../components/common/ComingSoonPage/messages/${locale}.json`
        )
      ).default,
      ...(
        await import(
          `../components/data-display/data-table/DataTableFacetedFilter/messages/${locale}.json`
        )
      ).default,
      ...(
        await import(
          `../components/data-display/data-table/data-table/messages/${locale}.json`
        )
      ).default,
      ...(
        await import(
          `../components/data-display/data-table/SlideOverForm/messages/${locale}.json`
        )
      ).default,
      ...(
        await import(
          `../components/data-display/data-table/ExportDropdown/messages/${locale}.json`
        )
      ).default,
      ...(
        await import(
          `../components/data-display/data-table/FloatingActionButton/messages/${locale}.json`
        )
      ).default,
      ...(
        await import(
          `../components/data-display/data-table/InlineEditRow/messages/${locale}.json`
        )
      ).default,

      // Clients Feature
      ...(
        await import(
          `../features/clients/components/ClientsDashboard/messages/${locale}.json`
        )
      ).default,
      ...(
        await import(
          `../features/clients/components/ClientsDashboardSkeleton/messages/${locale}.json`
        )
      ).default,
      ...(
        await import(
          `../features/clients/components/ClientsDataTable/messages/${locale}.json`
        )
      ).default,
      ...(
        await import(
          `../features/clients/components/ClientKPIs/messages/${locale}.json`
        )
      ).default,
      ...(
        await import(
          `../features/clients/components/ClientColumns/messages/${locale}.json`
        )
      ).default,
      ...(
        await import(
          `../features/clients/components/ClientForm/messages/${locale}.json`
        )
      ).default,
      ...(
        await import(
          `../features/clients/components/CellComponent/messages/${locale}.json`
        )
      ).default,

      // Dashboard Feature
      ...(
        await import(
          `../features/dashboard/components/RootDashboard/messages/${locale}.json`
        )
      ).default,
      ...(
        await import(
          `../features/dashboard/components/DashboardAlerts/messages/${locale}.json`
        )
      ).default,
      ...(
        await import(
          `../features/dashboard/components/DashboardKPIs/messages/${locale}.json`
        )
      ).default,
      ...(
        await import(
          `../features/dashboard/components/FeatureNavigation/messages/${locale}.json`
        )
      ).default,
      ...(
        await import(
          `../features/dashboard/components/RecentActivity/messages/${locale}.json`
        )
      ).default,
      ...(
        await import(
          `../features/dashboard/components/RootDashboardSkeleton/messages/${locale}.json`
        )
      ).default,

      // Invoices Feature
      ...(
        await import(
          `../features/invoices/components/InvoicesDashboard/messages/${locale}.json`
        )
      ).default,
      ...(
        await import(
          `../features/invoices/components/InvoicesDashboardSkeleton/messages/${locale}.json`
        )
      ).default,
      ...(
        await import(
          `../features/invoices/components/InvoiceColumns/messages/${locale}.json`
        )
      ).default,
      ...(
        await import(
          `../features/invoices/components/InvoiceForm/messages/${locale}.json`
        )
      ).default,
      ...(
        await import(
          `../features/invoices/components/InvoicesDataTable/messages/${locale}.json`
        )
      ).default,
      ...(
        await import(
          `../features/invoices/components/InvoiceKPIs/messages/${locale}.json`
        )
      ).default,

      // Plants Feature
      ...(
        await import(
          `../features/plants/components/PlantsDashboard/messages/${locale}.json`
        )
      ).default,
      ...(
        await import(
          `../features/plants/components/PlantDashboardSkeleton/messages/${locale}.json`
        )
      ).default,
      ...(
        await import(
          `../features/plants/components/PlantsDataTable/messages/${locale}.json`
        )
      ).default,
      ...(
        await import(
          `../features/plants/components/PlantKPIs/messages/${locale}.json`
        )
      ).default,
      ...(
        await import(
          `../features/plants/components/PlantsColumns/messages/${locale}.json`
        )
      ).default,
      ...(
        await import(
          `../features/plants/components/PlantForm/messages/${locale}.json`
        )
      ).default,

      // Purchase Orders Feature
      ...(
        await import(
          `../features/purchase-orders/components/PurchaseOrdersDashboard/messages/${locale}.json`
        )
      ).default,
      ...(
        await import(
          `../features/purchase-orders/components/PurchaseOrderSkeleton/messages/${locale}.json`
        )
      ).default,
      ...(
        await import(
          `../features/purchase-orders/components/PurchaseOrdersDataTable/messages/${locale}.json`
        )
      ).default,
      ...(
        await import(
          `../features/purchase-orders/components/PurchaseOrderKPIs/messages/${locale}.json`
        )
      ).default,
      ...(
        await import(
          `../features/purchase-orders/components/PurchaseOrderColumns/messages/${locale}.json`
        )
      ).default,
      ...(
        await import(
          `../features/purchase-orders/components/PurchaseOrderForm/messages/${locale}.json`
        )
      ).default,

      // Users Feature
      ...(
        await import(
          `../features/users/components/UsersDashboard/messages/${locale}.json`
        )
      ).default,
      ...(
        await import(
          `../features/users/components/UserDashboardSkeleton/messages/${locale}.json`
        )
      ).default,
      ...(
        await import(
          `../features/users/components/UsersDataTable/messages/${locale}.json`
        )
      ).default,
      ...(
        await import(
          `../features/users/components/UserKPIs/messages/${locale}.json`
        )
      ).default,
      ...(
        await import(
          `../features/users/components/UserColumns/messages/${locale}.json`
        )
      ).default,
      ...(
        await import(
          `../features/users/components/UserForm/messages/${locale}.json`
        )
      ).default,
    },
  };
});
