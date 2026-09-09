import { Body, Controller, Get, Post } from '@nestjs/common';
import { BillboardService } from './billboard.service';
import { RequirePermission } from '../permissions/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorators';
import { AuthUser } from '../auth/types/auth-user.type';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation-pipe';
import {
  BillboardMessageDto,
  MarkBillboardReadSchema,
  MarkBillboardReadDto,
} from '@vivero/shared';

@Controller('billboard')
export class BillboardController {
  constructor(private readonly service: BillboardService) {}

  @Get('unread')
  @RequirePermission({
    tableName: 'user_profile',
    action: 'read',
    scope: 'OWN',
  })
  async getUnread(
    @CurrentUser() user: AuthUser,
  ): Promise<BillboardMessageDto[]> {
    return this.service.getUnreadMessages(user.id);
  }

  @Post('read')
  @RequirePermission({
    tableName: 'user_profile',
    action: 'read',
    scope: 'OWN',
  })
  async markAsRead(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(MarkBillboardReadSchema))
    data: MarkBillboardReadDto,
  ): Promise<{ markedCount: number }> {
    const markedCount = await this.service.markAsRead(user.id, data.messageIds);
    return { markedCount };
  }
}
