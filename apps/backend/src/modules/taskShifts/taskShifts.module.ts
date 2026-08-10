// src/modules/taskShifts/taskShifts.module.ts

import { Module } from '@nestjs/common';
import { TaskShiftsController } from './taskShifts.controller';
import { TaskShiftsService } from './taskShifts.service';
import { TaskShiftsRepository } from './repositories/taskShifts.repository';

@Module({
  controllers: [TaskShiftsController],
  providers: [TaskShiftsService, TaskShiftsRepository],
  exports: [TaskShiftsService, TaskShiftsRepository],
})
export class TaskShiftsModule {}
