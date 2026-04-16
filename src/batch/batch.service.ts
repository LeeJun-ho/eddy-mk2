import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { join } from 'node:path';
import { readFileSync, existsSync } from 'node:fs';
import { CreateRequestContext, MikroORM } from '@mikro-orm/core';
import { CommandRunnerService } from './command-runner.service';
import { TaskService } from '../task/task.service';
import { Task } from '../task/task.entity';
import { TaskStep, TaskType } from '../task/task.enum';
import { TaskStepResultService } from '../task/task-step-result.service';

@Injectable()
export class BatchService {
  private readonly logger = new Logger(BatchService.name);
  private readonly claudeWorkingDirectory = '/Users/gk/workspace/votoolab/votoolab-crm-backend_';

  constructor(
    private readonly orm: MikroORM,
    private readonly commandRunner: CommandRunnerService,
    private readonly taskService: TaskService,
    private readonly taskStepResultService: TaskStepResultService,
  ) {}

  @CreateRequestContext()
  @Cron(CronExpression.EVERY_HOUR)
  async runEveryMinuteBatch(): Promise<void> {
    this.logger.log('스케줄 배치 실행 시작');

    // 대기 중인 작업 중 우선순위가 높고 먼저 등록된 순으로 하나를 조회
    const task = await this.taskService.findOneNextPendingTask();
    if (!task) {
      this.logger.warn('대기 중인 작업이 없습니다.');
      return;
    }
    this.logger.log(`작업 선택됨: #${task.id} - ${task.title}`);

    // 클로드 세션 사용량 확인
    const { sessionUsedPercent, isRun } = await this.getClaudeSessionUsage();
    if (!isRun) {
      this.logger.warn(`이용량이 ${sessionUsedPercent ?? '-'}%로 기준값보다 높으므로 배치 작업을 중단합니다.`);
      return;
    }
    this.logger.log(`이용량 ${sessionUsedPercent ?? '-'}%로 기준값보다 낮으므로 다음 명령 실행.`);

    // 작업 실행
    try {
      if (task.type === TaskType.SIMPLE) {
        await this.runSimpleTask(task);
      } else {
        await this.runStepTask(task);
      }
    } catch (err) {
      this.logger.error(`작업 실행 중 오류: ${err}`);
      await this.taskService.failTask(task);
    }

    // 배치 실행 완료
    this.logger.log('스케줄 배치 실행 완료');
  }

  /**
   * 클로드 세션 사용량 확인
   */
  private async getClaudeSessionUsage(): Promise<{ sessionUsedPercent: number | undefined; isRun: boolean }> {
    const scriptPath = join(process.cwd(), 'scripts', 'claude-usage.sh');
    const { stdout } = await this.commandRunner.run('bash', [scriptPath], {
      timeoutMs: 30_000,
    });

    let sessionUsedPercent: number | undefined = undefined;
    let isRun = false;

    if (stdout) {
      this.logger.log(`script stdout: ${stdout}`);
      try {
        const json = JSON.parse(stdout);
        const usedPercent = json?.current_session?.used_percent;
        if (typeof usedPercent === 'number') {
          sessionUsedPercent = usedPercent;
          isRun = usedPercent < 80;
        } else {
          this.logger.warn('current_session.used_percent 값을 찾을 수 없습니다.');
        }
      } catch (err) {
        this.logger.error(`stdout를 JSON으로 파싱하는 중 오류: ${err}`);
      }
    }

    return { sessionUsedPercent, isRun };
  }

  /**
   * 단순 작업 실행
   */
  private async runSimpleTask(task: Task): Promise<void> {
    this.logger.log(`[단순] 작업 #${task.id} 실행`);
    const { stdout } = await this.commandRunner.run(
      'claude',
      ['--dangerously-skip-permissions', '-p', task.description ?? task.title],
      { cwd: this.claudeWorkingDirectory, timeoutMs: 600_000 },
    );
    this.logger.log(`[단순] claude 응답: ${stdout}`);
  }

  /**
   * 단계별 작업 실행
   */
  private async runStepTask(task: Task): Promise<void> {
    this.logger.log(`[단계별] 작업 #${task.id} 실행`);

    const vars = {
      taskId: String(task.id),
      title: task.title,
      description: task.description ?? '',
    };

    // 작업 상태를 진행중으로 변경
    await this.taskService.startTask(task);

    // 작업 디렉토리 정리 (uncommitted 커밋, develop 브랜치 복귀)
    await this.cleanupWorkingDirectory();

    // SPEC 단계
    const specOk = await this.runClaudeStep(TaskStep.SPEC, vars, task, 600_000);
    if (!specOk) return;

    // PLAN 단계
    const planOk = await this.runClaudeStep(TaskStep.PLAN, vars, task, 600_000);
    if (!planOk) return;

    // DEVELOPMENT 단계
    await this.runClaudeStep(TaskStep.DEVELOPMENT, vars, task, 3_600_000);

    // 작업 상태를 완료로 변경
    // 브랜치를 확인해서 develop 브랜치가 아니면 실패
    const branch = await this.commandRunner.run('git', ['branch', '--show-current'], {
      cwd: this.claudeWorkingDirectory,
    });
    if (branch.stdout.trim() !== 'develop') {
      this.logger.error(`[단계별] 작업 완료 후 브랜치가 develop이 아닙니다: ${branch.stdout.trim()}`);
      await this.taskService.failTask(task);
      return;
    }

    // 브랜치를 확인해서 develop 브랜치면 성공
    await this.taskService.finishTask(task);
    this.logger.log(`[단계별] 작업 #${task.id} 완료`);
  }

  /**
   * 작업 디렉토리 정리 (uncommitted 커밋, develop 브랜치 복귀)
   */
  private async cleanupWorkingDirectory(): Promise<void> {
    this.logger.log(`[CLEANUP] 시작`);

    // uncommitted 변경사항이 있으면 커밋
    const status = await this.commandRunner.run('git', ['status', '--porcelain'], {
      cwd: this.claudeWorkingDirectory,
    });
    if (status.stdout.trim()) {
      await this.commandRunner.run('git', ['add', '.'], { cwd: this.claudeWorkingDirectory });
      await this.commandRunner.run('git', ['commit', '-m', '.'], { cwd: this.claudeWorkingDirectory });
      this.logger.log(`[CLEANUP] uncommitted 변경사항 커밋 완료`);
    }

    // develop 브랜치가 아니면 복귀
    const branch = await this.commandRunner.run('git', ['branch', '--show-current'], {
      cwd: this.claudeWorkingDirectory,
    });
    if (branch.stdout.trim() !== 'develop') {
      await this.commandRunner.run('git', ['checkout', 'develop'], { cwd: this.claudeWorkingDirectory });
      this.logger.log(`[CLEANUP] develop 브랜치로 전환 완료`);
    }

    this.logger.log(`[CLEANUP] 완료`);
  }

  /** 
   * 클로드 단계 실행(spec, plan, development)
   */
  private async runClaudeStep(
    step: TaskStep,
    vars: Record<string, string>,
    task: Task,
    timeoutMs: number,
  ): Promise<boolean> {
    this.logger.log(`[${step.toUpperCase()}] 시작`);
    const { stdout } = await this.commandRunner.run(
      'claude',
      ['--dangerously-skip-permissions', '-p', this.loadStepPrompt(step, vars)],
      { cwd: this.claudeWorkingDirectory, timeoutMs },
    );
    this.logger.log(`[${step.toUpperCase()}] 완료: ${stdout}`);

    if (step === TaskStep.DEVELOPMENT) {
      await this.taskStepResultService.create({
        task,
        step,
        stdout,
      });
      return true;
    }

    const outputPath = join(this.claudeWorkingDirectory, 'local', 'context', vars.taskId, `${step}.md`);
    const content = existsSync(outputPath) ? readFileSync(outputPath, 'utf-8') : undefined;

    await this.taskStepResultService.create({
      task,
      step,
      content,
      stdout,
    });

    if (!content?.trimEnd().endsWith('DONE')) {
      this.logger.error(`[${step.toUpperCase()}] 실패: 파일이 정상적으로 완료되지 않았습니다.`);
      await this.taskService.failTask(task);
      return false;
    }

    return true;
  }

  /**
   * 단계 프롬프트 로드
  */
  private loadStepPrompt(step: TaskStep, vars: Record<string, string>): string {
    const path = join(process.cwd(), 'docs', 'step', `${step}.md`);
    let template = readFileSync(path, 'utf-8');
    for (const [key, value] of Object.entries(vars)) {
      template = template.replaceAll(`{{${key}}}`, value);
    }
    return template.trim();
  }
}
