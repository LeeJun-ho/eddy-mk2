import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { join } from 'node:path';
import { CommandRunnerService } from './command-runner.service';

@Injectable()
export class BatchService {
  private readonly logger = new Logger(BatchService.name);
  constructor(private readonly commandRunner: CommandRunnerService) {}

  // 매분 실행되는 기본 배치 예시
  @Cron(CronExpression.EVERY_HOUR)
  async runEveryMinuteBatch(): Promise<void> {
    this.logger.log('스케줄 배치 실행 시작');

    const scriptPath = join(process.cwd(), 'scripts', 'claude-usage.sh');
    const { code, stdout, stderr } = await this.commandRunner.run(
      'bash',
      [scriptPath],
      { timeoutMs: 30_000 },
    );

    if (stdout) {
      this.logger.log(`script stdout: ${stdout}`);
    }
    if (stderr) {
      this.logger.warn(`script stderr: ${stderr}`);
    }
    if (code !== 0) {
      this.logger.error(`스크립트 종료 코드 비정상: ${code}`);
    }

    this.logger.log('스케줄 배치 실행 완료');
  }
}
