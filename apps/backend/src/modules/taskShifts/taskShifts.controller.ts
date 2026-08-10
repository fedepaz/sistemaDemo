// src/modules/taskShifts/taskShifts.controller.ts

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { TaskShiftsService } from './taskShifts.service';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation-pipe';
import { CurrentUser } from '../auth/decorators/current-user.decorators';
import { AuthUser } from '../auth/types/auth-user.type';
import {
  CreateTaskShiftSchema,
  CreateTaskShiftDto,
  UpdateTaskShiftSchema,
  UpdateTaskShiftDto,
} from '@vivero/shared';

@Controller('task-shifts')
export class TaskShiftsController {
  constructor(private readonly taskShiftsService: TaskShiftsService) {}

  @Get()
  getAllTaskShifts(@CurrentUser() user: AuthUser) {
    return this.taskShiftsService.getAllTaskShifts(user.id);
  }

  @Get(':id')
  getTaskShiftById(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.taskShiftsService.getTaskShiftById(id, user.id);
  }

  @Post()
  createTaskShift(
    @Body(new ZodValidationPipe(CreateTaskShiftSchema))
    dto: CreateTaskShiftDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.taskShiftsService.createTaskShift(dto, user.id);
  }

  @Patch(':id')
  updateTaskShift(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateTaskShiftSchema))
    dto: UpdateTaskShiftDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.taskShiftsService.updateTaskShift(id, dto, user.id);
  }

  @Delete(':id')
  softDeleteTaskShift(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.taskShiftsService.softDeleteTaskShift(id, user.id);
  }
}
