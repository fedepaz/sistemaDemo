// apps/frontend/src/features/permissions/types/types.ts
import { CRUD_COLUMNS } from "../constants/table-meta";

export type CrudColumn = (typeof CRUD_COLUMNS)[number];
