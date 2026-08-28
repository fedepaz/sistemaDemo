test(frontend): fix siembra component tests missing mocks

Mock @/features/permissions, react-hook-form, and EmployeeSearch in
siembra-data-table tests to prevent useSuspenseQuery and infinite
re-render loops. Add QueryClientProvider wrapper to siembra-edit-form
tests. Extract renderForm helper to reduce boilerplate.
