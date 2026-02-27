# Frontend Components Registry & QA Review

This document tracks all React components within the `apps/frontend/src` directory, ensuring they meet the project's enterprise standards for responsiveness, color token usage, and UX accessibility helpers.

## Review Criteria

| Criterion | Description |
| :--- | :--- |
| **Responsive** | Component follows a mobile-first approach and adapts correctly to Tablet and Desktop views using Tailwind breakpoints (`sm:`, `md:`, `lg:`, `xl:`). |
| **Color Tokens** | Component strictly uses theme variables/tokens (e.g., `text-foreground`, `bg-primary/10`, `border-border/60`) and avoids hardcoded hex/RGB/HSL colors. |
| **UX Helpers** | Component implements Tooltips for icon-only actions, `aria-label` for screen readers, and `FormDescription` for complex input guidance. |

---

## Pages and Layouts

| Component | Responsive | Color Tokens | UX Helpers |
| :--- | :---: | :---: | :---: |
| `AuthLayout` | [x] | [x] | [x] |
| `LoginPage` | [x] | [x] | [x] |
| `RegisterPage` | [x] | [x] | [x] |
| `CatchAllPage` | [x] | [x] | [x] |
| `DashboardLayout` | [x] | [x] | [x] |
| `Loading` | [x] | [x] | [x] |
| `NotFound` | [x] | [x] | [x] |
| `DashboardPage` | [x] | [x] | [x] |
| `UsersPage" | [x] | [x] | [x] |
| `RootLayout" | [x] | [x] | [x] |

## Common Components

| Component | Responsive | Color Tokens | UX Helpers |
| :--- | :---: | :---: | :---: |
| `ComingSoonPage` | [x] | [x] | [x] |
| `DashboardProtectedLayout` | [x] | [x] | [x] |
| `DatabaseUnavailablePage` | [x] | [x] | [x] |
| `LoadingSpinner` | [x] | [x] | [x] |
| `NotFoundPage` | [x] | [x] | [x] |
| `PendingPermissionsPage` | [x] | [x] | [x] |
| `ThemeToggle` | [x] | [x] | [x] |
| `DeleteDialog` | [x] | [x] | [x] |
| `EditDialog` | [x] | [x] | [x] |
| `ExportDropdown` | [x] | [x] | [x] |
| `FloatingActionButton` | [x] | [x] | [x] |
| `SlideOverForm` | [x] | [x] | [x] |

## Data Display Components

| Component | Responsive | Color Tokens | UX Helpers |
| :--- | :---: | :---: | :---: |
| `DataTableFacetedFilter` | [x] | [x] | [ ] |
| `DataTableSkeleton` | [x] | [x] | [x] |
| `DataTable` | [x] | [x] | [x] |
| `SortableHeader` | [x] | [x] | [x] |
| `StatusBadge` | [x] | [x] | [x] |
| `InlineEditRow` | [x] | [x] | [ ] |
| `FeatureCardSkeleton` | [x] | [x] | [x] |
| `FeatureCard` | [x] | [x] | [x] |
| `KPICardSkeleton` | [x] | [x] | [x] |
| `KPICard` | [x] | [x] | [x] |

## Error Handling Components

| Component | Responsive | Color Tokens | UX Helpers |
| :--- | :---: | :---: | :---: |
| `ErrorBoundary` | [x] | [x] | [x] |
| `FormErrorHandler` | [x] | [x] | [x] |

## Layout Components

| Component | Responsive | Color Tokens | UX Helpers |
| :--- | :---: | :---: | :---: |
| `DashboardHeader` | [x] | [x] | [x] |
| `DesktopSidebar` | [x] | [x] | [x] |
| `MobileNavigation` | [x] | [x] | [x] |

## UI Primitives (shadcn/ui)

| Component | Responsive | Color Tokens | UX Helpers |
| :--- | :---: | :---: | :---: |
| `AlertDialog` | [x] | [x] | [x] |
| `Alert` | [x] | [x] | [x] |
| `Avatar` | [x] | [x] | [x] |
| `Badge` | [x] | [x] | [x] |
| `Button` | [x] | [x] | [x] |
| `Card` | [x] | [x] | [x] |
| `Checkbox` | [x] | [x] | [x] |
| `Command` | [x] | [x] | [x] |
| `Dialog` | [x] | [x] | [x] |
| `DropdownMenu` | [x] | [x] | [x] |
| `Form` | [x] | [x] | [x] |
| `Input` | [x] | [x] | [x] |
| `Label` | [x] | [x] | [x] |
| `Popover` | [x] | [x] | [x] |
| `Progress` | [x] | [x] | [x] |
| `ScrollArea` | [x] | [x] | [x] |
| `Select` | [x] | [x] | [x] |
| `Separator` | [x] | [x] | [x] |
| `Sheet` | [x] | [x] | [x] |
| `Skeleton` | [x] | [x] | [x] |
| `Toaster` | [x] | [x] | [x] |
| `Table` | [x] | [x] | [x] |

## Feature Components

### Audit Logs
| Component | Responsive | Color Tokens | UX Helpers |
| :--- | :---: | :---: | :---: |
| `AuditLogDashboard` | [x] | [x] | [x] |
| `AuditLogDashboardSkeleton` | [x] | [x] | [x] |
| `AuditLogDataTable` | [x] | [x] | [x] |
| `AuditLogForm` | [x] | [x] | [ ] |

### Auth
| Component | Responsive | Color Tokens | UX Helpers |
| :--- | :---: | :---: | :---: |
| `AuthSkeleton` | [x] | [x] | [x] |
| `LoginForm` | [x] | [x] | [x] |
| `RegisterForm` | [x] | [x] | [x] |
| `LoginLoading` | [x] | [x] | [x] |

### Clients
| Component | Responsive | Color Tokens | UX Helpers |
| :--- | :---: | :---: | :---: |
| `ClientForm` | [x] | [x] | [x] |
| `ClientsDashboardSkeleton` | [x] | [x] | [x] |
| `ClientsDataTable` | [x] | [x] | [x] |
| `ClientsKPI` | [x] | [x] | [x] |
| `ClientsDashboard` | [x] | [x] | [x] |
| `CellComponent` | [x] | [x] | [x] |
| `HeaderComponent` | [x] | [x] | [x] |
| `CellBadgeComponent` | [x] | [x] | [x] |
| `RenderInlineEdit` | [x] | [x] | [ ] |

### Dashboard
| Component | Responsive | Color Tokens | UX Helpers |
| :--- | :---: | :---: | :---: |
| `DashboardAlertsSkeleton` | [x] | [x] | [x] |
| `DashboardAlerts` | [x] | [x] | [x] |
| `DashboardKPISkeleton` | [x] | [x] | [x] |
| `DashboardKPI` | [x] | [x] | [x] |
| `FeatureNavigationSkeleton` | [x] | [x] | [x] |
| `FeatureNavigation` | [x] | [x] | [x] |
| `RecentActivitySkeleton` | [x] | [x] | [x] |
| `RecentActivity` | [x] | [x] | [x] |
| `RootDashboardSkeleton` | [x] | [x] | [x] |
| `RootDashboard` | [x] | [x] | [x] |

### Invoices
| Component | Responsive | Color Tokens | UX Helpers |
| :--- | :---: | :---: | :---: |
| `InvoiceForm` | [x] | [x] | [x] |
| `InvoicesDataTable` | [x] | [x] | [x] |
| `InvoiceKPIs` | [x] | [x] | [x] |
| `InvoicesDashboard` | [x] | [x] | [x] |
| `InvoicesDashboardSkeleton` | [x] | [x] | [x] |
| `CellAmountComponent" | [x] | [x] | [x] |

### Permissions
| Component | Responsive | Color Tokens | UX Helpers |
| :--- | :---: | :---: | :---: |
| `PermissionsDashboard` | [x] | [x] | [x] |
| `PermissionsManager` | [x] | [x] | [x] |
| `PermissionRowItem` | [x] | [x] | [x] |
| `UserSelector` | [x] | [x] | [x] |
| `PermissionsDashboardSkeleton` | [x] | [x] | [x] |
| `PermissionManagerSkeleton` | [x] | [x] | [x] |
| `UserSelectorSkeleton` | [x] | [x] | [x] |
| `EmptyState` | [x] | [x] | [x] |

### Extendidos
| Component | Responsive | Color Tokens | UX Helpers |
| :--- | :---: | :---: | :---: |
| `ExtendidoDashboardSkeleton` | [x] | [x] | [x] |
| `ExtendidoDataTable` | [x] | [x] | [x] |
| `ExtendidosForm` | [x] | [x] | [x] |
| `ExtendidoKPIs` | [x] | [x] | [x] |
| `ExtendidoDashboard` | [x] | [x] | [x] |

### Purchase Orders
| Component | Responsive | Color Tokens | UX Helpers |
| :--- | :---: | :---: | :---: |
| `PurchaseOrdersDataTable` | [x] | [x] | [x] |
| `PurchaseOrderForm` | [x] | [x] | [x] |
| `PurchaseOrdersDashboardSkeleton` | [x] | [x] | [x] |
| `PurchaseOrderKPIs` | [x] | [x] | [x] |
| `PurchaseOrdersDashboard` | [x] | [x] | [x] |

### Users
| Component | Responsive | Color Tokens | UX Helpers |
| :--- | :---: | :---: | :---: |
| `UsersDashboardSkeleton` | [x] | [x] | [x] |
| `UsersDataTable` | [x] | [x] | [x] |
| `UserForm` | [x] | [x] | [x] |
| `UserKPIs` | [x] | [x] | [x] |
| `UsersDashboard` | [x] | [x] | [x] |
| `UserProfileEdit` | [x] | [x] | [x] |
| `UserProfileInfo` | [x] | [x] | [x] |
| `UserMenu` | [x] | [x] | [x] |
| `FullNameCell` | [x] | [x] | [x] |
| `StatusCell` | [x] | [x] | [x] |

## Providers

| Component | Responsive | Color Tokens | UX Helpers |
| :--- | :---: | :---: | :---: |
| `AppProviders` | [x] | [x] | [x] |
| `ReactClientProvider` | [x] | [x] | [x] |
| `ThemeProvider` | [x] | [x] | [x] |
| `AuthProvider` | [x] | [x] | [x] |
| `ErrorProvider` | [x] | [x] | [x] |
