import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Task } from './task.entity';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { TaskStepResult } from './task-step-result.entity';
import { TaskStepResultService } from './task-step-result.service';

@Module({
  imports: [MikroOrmModule.forFeature([Task, TaskStepResult])],
  controllers: [TaskController],
  providers: [TaskService, TaskStepResultService],
  exports: [TaskService, TaskStepResultService],
})
export class TaskModule {}
