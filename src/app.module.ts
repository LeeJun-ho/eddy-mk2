import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BatchService } from './batch/batch.service';
import { CommandRunnerService } from './batch/command-runner.service';
import { DatabaseModule } from '@libs/database/database.module';
import configuration from './config/configuration';
import { TaskModule } from './task/task.module';
import { BatchRunCommand } from './batch/batch-run.command';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    DatabaseModule,
    ScheduleModule.forRoot(),
    TaskModule,
  ],
  controllers: [AppController],
  providers: [AppService, BatchService, CommandRunnerService, BatchRunCommand],
})
export class AppModule {}
