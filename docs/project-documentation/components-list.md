# Frontend Components Registry & QA Review

This document tracks all React components within the `apps/frontend/src` directory, ensuring they meet the project's enterprise standards for responsiveness and color token usage.

## Review Criteria

| Criterion | Description |
| :--- | :--- |
| **Responsive** | Component follows a mobile-first approach and adapts correctly to Tablet and Desktop views using Tailwind breakpoints (`sm:`, `md:`, `lg:`, `xl:`). |
| **Color Tokens** | Component strictly uses theme variables/tokens (e.g., `text-foreground`, `bg-primary/10`, `border-border/60`) and avoids hardcoded hex/RGB/HSL colors. |

---

## Pages and Layouts

| Component | Responsive | Color Tokens |
| :--- | :---: | :---: |
| `AuthLayout` | [x] | [x] |
| `LoginPage` | [x] | [x] |
| `RegisterPage` | [x] | [x] |
| `CatchAllPage` | [x] | [x] |
| `DashboardLayout` | [x] | [x] |
| `Loading` | [x] | [x] |
| `NotFound` | [x] | [x] |
| `DashboardPage` | [x] | [x] |
| `UsersPage` | [x] | [x] |
| `RootLayout` | [x] | [x] |

## Common Components

| Component | Responsive | Color Tokens |
| :--- | :---: | :---: |
| `ComingSoonPage` | [x] | [x] |
| `DashboardProtectedLayout` | [x] | [x] |
| `DatabaseUnavailablePage` | [x] | [x] |
| `LoadingSpinner` | [x] | [x] |
| `NotFoundPage` | [x] | [x] |
| `PendingPermissionsPage` | [x] | [x] |
| `ThemeToggle` | [x] | [x] |
| `DeleteDialog` | [x] | [x] |
| `EditDialog` | [x] | [x] |
| `ExportDropdown` | [x] | [x] |
| `FloatingActionButton` | [x] | [x] |
| `SlideOverForm` | [x] | [x] |

## Data Display Components

| Component | Responsive | Color Tokens |
| :--- | :---: | :---: |
| `DataTableFacetedFilter` | [x] | [x] |
| `DataTableSkeleton` | [x] | [x] |
| `DataTable` | [x] | [x] |
| `SortableHeader` | [x] | [x] |
| `StatusBadge` | [x] | [x] |
| `InlineEditRow` | [x] | [x] |
| `FeatureCardSkeleton` | [x] | [x] |
| `FeatureCard` | [x] | [x] |
| `KPICardSkeleton` | [x] | [x] |
| `KPICard` | [x] | [x] |

## Error Handling Components

| Component | Responsive | Color Tokens |
| :--- | :---: | :---: |
| `ErrorBoundary` | [x] | [x] |
| `FormErrorHandler` | [x] | [x] |

## Layout Components

| Component | Responsive | Color Tokens |
| :--- | :---: | :---: |
| `DashboardHeader` | [x] | [x] |
| `DesktopSidebar` | [x] | [x] |
| `MobileNavigation` | [x] | [x] |

## UI Primitives (shadcn/ui)

| Component | Responsive | Color Tokens |
| :--- | :---: | :---: |
| `AlertDialog` | [x] | [x] |
| `Alert` | [x] | [x] |
| `Avatar` | [x] | [x] |
| `Badge` | [x] | [x] |
| `Button` | [x] | [x] |
| `Card` | [x] | [x] |
| `Checkbox` | [x] | [x] |
| `Command` | [x] | [x] |
| `Dialog` | [x] | [x] |
| `DropdownMenu` | [x] | [x] |
| `Form` | [x] | [x] |
| `Input` | [x] | [x] |
| `Label` | [x] | [x] |
| `Popover` | [x] | [x] |
| `Progress` | [x] | [x] |
| `ScrollArea` | [x] | [x] |
| `Select` | [x] | [x] |
| `Separator` | [x] | [x] |
| `Sheet` | [x] | [x] |
| `Skeleton` | [x] | [x] |
| `Toaster` | [x] | [x] |
| `Table` | [x] | [x] |

## Feature Components

### Audit Logs
| Component | Responsive | Color Tokens |
| :--- | :---: | :---: |
| `AuditLogDashboard` | [x] | [x] |
| `AuditLogDashboardSkeleton` | [x] | [x] |
| `AuditLogDataTable` | [x] | [x] |
| `AuditLogForm` | [x] | [x] |

### Auth
| Component | Responsive | Color Tokens |
| :--- | :---: | :---: |
| `AuthSkeleton` | [x] | [x] |
| `LoginForm` | [x] | [x] |
| `RegisterForm` | [x] | [x] |

### Clients
| Component | Responsive | Color Tokens |
| :--- | :---: | :---: |
| `ClientForm` | [x] | [x] |
| `ClientsDashboardSkeleton` | [x] | [x] |
| `ClientsDataTable` | [x] | [x] |
| `ClientsKPI` | [x] | [x] |
| `ClientsDashboard` | [x] | [x] |
| `CellComponent` | [x] | [x] |
| `HeaderComponent` | [x] | [x] |
| `CellBadgeComponent` | [x] | [x] |
| `RenderInlineEdit` | [x] | [x] |

### Dashboard
| Component | Responsive | Color Tokens |
| :--- | :---: | :---: |
| `DashboardAlertsSkeleton` | [x] | [x] |
| `DashboardAlerts` | [x] | [x] |
| `DashboardKPISkeleton` | [x] | [x] |
| `DashboardKPI` | [x] | [x] |
| `FeatureNavigationSkeleton` | [x] | [x] |
| `FeatureNavigation` | [x] | [x] |
| `RecentActivitySkeleton` | [x] | [x] |
| `RecentActivity` | [x] | [x] |
| `RootDashboardSkeleton` | [x] | [x] |
| `RootDashboard` | [x] | [x] |

### Invoices
| Component | Responsive | Color Tokens |
| :--- | :---: | :---: |
| `InvoiceForm` | [x] | [x] |
| `InvoicesDataTable` | [x] | [x] |
| `InvoiceKPIs` | [x] | [x] |
| `InvoicesDashboard` | [x] | [x] |
| `InvoicesDashboardSkeleton` | [x] | [x] |
| `CellAmountComponent` | [x] | [x] |

### Permissions
| Component | Responsive | Color Tokens |
| :--- | :---: | :---: |
| `PermissionsDashboard` | [x] | [x] |
| `PermissionsManager` | [x] | [x] |
| `PermissionRowItem` | [x] | [x] |
| `UserSelector` | [x] | [x] |
| `PermissionsSkeleton` | [x] | [x] |
| `EmptyState` | [x] | [x] |

### Plants
| Component | Responsive | Color Tokens |
| :--- | :---: | :---: |
| `PlantsDashboardSkeleton` | [x] | [x] |
| `PlantsDataTable` | [x] | [x] |
| `PlantForm` | [x] | [x] |
| `PlantKPIs` | [x] | [x] |
| `PlantsDashboard` | [x] | [x] |

### Purchase Orders
| Component | Responsive | Color Tokens |
| :--- | :---: | :---: |
| `PurchaseOrdersDataTable` | [x] | [x] |
| `PurchaseOrderForm` | [x] | [x] |
| `PurchaseOrdersDashboardSkeleton` | [x] | [x] |
| `PurchaseOrderKPIs` | [x] | [x] |
| `PurchaseOrdersDashboard` | [x] | [x] |

### Users
| Component | Responsive | Color Tokens |
| :--- | :---: | :---: |
| `UsersDashboardSkeleton` | [x] | [x] |
| `UsersDataTable` | [x] | [x] |
| `UserForm` | [x] | [x] |
| `UserKPIs` | [x] | [x] |
| `UsersDashboard` | [x] | [x] |
| `UserProfileEdit` | [x] | [x] |
| `UserProfileInfo` | [x] | [x] |
| `UserMenu` | [x] | [x] |
| `FullNameCell` | [x] | [x] |
| `StatusCell` | [x] | [x] |

## Providers

| Component | Responsive | Color Tokens |
| :--- | :---: | :---: |
| `AppProviders` | [x] | [x] |
| `ReactClientProvider` | [x] | [x] |
| `ThemeProvider` | [x] | [x] |
| `AuthProvider` | [x] | [x] |
| `ErrorProvider` | [x] | [x] |
