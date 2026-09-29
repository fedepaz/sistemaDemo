import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthController } from '../../../src/modules/auth/auth.controller';
import { AuthService } from '../../../src/modules/auth/auth.service';
import { UsersController } from '../../../src/modules/users/users.controller';
import { UsersService } from '../../../src/modules/users/users.service';
import { EntitiesController } from '../../../src/modules/entities/entities.controller';
import { EntitiesService } from '../../../src/modules/entities/entities.service';
import { ProgramacionSiembraController } from '../../../src/modules/legacy/programacionSiembra/programacionSiembra.controller';
import { ProgramacionSiembraService } from '../../../src/modules/legacy/programacionSiembra/programacionSiembra.service';
import { PermissionsController } from '../../../src/modules/permissions/permissions.controller';
import { PermissionsService } from '../../../src/modules/permissions/permissions.service';
import { TenantsService } from '../../../src/modules/tenants/tenants.service';
import { AlertsController } from '../../../src/modules/legacy/alerts/alerts.controller';
import { AlertsService } from '../../../src/modules/legacy/alerts/alerts.service';
import { TaskShiftsController } from '../../../src/modules/taskShifts/taskShifts.controller';
import { TaskShiftsService } from '../../../src/modules/taskShifts/taskShifts.service';
import { AlertSolvedController } from '../../../src/modules/alertSolved/alertSolved.controller';
import { AlertSolvedService } from '../../../src/modules/alertSolved/alertSolved.service';
import { BillboardController } from '../../../src/modules/billboard/billboard.controller';
import { BillboardService } from '../../../src/modules/billboard/billboard.service';
import { MezclaController } from '../../../src/modules/mezcla/mezcla.controller';
import { MezclaService } from '../../../src/modules/mezcla/mezcla.service';
import { SiembraPartidasController } from '../../../src/modules/siembraPartidas/siembraPartidas.controller';
import { SiembraPartidasService } from '../../../src/modules/siembraPartidas/siembraPartidas.service';
import { SustratosController } from '../../../src/modules/sustratos/sustratos.controller';
import { SustratosService } from '../../../src/modules/sustratos/sustratos.service';
import { AuditLogController } from '../../../src/modules/auditLog/auditLog.controller';
import { AuditLogService } from '../../../src/modules/auditLog/auditLog.service';
import { MockAuthGuard, MockPermissionsGuard } from './mock-guards';
import {
  createAuthMock,
  createUsersMock,
  createEntitiesMock,
  createProgramacionSiembraMock,
  createPermissionsMock,
  createTenantsMock,
  createAlertsMock,
  createTaskShiftsMock,
  createAlertSolvedMock,
  createBillboardMock,
  createMezclaMock,
  createSiembraPartidasMock,
  createSustratosMock,
  createAuditLogMock,
} from './mock-factories';

export interface ServiceOverrides {
  auth?: ReturnType<typeof createAuthMock>;
  users?: ReturnType<typeof createUsersMock>;
  entities?: ReturnType<typeof createEntitiesMock>;
  programacionSiembra?: ReturnType<typeof createProgramacionSiembraMock>;
  permissions?: ReturnType<typeof createPermissionsMock>;
  tenants?: ReturnType<typeof createTenantsMock>;
  alerts?: ReturnType<typeof createAlertsMock>;
  taskShifts?: ReturnType<typeof createTaskShiftsMock>;
  alertSolved?: ReturnType<typeof createAlertSolvedMock>;
  billboard?: ReturnType<typeof createBillboardMock>;
  mezcla?: ReturnType<typeof createMezclaMock>;
  siembraPartidas?: ReturnType<typeof createSiembraPartidasMock>;
  sustratos?: ReturnType<typeof createSustratosMock>;
  auditLog?: ReturnType<typeof createAuditLogMock>;
}

export async function createTestApp(
  overrides?: ServiceOverrides,
): Promise<INestApplication> {
  const authMock = overrides?.auth ?? createAuthMock();
  const usersMock = overrides?.users ?? createUsersMock();
  const entitiesMock = overrides?.entities ?? createEntitiesMock();
  const programacionSiembraMock =
    overrides?.programacionSiembra ?? createProgramacionSiembraMock();
  const permissionsMock = overrides?.permissions ?? createPermissionsMock();
  const tenantsMock = overrides?.tenants ?? createTenantsMock();
  const alertsMock = overrides?.alerts ?? createAlertsMock();
  const taskShiftsMock = overrides?.taskShifts ?? createTaskShiftsMock();
  const alertSolvedMock = overrides?.alertSolved ?? createAlertSolvedMock();
  const billboardMock = overrides?.billboard ?? createBillboardMock();
  const mezclaMock = overrides?.mezcla ?? createMezclaMock();
  const siembraPartidasMock =
    overrides?.siembraPartidas ?? createSiembraPartidasMock();
  const sustratosMock = overrides?.sustratos ?? createSustratosMock();
  const auditLogMock = overrides?.auditLog ?? createAuditLogMock();

  const module: TestingModule = await Test.createTestingModule({
    controllers: [
      AuthController,
      UsersController,
      EntitiesController,
      ProgramacionSiembraController,
      PermissionsController,
      AlertsController,
      TaskShiftsController,
      AlertSolvedController,
      BillboardController,
      MezclaController,
      SiembraPartidasController,
      SustratosController,
      AuditLogController,
    ],
    providers: [
      { provide: APP_GUARD, useClass: MockAuthGuard },
      { provide: APP_GUARD, useClass: MockPermissionsGuard },
      { provide: AuthService, useValue: authMock },
      { provide: UsersService, useValue: usersMock },
      { provide: EntitiesService, useValue: entitiesMock },
      {
        provide: ProgramacionSiembraService,
        useValue: programacionSiembraMock,
      },
      { provide: PermissionsService, useValue: permissionsMock },
      { provide: TenantsService, useValue: tenantsMock },
      { provide: AlertsService, useValue: alertsMock },
      { provide: TaskShiftsService, useValue: taskShiftsMock },
      { provide: AlertSolvedService, useValue: alertSolvedMock },
      { provide: BillboardService, useValue: billboardMock },
      { provide: MezclaService, useValue: mezclaMock },
      { provide: SiembraPartidasService, useValue: siembraPartidasMock },
      { provide: SustratosService, useValue: sustratosMock },
      { provide: AuditLogService, useValue: auditLogMock },
    ],
  }).compile();

  const app = module.createNestApplication();
  await app.init();
  return app;
}
