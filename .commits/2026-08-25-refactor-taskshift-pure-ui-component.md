refactor(taskshift): convert to pure UI component for siembra integration

TaskShift is now a controlled component (like EmployeeSearch) that accepts
props and calls callbacks. The siembra form manages state and syncs to
form fields via useEffect. Removed standalone create mutation since
backend will handle taskShift creation in combined endpoint.
