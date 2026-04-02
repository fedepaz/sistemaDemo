// src/modules/permissions/interfaces/permission.interface.ts

export interface IPermissionRepository {
  findManyByUserId(userId: string): Promise<UserPermissionRecord[]>;
  upsert(
    userId: string,
    entityId: string,
    data: Partial<{
      canCreate: boolean;
      canRead: boolean;
      canUpdate: boolean;
      canDelete: boolean;
      scope: 'NONE' | 'OWN' | 'ALL';
      permissionType: 'CRUD' | 'PROCESS' | 'READ_ONLY';
    }>,
  ): Promise<void>;
  deleteByUserIdTableName(userId: string, tableName: string): Promise<void>;
}

export interface UserPermissionRecord {
  userId: string;
  entityId: string;
  entityName: string;
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  scope: 'NONE' | 'OWN' | 'ALL';
  permissionType: 'CRUD' | 'PROCESS' | 'READ_ONLY';
  createdAt: Date;
}
