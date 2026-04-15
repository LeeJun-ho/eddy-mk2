import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { BatchService } from './batch/batch.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly batchService: BatchService,
  ) {}

  @Post('batch/run')
  async runBatch(): Promise<void> {
    return this.batchService.runEveryMinuteBatch();
  }
}
