import { Command, CommandRunner } from 'nest-commander';
import { Injectable } from '@nestjs/common';
import { BatchService } from './batch.service';

@Injectable()
@Command({ name: 'batch:run', description: '배치 작업 수동 실행' })
export class BatchRunCommand extends CommandRunner {
  constructor(private readonly batchService: BatchService) {
    super();
  }

  async run(): Promise<void> {
    await this.batchService.runEveryMinuteBatch();
  }
}
