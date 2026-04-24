import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { join } from 'node:path';
import { readFileSync, existsSync } from 'node:fs';
import { CreateRequestContext, MikroORM } from '@mikro-orm/core';
import { CommandRunnerService } from './command-runner.service';
import { TaskService } from '../task/task.service';
import { Task } from '../task/task.entity';
import { JiraCommentPrompt, StepPrompt, TaskStep, TaskType } from '../task/task.enum';
import { TaskStepResultService } from '../task/task-step-result.service';
import { JiraService } from '@libs/jira/jira.service';

/** Jira 티켓 검증 방식 */
export enum JiraTicketValidationType {
  PROMPT = 'prompt',
  API = 'api',
}

@Injectable()
export class BatchService {
  private readonly logger = new Logger(BatchService.name);
  private readonly workingDirectory: string;
  private readonly jiraActionType = JiraTicketValidationType.API;

  constructor(
    private readonly orm: MikroORM,
    private readonly commandRunner: CommandRunnerService,
    private readonly taskService: TaskService,
    private readonly taskStepResultService: TaskStepResultService,
    private readonly jiraService: JiraService,
    private readonly configService: ConfigService,
  ) {
    this.workingDirectory = this.configService.get<string>('batch.workingDirectory', process.cwd());
  }

  @Cron(CronExpression.EVERY_HOUR)
  @CreateRequestContext()
  async runEveryMinuteBatch(): Promise<void> {
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

      await this.getClaudeSessionUsage();
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

    // const sessionUsedPercent = 0;
    // const isRun = true;

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
      { cwd: this.workingDirectory, timeoutMs: 600_000 },
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
      jiraKey: task.jiraKey ?? '',
    };

    // 작업 상태를 진행중으로 변경
    await this.taskService.startTask(task);

    // jiraKey가 있으면 티켓 검증 (역할, 담당자, 진행 상태)
    if (task.jiraKey) {
      const isValid = this.jiraActionType === JiraTicketValidationType.API 
        ? await this.validateJiraTicketWithApi(task.jiraKey) 
        : await this.validateJiraTicketWithPrompt(task.jiraKey);
      if (!isValid) return;
    }

    // 작업 디렉토리 정리 (uncommitted 커밋, develop 브랜치 복귀)
    await this.cleanupWorkingDirectory();

    // SPEC 단계
    const specOk = await this.runClaudeStep(TaskStep.SPEC, vars, task, 600_000);
    if (!specOk) return;

    // PLAN 단계
    const planOk = await this.runClaudeStep(TaskStep.PLAN, vars, task, 600_000);
    if (!planOk) return;

    // PLAN 완료 후 Jira 댓글 등록
    // 실패해도 다음 단계로 진행
    if (task.jiraKey) {
      this.jiraActionType === JiraTicketValidationType.API 
        ? await this.postJiraCommentWithApi(JiraCommentPrompt.SPEC_PLAN, vars) 
        : await this.postJiraCommentWithPrompt(JiraCommentPrompt.SPEC_PLAN, vars);
    }

    // DEVELOPMENT 단계
    await this.runClaudeStep(TaskStep.DEVELOPMENT, vars, task, 3_600_000);

    // 코드리뷰 실행
    if (task.enableCodeReview) {
      const reviewOk = await this.runClaudeStep(TaskStep.CODE_REVIEW, vars, task, 3_600_000);
      if (!reviewOk) return;

      // 코드리뷰 완료 후 Jira 댓글 등록
      // 실패해도 다음 단계로 진행
      if (task.jiraKey) {
        this.jiraActionType === JiraTicketValidationType.API 
          ? await this.postJiraCommentWithApi(JiraCommentPrompt.CODE_REVIEW, vars) 
          : await this.postJiraCommentWithPrompt(JiraCommentPrompt.CODE_REVIEW, vars);
      }
    }

    // 마무리 (커밋 + develop 복귀)
    const finalizeOk = await this.runClaudeStep(TaskStep.FINALIZE, vars, task, 600_000);
    if (!finalizeOk) return;

    // 작업 상태를 완료로 변경
    // 브랜치를 확인해서 develop 브랜치가 아니면 실패
    const branch = await this.commandRunner.run('git', ['branch', '--show-current'], {
      cwd: this.workingDirectory,
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
   * Jira 티켓 검증 (역할: 백엔드, 컴포넌트, 담당자, 진행 상태: 대기)
   */
  private async validateJiraTicketWithApi(jiraKey: string): Promise<boolean> {
    this.logger.log(`[JIRA-CHECK] ${jiraKey} 티켓 검증 시작`);

    const [issue, currentUser] = await Promise.all([
      this.jiraService.getIssue(jiraKey),
      this.jiraService.getCurrentUser(),
    ]);

    const { fields } = issue;
    const reasons: string[] = [];

    // 역할: "백엔드"
    const role = fields.role?.[0]?.value;
    if (role !== '백엔드') {
      reasons.push(`역할이 "백엔드"가 아님 (현재: ${role ?? '없음'})`);
    }

    // 컴포넌트: 비어 있지 않고 유효한 값만 포함
    const validComponents = ['발행사', '모집인', '관리자'];
    const components = fields.components ?? [];
    if (components.length === 0) {
      reasons.push('컴포넌트가 비어 있음');
    } else if (!components.every((c) => validComponents.includes(c.name))) {
      reasons.push(`유효하지 않은 컴포넌트 포함 (현재: ${components.map((c) => c.name).join(', ')})`);
    }

    // 담당자: 현재 사용자와 일치
    const assigneeId = fields.assignee?.accountId;
    if (assigneeId !== currentUser.accountId) {
      reasons.push(`담당자 불일치 (현재: ${fields.assignee?.displayName ?? '없음'})`);
    }

    // 진행 상태: "대기"
    const status = fields.status?.name;
    if (status !== '대기') {
      reasons.push(`상태가 "대기"가 아님 (현재: ${status ?? '없음'})`);
    }

    if (reasons.length > 0) {
      this.logger.warn(`[JIRA-CHECK] 검증 실패, 작업을 건너뜁니다. 사유: ${reasons.join(' / ')}`);
      return false;
    }

    this.logger.log(`[JIRA-CHECK] 검증 성공`);
    return true;
  }

  /**
   * Jira 티켓 검증 (Claude 프롬프트 방식)
   */
  private async validateJiraTicketWithPrompt(jiraKey: string): Promise<boolean> {
    const timeoutMs = 600_000;
    // Claude 프롬프트 방식
    const prompt = this.loadStepPrompt(StepPrompt.JIRA_CHECK, { jiraKey });
    const { stdout } = await this.commandRunner.run(
      'claude',
      ['--dangerously-skip-permissions', '-p', prompt],
      { cwd: this.workingDirectory, timeoutMs },
    );
    this.logger.log(`[JIRA-CHECK] 결과: ${stdout}`);
    const lastLine = stdout.trim().split('\n').pop()?.trim();
    if (lastLine !== 'VALID') {
      this.logger.warn(`[JIRA-CHECK] 검증 실패, 작업을 건너뜁니다.`);
      return false;
    }

    this.logger.log(`[JIRA-CHECK] 검증 성공`);
    return true;
  }

  /**
   * 작업 디렉토리 정리 (uncommitted 커밋, develop 브랜치 복귀)
   */
  private async cleanupWorkingDirectory(): Promise<void> {
    this.logger.log(`[CLEANUP] 시작`);

    // uncommitted 변경사항이 있으면 커밋
    const status = await this.commandRunner.run('git', ['status', '--porcelain'], {
      cwd: this.workingDirectory,
    });
    if (status.stdout.trim()) {
      await this.commandRunner.run('git', ['add', '.'], { cwd: this.workingDirectory });
      await this.commandRunner.run('git', ['commit', '-m', '.'], { cwd: this.workingDirectory });
      this.logger.log(`[CLEANUP] uncommitted 변경사항 커밋 완료`);
    }

    // develop 브랜치가 아니면 복귀
    const branch = await this.commandRunner.run('git', ['branch', '--show-current'], {
      cwd: this.workingDirectory,
    });
    if (branch.stdout.trim() !== 'develop') {
      await this.commandRunner.run('git', ['checkout', 'develop'], { cwd: this.workingDirectory });
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
    let docsFileName: StepPrompt;
    if (step === TaskStep.CODE_REVIEW) {
      docsFileName = StepPrompt.CODE_REVIEW;
    } else if (step === TaskStep.FINALIZE) {
      docsFileName = vars.jiraKey ? StepPrompt.FINALIZE_JIRA : StepPrompt.FINALIZE;
    } else if (step === TaskStep.DEVELOPMENT) {
      docsFileName = vars.jiraKey ? StepPrompt.DEVELOPMENT_JIRA : StepPrompt.DEVELOPMENT;
    } else if (step === TaskStep.SPEC) {
      docsFileName = vars.jiraKey ? StepPrompt.SPEC_JIRA : StepPrompt.SPEC;
    } else {
      docsFileName = StepPrompt.PLAN;
    }

    // 이미 완료된 파일이 있으면 Claude 실행 스킵
    if (step !== TaskStep.DEVELOPMENT) {
      const existingPath = join(this.workingDirectory, 'local', 'context', vars.taskId, `${docsFileName}.md`);
      if (existsSync(existingPath)) {
        const existingContent = readFileSync(existingPath, 'utf-8');
        if (existingContent.trimEnd().endsWith('DONE')) {
          this.logger.log(`[${step.toUpperCase()}] 완료된 파일 존재, Claude 스킵`);
          return true;
        }
      }
    }

    // 프롬프트 로드
    const { stdout } = await this.commandRunner.run(
      'claude',
      ['--dangerously-skip-permissions', '-p', this.loadStepPrompt(docsFileName, vars)],
      { cwd: this.workingDirectory, timeoutMs },
    );
    this.logger.log(`[${step.toUpperCase()}] 완료: ${stdout}`);

    if (step === TaskStep.DEVELOPMENT || step === TaskStep.FINALIZE) {
      await this.taskStepResultService.create({
        task,
        step,
        stdout,
      });
      return true;
    }

    const outputPath = join(this.workingDirectory, 'local', 'context', vars.taskId, `${step}.md`);
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
   * Jira 댓글 등록 (실패해도 계속 진행)
   */
  private async postJiraCommentWithApi(type: JiraCommentPrompt, vars: Record<string, string>): Promise<void> {
    const { jiraKey, taskId } = vars;
    const loggerHeader = type === JiraCommentPrompt.SPEC_PLAN ? '[JIRA-COMMENT:SPEC/PLAN]' : '[JIRA-COMMENT:CODE_REVIEW]';
    this.logger.log(`${loggerHeader} #jira:${jiraKey} 댓글 등록 시작`);
    try {
      const contextDir = join(this.workingDirectory, 'local', 'context', taskId);

      if (type === JiraCommentPrompt.SPEC_PLAN) {
        // 댓글 중복확인
        const marker = '요구사항 (Spec Bot)';
        if (await this.jiraService.hasCommentWithFirstLineMarker(jiraKey, marker)) {
          this.logger.warn(`${loggerHeader} 이미 등록된 댓글이 있어 건너뜁니다.`);
          return;
        }

        // API 요청으로 댓글 등록
        const spec = readFileSync(join(contextDir, 'spec.md'), 'utf-8');
        const plan = readFileSync(join(contextDir, 'plan.md'), 'utf-8');
        const body = `## 요구사항 (Spec Bot)\n\n${spec}\n\n---\n\n## 구현 계획 (Plan Bot)\n\n${plan}`;
        await this.jiraService.addComment(jiraKey, body);

      } else if (type === JiraCommentPrompt.CODE_REVIEW) {
        // 코드리뷰는 댓글 중복확인 안함
        // API 요청으로 댓글 등록
        const review = readFileSync(join(contextDir, 'code-review.md'), 'utf-8');
        const body = `## 코드 리뷰 결과 (Bot)\n\n${review}`;
        await this.jiraService.addComment(jiraKey, body);
      }

      this.logger.log(`${loggerHeader} 댓글 등록 완료`);
    } catch (err) {
      this.logger.error(`${loggerHeader} 댓글 등록 실패 (계속 진행): ${err}`);
    }
  }

  /**
   * Jira 댓글 등록 (Claude 프롬프트 방식)
   */
   private async postJiraCommentWithPrompt(type: JiraCommentPrompt, vars: Record<string, string>): Promise<void> {
    const { jiraKey, taskId } = vars;
    const loggerHeader = type === JiraCommentPrompt.SPEC_PLAN ? '[JIRA-COMMENT:SPEC/PLAN]' : '[JIRA-COMMENT:CODE_REVIEW]';
    this.logger.log(`${loggerHeader} #jira:${jiraKey} 댓글 등록 시작`);
    try {
      const contextDir = join(this.workingDirectory, 'local', 'context', taskId);

      if (type === JiraCommentPrompt.SPEC_PLAN) {
        // 댓글 중복확인
        const marker = '요구사항 (Spec Bot)';
        if (await this.jiraService.hasCommentWithFirstLineMarker(jiraKey, marker)) {
          this.logger.warn(`${loggerHeader} 이미 등록된 댓글이 있어 건너뜁니다.`);
          return;
        }

        // 프롬프트로 댓글 등록
        let docsFileName = JiraCommentPrompt.SPEC_PLAN;
        const { stdout } = await this.commandRunner.run(
          'claude',
          ['--dangerously-skip-permissions', '-p', this.loadStepPrompt(docsFileName, vars)],
          { cwd: this.workingDirectory, timeoutMs: 600_000 },
        );
        this.logger.log(`${loggerHeader} 완료: ${stdout}`);

      } else if (type === JiraCommentPrompt.CODE_REVIEW) {
        // 프롬프트로 댓글 등록
        let docsFileName = JiraCommentPrompt.CODE_REVIEW;
        const { stdout } = await this.commandRunner.run(
          'claude',
          ['--dangerously-skip-permissions', '-p', this.loadStepPrompt(docsFileName, vars)],
          { cwd: this.workingDirectory, timeoutMs: 600_000 },
        );
        this.logger.log(`${loggerHeader} 완료: ${stdout}`);
      }

      this.logger.log(`${loggerHeader} 댓글 등록 완료`);
    } catch (err) {
      this.logger.error(`${loggerHeader} 댓글 등록 실패 (계속 진행): ${err}`);
    }
  }

  /**
   * 단계 프롬프트 로드
  */
  private loadStepPrompt(docsFileName: StepPrompt | JiraCommentPrompt, vars: Record<string, string>): string {
    const path = join(process.cwd(), 'docs', 'step', `${docsFileName}.md`);
    let template = readFileSync(path, 'utf-8');
    for (const [key, value] of Object.entries(vars)) {
      template = template.replaceAll(`{{${key}}}`, value);
    }
    return template.trim();
  }
}
