import { Controller, Get, Param } from '@nestjs/common';
import { RequirePermission } from '../../permissions/decorators/require-permission.decorator';
import { LegacySustratoService } from './sustrato.service';
import { LegacySustratoDto } from '@vivero/shared';

@Controller('l-sustrato')
export class LegacySustratoController {
  constructor(private readonly service: LegacySustratoService) {}

  @Get()
  @RequirePermission({
    tableName: 'user_profile',
    action: 'read',
    scope: 'OWN',
  })
  async getAllSustratos(): Promise<LegacySustratoDto[]> {
    return this.service.getAll();
  }

  @Get('/:codigo')
  @RequirePermission({
    tableName: 'user_profile',
    action: 'read',
    scope: 'OWN',
  })
  async getByCodigo(
    @Param('codigo') codigo: string,
  ): Promise<LegacySustratoDto> {
    return this.service.getByCodigo(codigo);
  }
}
