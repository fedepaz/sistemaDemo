# Workflow for Updating a Feature's Data Table

This document outlines a generalized workflow to enhance a feature's data table with full create, edit, and delete functionality, including modal forms and integrated data mutation hooks, similar to the `invoices` feature's data table implementation. This workflow can be applied to any feature (e.g., `clients`, `plants`, `purchase-orders`, `users`).

## Prerequisites

- The feature already has a basic data table component (e.g., `apps/frontend/src/features/{feature_name}/components/{FeatureName}DataTable.tsx`).
- The feature has defined its types (e.g., `apps/frontend/src/features/{feature_name}/types.ts`).
- The feature has basic data fetching hooks (e.g., `apps/frontend/src/features/{feature_name}/hooks/hooks.ts`).

## Steps to Update the Data Table

### Step 1: Implement Form Component (`{FeatureName}Form`)

- **Action**: Create a new component `{feature_name}-form.tsx` directly inside `apps/frontend/src/features/{feature_name}/components/`.
- **Purpose**: This form will handle the input fields for creating and updating an entity within the feature.
- **Details**:
    - Create a new directory `apps/frontend/src/features/{feature_name}/components/{FeatureName}Form/` which will *only* contain the `messages` subdirectory for the form's translations.
    - It should use `react-hook-form` and `zodResolver` for form management and validation.
    - Define a Zod schema for `{FeatureName}FormData` and `Update{FeatureName}Dto` in `apps/frontend/src/features/{feature_name}/types.ts`.
    - Ensure all labels, placeholders, and button texts within the form use `useTranslations` for internationalization.

### Step 2: Implement Mutation Hooks

- **Action**: In `apps/frontend/src/features/{feature_name}/hooks/hooks.ts`, implement `useCreate{FeatureName}`, `useUpdate{FeatureName}`, and `useDelete{FeatureName}` using `react-query` (or `TanStack Query`).
- **Purpose**: These hooks will interact with the backend API for create, update, and delete operations related to the feature's entity.

### Step 3: Update Data Table Component (`{FeatureName}DataTable.tsx`)

- **Action**: Modify `apps/frontend/src/features/{feature_name}/components/{feature_name}-data-table.tsx`.
- **Details**:
    - Import `EntityModal` from `@/components/forms/entity-modal`.
    - Import the newly created `{FeatureName}Form` component (from `./{feature_name}-form`).
    - Import the mutation hooks (`useCreate{FeatureName}`, `useUpdate{FeatureName}`, `useDelete{FeatureName}`).
    - Modify the `useDataTableActions` hook call to include `entityName: "{FeatureName}s"` (plural) and `onDelete: (id) => delete{FeatureName}.mutateAsync(id)`.
    - Implement `handleCreateSubmit` and `handleEditSubmit` functions that call the respective mutation hooks and close the modals.
    - Add the `EntityModal` components for "Create" and "Edit" operations, passing the `{FeatureName}Form` and relevant props (`initialData`, `onSubmit`, `onCancel`, `isSubmitting`).

### Step 4: Update Columns Definition (`columns.tsx`)

- **Action**: Review and modify `apps/frontend/src/features/{feature_name}/components/columns.tsx`.
- **Details**:
    - Ensure that all column headers use `HeaderComponent` with the correct namespace (e.g., `useTranslations("{FeatureName}DataTable")`).
    - Ensure any status badges or other dynamic text within cells also use `useTranslations` with the appropriate keys.
    - If currency formatting is present, ensure it uses `useLocale` for dynamic locale-based formatting.

### Step 5: Update Translation Files

- **Action**: Create or update translation files for the new form component and any new keys introduced in the data table or columns.
- **Details**:
    - Create a `messages` directory inside `apps/frontend/src/features/{feature_name}/components/{FeatureName}Form/`.
    - Create `en.json`, `es.json`, and `it.json` files within this `messages` directory for the `{FeatureName}Form` component.
    - Add translation keys for all labels, placeholders, and button texts used in `{FeatureName}Form`.
    - Add any new translation keys identified in Step 3 and Step 4 to the existing `{FeatureName}DataTable` and `{FeatureName}Kpi` translation files (e.g., `en.json`, `es.json`, `it.json` in `apps/frontend/src/features/{feature_name}/components/{FeatureName}DataTable/messages/`).
    - Update `apps/frontend/src/i18n/request.ts` to import the new `{FeatureName}Form` translation files.

### Step 6: Verify Implementation

- **Action**: Run the application and thoroughly test the updated feature.
- **Details**:
    - Navigate to the feature's page (`http://localhost:3000/{locale}/{feature_name}`).
    - Test the "Add New" button to ensure the create modal opens and the form works correctly.
    - Test the "Edit" action for an existing entity to ensure the edit modal opens with pre-filled data and updates correctly.
    - Test the "Delete" action to confirm proper functionality.
    - Check the browser console for any `MISSING_MESSAGE` errors or other runtime errors.
    - Verify that all UI elements are correctly translated across all supported locales.
