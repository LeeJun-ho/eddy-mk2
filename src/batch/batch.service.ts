import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class BatchService {
  private readonly logger = new Logger(BatchService.name);

  // 매분 실행되는 기본 배치 예시
  @Cron(CronExpression.EVERY_MINUTE)
  async runEveryMinuteBatch(): Promise<void> {
    this.logger.log('스케줄 배치 실행 시작');

    // TODO: 실제 배치 로직으로 교체
    await new Promise((resolve) => setTimeout(resolve, 300));

    this.logger.log('스케줄 배치 실행 완료');
  }
}
