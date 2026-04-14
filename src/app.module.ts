import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BatchService } from './batch/batch.service';
import { CommandRunnerService } from './batch/command-runner.service';
import { DatabaseModule } from './libs/database/database.module';
import { TaskModule } from './task/task.module';

@Module({
  imports: [DatabaseModule, ScheduleModule.forRoot(), TaskModule],
  controllers: [AppController],
  providers: [AppService, BatchService, CommandRunnerService],
})
export class AppModule {}
