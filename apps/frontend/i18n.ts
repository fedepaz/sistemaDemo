import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async ({locale}) => {
  // Import translations for the given locale
  const messages = {
    ...(await import(`./messages/${locale}/common.json`)).default,
    ...(await import(`./messages/${locale}/alerts.json`)).default,
    ...(await import(`./messages/${locale}/main.json`)).default,
    ...(await import(`./messages/${locale}/navigation.json`)).default,

    // Clients Feature
    ...(await import(`./src/features/clients/components/ClientsDashboard/messages/${locale}.json`)).default,
    ...(await import(`./src/features/clients/components/ClientsDashboardSkeleton/messages/${locale}.json`)).default,
    ...(await import(`./src/features/clients/components/ClientsDataTable/messages/${locale}.json`)).default,
    ...(await import(`./src/features/clients/components/ClientsKpi/messages/${locale}.json`)).default,
    ...(await import(`./src/features/clients/components/Columns/messages/${locale}.json`)).default,

    // Dashboard Feature
    ...(await import(`./src/features/dashboard/components/RootDashboard/messages/${locale}.json`)).default,
    ...(await import(`./src/features/dashboard/components/DashboardAlerts/messages/${locale}.json`)).default,
    ...(await import(`./src/features/dashboard/components/DashboardKpi/messages/${locale}.json`)).default,
    ...(await import(`./src/features/dashboard/components/FeatureNavigation/messages/${locale}.json`)).default,
    ...(await import(`./src/features/dashboard/components/RecentActivity/messages/${locale}.json`)).default,
    ...(await import(`./src/features/dashboard/components/RootDashboardSkeleton/messages/${locale}.json`)).default,

    // Invoices Feature
    ...(await import(`./src/features/invoices/components/InvoicesDashboard/messages/${locale}.json`)).default,
    ...(await import(`./src/features/invoices/components/InvoicesDashboardSkeleton/messages/${locale}.json`)).default,
    ...(await import(`./src/features/invoices/components/Columns/messages/${locale}.json`)).default,
    ...(await import(`./src/features/invoices/components/InvoiceForm/messages/${locale}.json`)).default,
    ...(await import(`./src/features/invoices/components/InvoicesDataTable/messages/${locale}.json`)).default,
    ...(await import(`./src/features/invoices/components/InvoicesKpi/messages/${locale}.json`)).default,

    // Plants Feature
    ...(await import(`./src/features/plants/components/PlantsDashboard/messages/${locale}.json`)).default,
    ...(await import(`./src/features/plants/components/PlantDashboardSkeleton/messages/${locale}.json`)).default,
    ...(await import(`./src/features/plants/components/PlantsDataTable/messages/${locale}.json`)).default,
    ...(await import(`./src/features/plants/components/PlantsKpi/messages/${locale}.json`)).default,
    ...(await import(`./src/features/plants/components/Columns/messages/${locale}.json`)).default,

    // Purchase Orders Feature
    ...(await import(`./src/features/purchase-orders/components/PurchaseOrdersDashboard/messages/${locale}.json`)).default,
    ...(await import(`./src/features/purchase-orders/components/PurchaseOrderSkeleton/messages/${locale}.json`)).default,
    ...(await import(`./src/features/purchase-orders/components/PurchaseOrderDataTable/messages/${locale}.json`)).default,
    ...(await import(`./src/features/purchase-orders/components/PurchaseOrdersKpi/messages/${locale}.json`)).default,
    ...(await import(`./src/features/purchase-orders/components/PurchaseOrdersColumns/messages/${locale}.json`)).default,

    // Users Feature
    ...(await import(`./src/features/users/components/UsersDashboard/messages/${locale}.json`)).default,
    ...(await import(`./src/features/users/components/UserDashboardSkeleton/messages/${locale}.json`)).default,
    ...(await import(`./src/features/users/components/UsersUsersDataTable/messages/${locale}.json`)).default,
    ...(await import(`./src/features/users/components/UserKpi/messages/${locale}.json`)).default,
    ...(await import(`./src/features/users/components/Columns/messages/${locale}.json`)).default,
  };

  return {
    messages
  };
});