# Frontend Components Registry & QA Review

> **📍 Source of truth**: `apps/frontend/components.json` now contains the definitive component registry with structured QA metadata. This markdown file is a human-readable reference; update both when reviewing components.

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
| `AuthLayout` | [x] | [x] | [ ] | [x] |
| `LoginPage` | [x] | [x] | [ ] | [x] |
| `RegisterPage` | [x] | [x] | [ ] | [x] |
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
| `Logo` | [x] | [x] | [ ] | [x] |
| `DeleteDialog` | [ ] | [ ] | [ ] | [ ] |
| `EditDialog` | [ ] | [ ] | [ ] | [ ] |
| `ExportDropdown` | [ ] | [ ] | [ ] | [ ] |
| `SlideOverForm` | [x] | [ ] | [ ] | [x] |

## Data Display Components

| Component | Responsive | Color Tokens | UX Helpers | Viewport dvh |
| :--- | :---: | :---: | :---: | :---: |
| `DataTableFacetedFilter` | [ ] | [ ] | [ ] | [ ] |
| `DataTableSkeleton` | [ ] | [ ] | [ ] | [ ] |
| `DataTable` | [x] | [x] | [x] | [x] |

### DataTable Memoization

`DataTable` is wrapped in `React.memo` — it skips re-renders when props
haven't changed. Feature data-tables must memoize callbacks with
`useCallback` to take advantage of this:

- `onView` — wrap with `useCallback`
- `onEdit` — wrap with `useCallback`
- `handleOpenChange` — wrap with `useCallback`
- `toolbarContent` — consider `useMemo` if complex

Without memoized callbacks, `React.memo` cannot prevent re-renders.

| `SortableHeader` | [ ] | [ ] | [ ] | [ ] |
| `StatusBadge` | [ ] | [ ] | [ ] | [ ] |
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
| `AuthHeader` | [x] | [x] | [x] | [x] |
| `DashboardHeader` | [x] | [x] | [x] | [x] |
| `DesktopSidebar` | [x] | [ ] | [ ] | [ ] |
| `MobileNavigation` | [x] | [ ] | [ ] | [x] |
| `ExtendidoDashboard` | [x] | [ ] | [ ] | [ ] |
| `ExtendidoDataTable` | [ ] | [ ] | [ ] | [ ] |
| `ExtendidosForm` | [ ] | [ ] | [ ] | [ ] |
| `ExtendidoDashboardSkeleton` | [ ] | [ ] | [ ] | [ ] |
| `ExtendidoView` | [x] | [ ] | [ ] | [ ] |

## Siembra
| Component | Responsive | Color Tokens | UX Helpers | Viewport dvh |
| :--- | :---: | :---: | :---: | :---: |
| `SiembraDashboardSkeleton` | [x] | [x] | [ ] | [ ] |
| `SiembraDataTable` | [x] | [x] | [x] | [x] |
| `SiembraEditForm` | [x] | [x] | [x] | [x] |
| `SiembraViewForm` | [x] | [x] | [x] | [x] |
| `SiembraView` | [x] | [x] | [x] | [ ] |
| `SiembraDashboard` | [x] | [x] | [x] | [x] |

### Alerts
| Component | Responsive | Color Tokens | UX Helpers | Viewport dvh |
| :--- | :---: | :---: | :---: | :---: |
| `AlertsDashboardV1` | [x] | [x] | [x] | [x] |
| `AlertsDashboardV2` | [x] | [x] | [x] | [ ] |
| `AlertDashboardSkeleton` | [x] | [x] | [x] | [ ] |
| `AlertSummaryCards` | [x] | [x] | [x] | [ ] |
| `AlertsDataTable` | [x] | [x] | [x] | [ ] |
| `FilterTabs` | [x] | [x] | [x] | [ ] |
| `SiembraRetrasadaCard` | [x] | [x] | [x] | [ ] |
| `FaltaGerminacionCard` | [x] | [x] | [x] | [ ] |
| `FaltantePlantasCard` | [x] | [x] | [x] | [ ] |
| `FaltaPreExpedicionCard` | [x] | [x] | [x] | [ ] |
| `NotificationCenter` | [x] | [x] | [x] | [ ] |

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
| `AuditLogDashboard` | [x] | [x] | [x] | [x] |
| `AuditLogDashboardSkeleton` | [x] | [x] | [ ] | [ ] |
| `AuditLogDataTable` | [x] | [x] | [x] | [x] |
| `AuditLogForm` | [x] | [x] | [x] | [x] |

### Auth
| Component | Responsive | Color Tokens | UX Helpers | Viewport dvh |
| :--- | :---: | :---: | :---: | :---: |
| `AuthSkeleton` | [x] | [x] | [x] | [x] |
| `AuthDashboard` | [x] | [x] | [ ] | [x] |
| `LoginForm` | [x] | [x] | [x] | [x] |
| `RegisterForm` | [x] | [x] | [x] | [x] |
| `RegisterLoading` | [x] | [x] | [x] | [x] |
| `LoginLoading` | [x] | [x] | [x] | [x] |

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
| `UserEditForm` | [ ] | [ ] | [ ] | [ ] |
| `UserKPIs` | [x] | [ ] | [ ] | [ ] |
| `UsersDashboard` | [x] | [ ] | [ ] | [ ] |
| `UserProfileEdit` | [ ] | [ ] | [ ] | [ ] |
| `UserProfileInfo` | [ ] | [ ] | [ ] | [ ] |
| `UserMenu` | [ ] | [ ] | [ ] | [ ] |
| `FullNameCell` | [ ] | [ ] | [ ] | [ ] |
| `StatusCell` | [ ] | [ ] | [ ] | [ ] |
| `CreatedAtCell` | [ ] | [ ] | [ ] | [ ] |
| `ChangePasswordForm` | [x] | [x] | [x] | [x] |

## Modals

| Component | Responsive | Color Tokens | UX Helpers | Viewport dvh |
| :--- | :---: | :---: | :---: | :---: |
| `AlertModalDialog` | [x] | [x] | [x] | [x] |

## Providers

| Component | Responsive | Color Tokens | UX Helpers | Viewport dvh |
| :--- | :---: | :---: | :---: | :---: |
| `AppProviders` | [ ] | [ ] | [ ] | [ ] |
| `ReactClientProvider` | [ ] | [ ] | [ ] | [ ] |
| `ThemeProvider` | [ ] | [ ] | [ ] | [ ] |
| `AuthProvider` | [ ] | [ ] | [ ] | [ ] |
| `ErrorProvider` | [ ] | [ ] | [ ] | [ ] |
| `AlertModalProvider` | — | [x] | [x] | — |
| `WizardModalProvider` | — | [x] | [x] | — |
