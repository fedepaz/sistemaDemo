# Frontend Components Registry & QA Review

This document tracks all React components within the `apps/frontend/src` directory, ensuring they meet the project's enterprise standards for responsiveness, color token usage, and UX accessibility helpers.

## Review Criteria

| Criterion | Description |
| :--- | :--- |
| **Responsive** | Component follows a mobile-first approach and adapts correctly to Tablet and Desktop views using Tailwind breakpoints (`sm:`, `md:`, `lg:`, `xl:`). |
| **Color Tokens** | Component strictly uses theme variables/tokens (e.g., `text-foreground`, `bg-primary/10`, `border-border/60`) and avoids hardcoded hex/RGB/HSL colors. |
| **UX Helpers** | Component implements Tooltips for icon-only actions, `aria-label` for screen readers, and `FormDescription` for complex input guidance. |
| **Viewport dvh** | Component uses dynamic viewport height units (`dvh`) where full-screen or screen-relative height is required, avoiding `100vh` cutoffs on mobile. |

---

## Pages and Layouts

| Component | Responsive | Color Tokens | UX Helpers | Viewport dvh |
| :--- | :---: | :---: | :---: | :---: |
| `AuthLayout` | [x] | [x] | [x] | [x] |
| `LoginPage` | [x] | [x] | [x] | [x] |
| `RegisterPage` | [x] | [x] | [x] | [x] |
| `CatchAllPage` | [x] | [x] | [x] | [x] |
| `DashboardLayout` | [x] | [x] | [x] | [x] |
| `Loading` | [x] | [x] | [x] | [x] |
| `NotFound` | [x] | [x] | [x] | [x] |
| `DashboardPage` | [x] | [x] | [x] | [x] |
| `UsersPage` | [x] | [x] | [x] | [x] |
| `RootLayout` | [x] | [x] | [x] | [x] |

## Common Components

| Component | Responsive | Color Tokens | UX Helpers | Viewport dvh |
| :--- | :---: | :---: | :---: | :---: |
| `ComingSoonPage` | [x] | [x] | [x] | [x] |
| `DashboardProtectedLayout` | [x] | [x] | [x] | [x] |
| `DatabaseUnavailablePage` | [x] | [x] | [x] | [x] |
| `LoadingSpinner` | [x] | [x] | [x] | [x] |
| `NotFoundPage` | [x] | [x] | [x] | [x] |
| `PendingPermissionsPage` | [x] | [x] | [x] | [x] |
| `ThemeToggle` | [x] | [x] | [x] | [x] |
| `Logo` | [x] | [x] | [x] | [x] |
| `DeleteDialog` | [x] | [x] | [x] | [x] |
| `EditDialog` | [x] | [x] | [x] | [x] |
| `ExportDropdown` | [x] | [x] | [x] | [x] |
| `FloatingActionButton` | [x] | [x] | [x] | [x] |
| `SlideOverForm` | [x] | [x] | [x] | [x] |

## Data Display Components

| Component | Responsive | Color Tokens | UX Helpers | Viewport dvh |
| :--- | :---: | :---: | :---: | :---: |
| `DataTableFacetedFilter` | [x] | [x] | [ ] | [x] |
| `DataTableSkeleton` | [x] | [x] | [x] | [x] |
| `DataTable` | [x] | [x] | [x] | [x] |
| `SortableHeader` | [x] | [x] | [x] | [x] |
| `StatusBadge` | [x] | [x] | [x] | [x] |
| `InlineEditRow` | [x] | [x] | [ ] | [x] |
| `FeatureCardSkeleton` | [x] | [x] | [x] | [x] |
| `FeatureCard` | [x] | [x] | [x] | [x] |
| `KPICardSkeleton` | [x] | [x] | [x] | [x] |
| `KPICard` | [x] | [x] | [x] | [x] |

## Error Handling Components

| Component | Responsive | Color Tokens | UX Helpers | Viewport dvh |
| :--- | :---: | :---: | :---: | :---: |
| `ErrorBoundary` | [x] | [x] | [x] | [x] |
| `FormErrorHandler` | [x] | [x] | [x] | [x] |

## Layout Components

| Component | Responsive | Color Tokens | UX Helpers | Viewport dvh |
| :--- | :---: | :---: | :---: | :---: |
| `DashboardHeader` | [x] | [x] | [x] | [x] |
| `DesktopSidebar` | [x] | [x] | [x] | [x] |
| `MobileNavigation` | [x] | [x] | [x] | [x] |
| `ExtendidoDashboard` | [x] | [x] | [x] | [x] |
| `ExtendidoDataTable` | [x] | [x] | [x] | [x] |
| `ExtendidosForm` | [x] | [x] | [x] | [x] |
| `ExtendidoDashboardSkeleton` | [x] | [x] | [x] | [x] |

## UI Primitives (shadcn/ui)

| Component | Responsive | Color Tokens | UX Helpers | Viewport dvh |
| :--- | :---: | :---: | :---: | :---: |
| `AlertDialog` | [x] | [x] | [x] | [x] |
| `Alert` | [x] | [x] | [x] | [x] |
| `Avatar` | [x] | [x] | [x] | [x] |
| `Badge` | [x] | [x] | [x] | [x] |
| `Button` | [x] | [x] | [x] | [x] |
| `Card` | [x] | [x] | [x] | [x] |
| `Checkbox` | [x] | [x] | [x] | [x] |
| `Command` | [x] | [x] | [x] | [x] |
| `Dialog` | [x] | [x] | [x] | [x] |
| `DropdownMenu` | [x] | [x] | [x] | [x] |
| `Form` | [x] | [x] | [x] | [x] |
| `Input` | [x] | [x] | [x] | [x] |
| `Label` | [x] | [x] | [x] | [x] |
| `Popover` | [x] | [x] | [x] | [x] |
| `Progress` | [x] | [x] | [x] | [x] |
| `ScrollArea` | [x] | [x] | [x] | [x] |
| `Select` | [x] | [x] | [x] | [x] |
| `Separator` | [x] | [x] | [x] | [x] |
| `Sheet` | [x] | [x] | [x] | [x] |
| `Skeleton` | [x] | [x] | [x] | [x] |
| `Toaster` | [x] | [x] | [x] | [x] |
| `Table` | [x] | [x] | [x] | [x] |

## Feature Components

### Audit Logs
| Component | Responsive | Color Tokens | UX Helpers | Viewport dvh |
| :--- | :---: | :---: | :---: | :---: |
| `AuditLogDashboard` | [x] | [x] | [x] | [x] |
| `AuditLogDashboardSkeleton` | [x] | [x] | [x] | [x] |
| `AuditLogDataTable` | [x] | [x] | [x] | [x] |
| `AuditLogForm` | [x] | [x] | [ ] | [x] |

### Auth
| Component | Responsive | Color Tokens | UX Helpers | Viewport dvh |
| :--- | :---: | :---: | :---: | :---: |
| `AuthSkeleton` | [x] | [x] | [x] | [x] |
| `AuthDashboard` | [x] | [x] | [x] | [x] |
| `LoginForm` | [x] | [x] | [x] | [x] |
| `RegisterForm` | [x] | [x] | [x] | [x] |
| `RegisterLoading` | [x] | [x] | [x] | [x] |
| `LoginLoading` | [x] | [x] | [x] | [x] |

### Entities
| Component | Responsive | Color Tokens | UX Helpers | Viewport dvh |
| :--- | :---: | :---: | :---: | :---: |
| `EntityCreateForm` | [x] | [x] | [x] | [x] |
| `EntityDashboardSkeleton` | [x] | [x] | [x] | [x] |
| `EntityDataTable` | [x] | [x] | [x] | [x] |
| `EntitiesKPIs` | [x] | [x] | [x] | [x] |
| `EntityDashboard` | [x] | [x] | [x] | [x] |

### Dashboard
| Component | Responsive | Color Tokens | UX Helpers | Viewport dvh |
| :--- | :---: | :---: | :---: | :---: |
| `CompanyWelcome` | [x] | [x] | [x] | [x] |
| `CompanyWelcomeSkeleton` | [x] | [x] | [x] | [x] |
| `DashboardAlertsSkeleton` | [x] | [x] | [x] | [x] |
| `DashboardAlerts` | [x] | [x] | [x] | [x] |
| `DashboardKPISkeleton` | [x] | [x] | [x] | [x] |
| `DashboardKPI` | [x] | [x] | [x] | [x] |
| `CompanyInfoCardSkeleton` | [x] | [x] | [x] | [x] |
| `CompanyInfoCard` | [x] | [x] | [x] | [x] |
| `RootDashboardSkeleton` | [x] | [x] | [x] | [x] |
| `RootDashboard` | [x] | [x] | [x] | [x] |

### Permissions
| Component | Responsive | Color Tokens | UX Helpers | Viewport dvh |
| :--- | :---: | :---: | :---: | :---: |
| `PermissionsDashboard` | [x] | [x] | [x] | [x] |
| `PermissionsUserManager` | [x] | [x] | [x] | [x] |
| `PermissionsEntityManager` | [x] | [x] | [x] | [x] |
| `PermissionRowItem` | [x] | [x] | [x] | [x] |
| `UserSelector` | [x] | [x] | [x] | [x] |
| `PermissionSelector` | [x] | [x] | [x] | [x] |
| `PermissionsDashboardSkeleton` | [x] | [x] | [x] | [x] |
| `PermissionManagerSkeleton` | [x] | [x] | [x] | [x] |
| `UserSelectorSkeleton` | [x] | [x] | [x] | [x] |
| `PermissionSelectorSkeleton` | [x] | [x] | [x] | [x] |
| `EmptyState` | [x] | [x] | [x] | [x] |

### Extendidos
| Component | Responsive | Color Tokens | UX Helpers | Viewport dvh |
| :--- | :---: | :---: | :---: | :---: |
| `ExtendidoDashboardSkeleton` | [x] | [x] | [x] | [x] |
| `ExtendidoDataTable` | [x] | [x] | [x] | [x] |
| `ExtendidosForm` | [x] | [x] | [x] | [x] |
| `ExtendidoKPIs` | [x] | [x] | [x] | [x] |
| `ExtendidoDashboard` | [x] | [x] | [x] | [x] |
| `ExtendidoView` | [x] | [x] | [x] | [x] |
| `ExtendidosSelector` | [x] | [x] | [x] | [x] |
| `EmptyState` | [x] | [x] | [x] | [x] |

### Users
| Component | Responsive | Color Tokens | UX Helpers | Viewport dvh |
| :--- | :---: | :---: | :---: | :---: |
| `UsersDashboardSkeleton` | [x] | [x] | [x] | [x] |
| `UsersDataTable` | [x] | [x] | [x] | [x] |
| `UserForm` | [x] | [x] | [x] | [x] |
| `UserKPIs` | [x] | [x] | [x] | [x] |
| `UsersDashboard` | [x] | [x] | [x] | [x] |
| `UserProfileEdit` | [x] | [x] | [x] | [x] |
| `UserProfileInfo` | [x] | [x] | [x] | [x] |
| `UserMenu` | [x] | [x] | [x] | [x] |
| `FullNameCell` | [x] | [x] | [x] | [x] |
| `StatusCell` | [x] | [x] | [x] | [x] |
| `ChangePasswordForm` | [x] | [x] | [x] | [x] |

## Providers

| Component | Responsive | Color Tokens | UX Helpers | Viewport dvh |
| :--- | :---: | :---: | :---: | :---: |
| `AppProviders` | [x] | [x] | [x] | [x] |
| `ReactClientProvider` | [x] | [x] | [x] | [x] |
| `ThemeProvider` | [x] | [x] | [x] | [x] |
| `AuthProvider` | [x] | [x] | [x] | [x] |
| `ErrorProvider` | [x] | [x] | [x] | [x] |
