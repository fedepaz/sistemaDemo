// app/modules/users/users.controller.ts

import { Body, Controller, Get, Patch, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserProfileDto, UpdateUserProfileSchema } from '@vivero/shared';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation-pipe';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get('me')
  getMe(@Req() req: Request) {
    return this.service.getProfile(req.user.id);
  }

  @Patch('me')
  updateProfile(
    @Req() req: Request,
    @Body(new ZodValidationPipe(UpdateUserProfileSchema))
    body: UpdateUserProfileDto,
  ) {
    return this.service.updateProfile(req.user.id, body);
  }
}
