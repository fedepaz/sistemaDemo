# Documentation Update Proposal

## 1. Update `docs/agents/backend-agent.md`

**Goal:** Document the new `PermissionType` logic in the Security Implementation Requirements section.

**Proposed Change:**
Add the following subsection under **Security Implementation Requirements**:

```markdown
### Permission Types & Enforcement

The permission system now supports distinct **Permission Types** defined in `MANAGED_ENTITIES` to enforce business logic constraints:

- **CRUD**: Standard Create, Read, Update, Delete access.
- **READ_ONLY**: Strictly limits access to `read` actions only. Useful for reference data (e.g., `agentes`, `tenants`).
- **PROCESS**: Specialized for executable actions. Maps `create` permission to process execution.

**Enforcement Logic:**
The `PermissionsService` validates the requested action against the entity's `permissionType`:
- If `permissionType` is `READ_ONLY`, only `read` actions are allowed.
- If `permissionType` is `PROCESS`, logic typically restricts to `create` (execution) or `read` (logs).
```

## 2. Update `docs/project-documentation/backend-features.md`

**Goal:** Reflect the implementation of Permission Types and the updated Audit Log scope.

**Proposed Change:**
Update the **Permissions Module** section:

```markdown
### Permissions Module
- [x] **Permissions Guard**: `PermissionsGuard` + `@RequirePermission()` decorator.
- [x] **Permission Types**: Support for `CRUD`, `READ_ONLY`, and `PROCESS` types to constrain allowable actions.
- [x] **Resource-Level Security**: Validation against `ALLOWED_TABLES` in `MANAGED_ENTITIES`.
- [x] **CRUD & Scope Check**: Logic for `canCreate`, `canRead`, etc., and `OWN` vs `ALL` scopes.
- [x] **Admin Management**: `PATCH /user/:userId` to update permissions.
```

And update the **Legacy Agentes Module** (or Audit Log) if necessary to reflect the `agentes` resource usage, though I will keep that minimal unless you prefer otherwise.
