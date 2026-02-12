## Documentation Update Proposal for `agricultural-backend-agent.md`

### 1. Introduce `BaseRepository` Pattern

**Reasoning:** The project has introduced a `BaseRepository` pattern (e.g., `src/shared/baseModule/base.repository.ts`) to centralize common database operations and ensure multi-tenancy rules are consistently applied. This pattern significantly reduces boilerplate in individual repositories and enhances maintainability.

**Proposed Addition:** Add a new section, possibly under "Standard Development Workflow," or as a standalone "Repository Patterns" section, detailing the `BaseRepository`.

**Content:**
*   **Purpose:** Explain that `BaseRepository` abstracts common CRUD operations and enforces tenant-aware filtering.
*   **Usage:** Provide guidance on how new repositories should extend `BaseRepository<TEntity>` and how to utilize `this.model` for Prisma operations.
*   **Benefits:** Highlight reduced boilerplate, improved consistency, and easier enforcement of architectural patterns like multi-tenancy and soft-deletes.

**Example Snippet (to be included in documentation):**
```typescript
// src/shared/baseModule/base.repository.ts (Conceptual)
export abstract class BaseRepository<TEntity> {
  protected model: Prisma.ModelName; // Actual type would be more specific

  constructor(protected readonly prisma: PrismaService, model: Prisma.ModelName) {
    this.model = model;
  }

  // Common methods like findById, findAll, softDelete, etc.
  // These would include tenantId and isActive/deletedAt filtering by default.
  findById(id: string): Promise<TEntity | null> {
    return this.model.findFirst({
      where: { id, deletedAt: null, isActive: true },
    });
  }

  findAll(tenantId: string): Promise<TEntity[]> {
    return this.model.findMany({
      where: { tenantId, deletedAt: null, isActive: true },
    });
  }
}
```

```typescript
// app/modules/users/repositories/users.repository.ts (Example Extension)
import { BaseRepository } from 'src/shared/baseModule/base.repository';

@Injectable()
export class UsersRepository extends BaseRepository<User> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.user);
  }
  // Custom methods or overridden base methods
}
```

### 2. Document `recoverById` Method for Soft-Delete

**Reasoning:** The introduction of a `recoverById` method complements the soft-delete functionality, allowing for the re-activation of previously soft-deleted entities. This is an important part of the data management lifecycle.

**Proposed Addition:** Add a description of the `recoverById` method, ideally within the "Repository Patterns" section or where soft-delete mechanisms are discussed.

**Content:**
*   **Description:** Explain that `recoverById` is used to restore a soft-deleted entity by setting `deletedAt` to null and `isActive` to true.
*   **Usage:** Emphasize its role in data recovery and lifecycle management.

**Example Snippet (to be included in documentation):**
```typescript
// Example from UsersRepository
recoverById(id: string): Promise<User> {
  return this.model.update({
    where: { id },
    data: {
      deletedAt: null,
      isActive: true,
      updatedAt: new Date(),
    },
  });
}
```

### 3. Explicitly Mention `RequirePermission` Decorator

**Reasoning:** The `@RequirePermission` decorator is a critical component for implementing role-based or permission-based access control, as outlined in the "Enterprise Security & Compliance" section. Its explicit documentation will ensure consistent and correct usage.

**Proposed Addition:** Add a sub-section under "Enterprise Security & Compliance" -> "Security Implementation Requirements" or create a new dedicated section for "Access Control with `@RequirePermission`".

**Content:**
*   **Purpose:** Describe the decorator's role in enforcing fine-grained access control on controller endpoints.
*   **Usage:** Explain its parameters (`tableName`, `action`, `scope`) and how they map to the project's permission system.
*   **Best Practices:** Emphasize that all access control should primarily be managed via this decorator, avoiding redundant manual checks.

**Example Snippet (to be included in documentation):**
```typescript
// Example from UsersController
import { RequirePermission } from '../permissions/decorators/require-permission.decorator';

@Controller('users')
export class UsersController {
  // ...
  @Get('all')
  @RequirePermission({ tableName: 'users', action: 'read', scope: 'ALL' })
  async getAllUsers() {
    return this.service.getAllUsers();
  }

  @Patch(':userId/recover')
  @RequirePermission({ tableName: 'users', action: 'update', scope: 'ALL' })
  async recoverUserById(@Param('userId') userId: string) {
    return this.service.recoverUserById(userId);
  }
}
```

### Action Required:

Please confirm if these documentation updates align with the intended architectural and security standards.
