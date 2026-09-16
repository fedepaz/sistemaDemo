fix(frontend): add canExecute to DataTable action column guards

The action column header and cell guards checked canView, canEdit,
and canDelete but not canExecute. For PROCESS entities where the
user only has create permission, the entire action cell returned
null before the execute button could render.
