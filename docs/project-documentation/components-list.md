# Frontend Components Registry & QA Review

This document tracks all React components within the `apps/frontend/src` directory, ensuring they meet the project's enterprise standards for responsiveness, color token usage, and UX accessibility helpers.

## Review Criteria

| Criterion | Description |
| :--- | :--- |
| **Responsive** | Component follows a high-density mobile-first approach (zero-scroll goal). Shrinks gaps, padding, and icons on smartphones while using Tailwind breakpoints for Tablet/Desktop. |
| **Color Tokens** | Component strictly uses theme variables/tokens (e.g., `text-foreground`, `bg-primary/10`, `border-border/60`) and avoids hardcoded hex/RGB/HSL colors. |
| **UX Helpers** | Component implements Tooltips for icon-only actions, `aria-label` for screen readers, and `FormDescription` for complex input guidance. |
| **Viewport dvh** | Component uses dynamic viewport height units (`dvh`) where full-screen or screen-relative height is required, avoiding `100vh` cutoffs on mobile. |

---

## Pages and Layouts

| Component | Responsive | Color Tokens | UX Helpers | Viewport dvh |
| :--- | :---: | :---: | :---: | :---: |
| `AuthLayout` | [ ] | [ ] | [ ] | [ ] |
| `LoginPage` | [ ] | [ ] | [ ] | [ ] |
| `RegisterPage` | [ ] | [ ] | [ ] | [ ] |
| `CatchAllPage` | [ ] | [ ] | [ ] | [ ] |
| `DashboardLayout` | [x] | [ ] | [ ] | [ ] |
| `Loading` | [ ] | [ ] | [ ] | [ ] |
| `NotFound` | [ ] | [ ] | [ ] | [ ] |
| `DashboardPage` | [ ] | [ ] | [ ] | [ ] |
| `UsersPage` | [ ] | [ ] | [ ] | [ ] |
| `RootLayout` | [ ] | [ ] | [ ] | [ ] |

## Common Components

| Component | Responsive | Color Tokens | UX Helpers | Viewport dvh |
| :--- | :---: | :---: | :---: | :---: |
| `ComingSoonPage` | [ ] | [ ] | [ ] | [ ] |
| `DashboardProtectedLayout` | [ ] | [ ] | [ ] | [ ] |
| `DatabaseUnavailablePage` | [ ] | [ ] | [ ] | [ ] |
| `LoadingSpinner` | [ ] | [ ] | [ ] | [ ] |
| `NotFoundPage` | [ ] | [ ] | [ ] | [ ] |
| `PendingPermissionsPage` | [ ] | [ ] | [ ] | [ ] |
| `ThemeToggle` | [ ] | [ ] | [ ] | [ ] |
| `Logo` | [ ] | [ ] | [ ] | [ ] |
| `DeleteDialog` | [ ] | [ ] | [ ] | [ ] |
| `EditDialog` | [ ] | [ ] | [ ] | [ ] |
| `ExportDropdown` | [ ] | [ ] | [ ] | [ ] |
| `FloatingActionButton` | [ ] | [ ] | [ ] | [ ] |
| `SlideOverForm` | [x] | [ ] | [ ] | [x] |

## Data Display Components

| Component | Responsive | Color Tokens | UX Helpers | Viewport dvh |
| :--- | :---: | :---: | :---: | :---: |
| `DataTableFacetedFilter` | [ ] | [ ] | [ ] | [ ] |
| `DataTableSkeleton` | [ ] | [ ] | [ ] | [ ] |
| `DataTable` | [x] | [x] | [ ] | [x] |
| `SortableHeader` | [ ] | [ ] | [ ] | [ ] |
| `StatusBadge` | [ ] | [ ] | [ ] | [ ] |
| `InlineEditRow` | [ ] | [ ] | [ ] | [ ] |
| `FeatureCardSkeleton` | [ ] | [ ] | [ ] | [ ] |
| `FeatureCard` | [ ] | [ ] | [ ] | [ ] |
| `KPICardSkeleton` | [x] | [ ] | [ ] | [ ] |
| `KPICard` | [x] | [ ] | [ ] | [ ] |

## Error Handling Components

| Component | Responsive | Color Tokens | UX Helpers | Viewport dvh |
| :--- | :---: | :---: | :---: | :---: |
| `ErrorBoundary` | [ ] | [ ] | [ ] | [ ] |
| `FormErrorHandler` | [ ] | [ ] | [ ] | [ ] |

## Layout Components

| Component | Responsive | Color Tokens | UX Helpers | Viewport dvh |
| :--- | :---: | :---: | :---: | :---: |
| `DashboardHeader` | [x] | [ ] | [ ] | [ ] |
| `DesktopSidebar` | [x] | [ ] | [ ] | [ ] |
| `MobileNavigation` | [x] | [ ] | [ ] | [x] |
| `ExtendidoDashboard` | [x] | [ ] | [ ] | [ ] |
| `ExtendidoDataTable` | [ ] | [ ] | [ ] | [ ] |
| `ExtendidosForm` | [ ] | [ ] | [ ] | [ ] |
| `ExtendidoDashboardSkeleton` | [ ] | [ ] | [ ] | [ ] |
| `ExtendidoView` | [x] | [ ] | [ ] | [ ] |

## UI Primitives (shadcn/ui)

| Component | Responsive | Color Tokens | UX Helpers | Viewport dvh |
| :--- | :---: | :---: | :---: | :---: |
| `AlertDialog` | [ ] | [ ] | [ ] | [ ] |
| `Alert` | [ ] | [ ] | [ ] | [ ] |
| `Avatar` | [ ] | [ ] | [ ] | [ ] |
| `Badge` | [ ] | [ ] | [ ] | [ ] |
| `Button` | [ ] | [ ] | [ ] | [ ] |
| `Card` | [ ] | [ ] | [ ] | [ ] |
| `Checkbox` | [ ] | [ ] | [ ] | [ ] |
| `Command` | [ ] | [ ] | [ ] | [ ] |
| `Dialog` | [ ] | [ ] | [ ] | [ ] |
| `DropdownMenu` | [ ] | [ ] | [ ] | [ ] |
| `Form` | [ ] | [ ] | [ ] | [ ] |
| `Input` | [ ] | [ ] | [ ] | [ ] |
| `Label` | [ ] | [ ] | [ ] | [ ] |
| `Popover` | [ ] | [ ] | [ ] | [ ] |
| `Progress` | [ ] | [ ] | [ ] | [ ] |
| `ScrollArea` | [ ] | [ ] | [ ] | [ ] |
| `Select` | [ ] | [ ] | [ ] | [ ] |
| `Separator` | [ ] | [ ] | [ ] | [ ] |
| `Sheet` | [ ] | [ ] | [ ] | [ ] |
| `Skeleton` | [ ] | [ ] | [ ] | [ ] |
| `Toaster` | [ ] | [ ] | [ ] | [ ] |
| `Table` | [ ] | [ ] | [ ] | [ ] |

## Feature Components

### Audit Logs
| Component | Responsive | Color Tokens | UX Helpers | Viewport dvh |
| :--- | :---: | :---: | :---: | :---: |
| `AuditLogDashboard` | [x] | [ ] | [ ] | [ ] |
| `AuditLogDashboardSkeleton` | [ ] | [ ] | [ ] | [ ] |
| `AuditLogDataTable` | [ ] | [ ] | [ ] | [ ] |
| `AuditLogForm` | [ ] | [ ] | [ ] | [ ] |

### Auth
| Component | Responsive | Color Tokens | UX Helpers | Viewport dvh |
| :--- | :---: | :---: | :---: | :---: |
| `AuthSkeleton` | [ ] | [ ] | [ ] | [ ] |
| `AuthDashboard` | [ ] | [ ] | [ ] | [ ] |
| `LoginForm` | [ ] | [ ] | [ ] | [ ] |
| `RegisterForm` | [ ] | [ ] | [ ] | [ ] |
| `RegisterLoading` | [ ] | [ ] | [ ] | [ ] |
| `LoginLoading` | [ ] | [ ] | [ ] | [ ] |

### Entities
| Component | Responsive | Color Tokens | UX Helpers | Viewport dvh |
| :--- | :---: | :---: | :---: | :---: |
| `EntityCreateForm` | [ ] | [ ] | [ ] | [ ] |
| `EntityDashboardSkeleton` | [ ] | [ ] | [ ] | [ ] |
| `EntityDataTable` | [ ] | [ ] | [ ] | [ ] |
| `EntitiesKPIs` | [ ] | [ ] | [ ] | [ ] |
| `EntityDashboard` | [x] | [ ] | [ ] | [ ] |

### Dashboard
| Component | Responsive | Color Tokens | UX Helpers | Viewport dvh |
| :--- | :---: | :---: | :---: | :---: |
| `CompanyWelcome` | [x] | [ ] | [ ] | [ ] |
| `CompanyWelcomeSkeleton` | [ ] | [ ] | [ ] | [ ] |
| `DashboardAlertsSkeleton` | [ ] | [ ] | [ ] | [ ] |
| `DashboardAlerts` | [x] | [ ] | [ ] | [ ] |
| `DashboardKPISkeleton` | [x] | [ ] | [ ] | [ ] |
| `DashboardKPI` | [x] | [ ] | [ ] | [ ] |
| `CompanyInfoCardSkeleton` | [ ] | [ ] | [ ] | [ ] |
| `CompanyInfoCard` | [ ] | [ ] | [ ] | [ ] |
| `RootDashboardSkeleton` | [ ] | [ ] | [ ] | [ ] |
| `RootDashboard` | [x] | [ ] | [ ] | [x] |

### Permissions
| Component | Responsive | Color Tokens | UX Helpers | Viewport dvh |
| :--- | :---: | :---: | :---: | :---: |
| `PermissionsDashboard` | [x] | [ ] | [ ] | [ ] |
| `PermissionsUserManager` | [ ] | [ ] | [ ] | [ ] |
| `PermissionsEntityManager` | [ ] | [ ] | [ ] | [ ] |
| `PermissionRowItem` | [ ] | [ ] | [ ] | [ ] |
| `UserSelector` | [ ] | [ ] | [ ] | [ ] |
| `PermissionSelector` | [ ] | [ ] | [ ] | [ ] |
| `PermissionsDashboardSkeleton` | [ ] | [ ] | [ ] | [ ] |
| `PermissionManagerSkeleton` | [ ] | [ ] | [ ] | [ ] |
| `UserSelectorSkeleton` | [ ] | [ ] | [ ] | [ ] |
| `PermissionSelectorSkeleton` | [ ] | [ ] | [ ] | [ ] |
| `EmptyState` | [ ] | [ ] | [ ] | [ ] |

### Extendidos
| Component | Responsive | Color Tokens | UX Helpers | Viewport dvh |
| :--- | :---: | :---: | :---: | :---: |
| `ExtendidoDashboardSkeleton` | [ ] | [ ] | [ ] | [ ] |
| `ExtendidoDataTable` | [ ] | [ ] | [ ] | [ ] |
| `ExtendidosViewForm` | [ ] | [ ] | [ ] | [ ] |
| `ExtendidosEditForm` | [ ] | [ ] | [ ] | [ ] |
| `ExtendidoKPIs` | [ ] | [ ] | [ ] | [ ] |
| `ExtendidoDashboard` | [ ] | [ ] | [ ] | [ ] |
| `ExtendidoView` | [ ] | [ ] | [ ] | [ ] |
| `EmptyState` | [ ] | [ ] | [ ] | [ ] |

## Users
| Component | Responsive | Color Tokens | UX Helpers | Viewport dvh |
| :--- | :---: | :---: | :---: | :---: |
| `UsersDashboardSkeleton` | [ ] | [ ] | [ ] | [ ] |
| `UsersDataTable` | [ ] | [ ] | [ ] | [ ] |
| `UserForm` | [ ] | [ ] | [ ] | [ ] |
| `UserKPIs` | [x] | [ ] | [ ] | [ ] |
| `UsersDashboard` | [x] | [ ] | [ ] | [ ] |
| `UserProfileEdit` | [ ] | [ ] | [ ] | [ ] |
| `UserProfileInfo` | [ ] | [ ] | [ ] | [ ] |
| `UserMenu` | [ ] | [ ] | [ ] | [ ] |
| `FullNameCell` | [ ] | [ ] | [ ] | [ ] |
| `StatusCell` | [ ] | [ ] | [ ] | [ ] |
| `CreatedAtCell` | [ ] | [ ] | [ ] | [ ] |
| `ChangePasswordForm` | [ ] | [ ] | [ ] | [ ] |

## Providers

| Component | Responsive | Color Tokens | UX Helpers | Viewport dvh |
| :--- | :---: | :---: | :---: | :---: |
| `AppProviders` | [ ] | [ ] | [ ] | [ ] |
| `ReactClientProvider` | [ ] | [ ] | [ ] | [ ] |
| `ThemeProvider` | [ ] | [ ] | [ ] | [ ] |
| `AuthProvider` | [ ] | [ ] | [ ] | [ ] |
| `ErrorProvider` | [ ] | [ ] | [ ] | [ ] |
