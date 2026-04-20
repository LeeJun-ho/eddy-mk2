/** 타입 */
export enum TaskType {
  /** 단순 작업 */
  SIMPLE = 'simple',
  /** 개발 */
  DEVELOPMENT = 'development',
  /** 코드 리뷰 */
  CODE_REVIEW = 'code_review',
}

/** 단계 */
export enum TaskStep {
  /** 명세 작성 */
  SPEC = 'spec',
  /** 계획 수립 */
  PLAN = 'plan',
  /** 개발 */
  DEVELOPMENT = 'development',
  /** 코드 리뷰 */
  CODE_REVIEW = 'code-review',
  /** 마무리 (커밋 + develop 복귀) */
  FINALIZE = 'finalize',
}

/** 상태 */
export enum TaskStatus {
  /** 대기 */
  PENDING = 'pending',
  /** 진행중 */
  RUNNING = 'running',
  /** 완료 */
  DONE = 'done',
  /** 실패 */
  FAILED = 'failed',
}

/** 단계 프롬프트 파일명 */
export enum StepPrompt {
  SPEC = 'spec',
  SPEC_JIRA = 'spec-jira',
  PLAN = 'plan',
  DEVELOPMENT = 'development',
  DEVELOPMENT_JIRA = 'development-jira',
  CODE_REVIEW = 'code-review',
  FINALIZE = 'finalize',
  FINALIZE_JIRA = 'finalize-jira',
  JIRA_CHECK = 'jira-check',
}

/** Jira 댓글 프롬프트 */
export enum JiraCommentPrompt {
  /** SPEC/PLAN 완료 후 댓글 */
  SPEC_PLAN = 'jira-comment-spec-plan',
  /** 코드 리뷰 완료 후 댓글 */
  CODE_REVIEW = 'jira-comment-code-review',
}

/** 우선순위 */
export enum TaskPriority {
  /** 매우 낮음 */
  LOWEST = 1,
  /** 낮음 */
  LOW = 2,
  /** 중간 */
  MEDIUM = 3,  
  /** 높음 */
  HIGH = 4,
  /** 매우 높음 */
  HIGHEST = 5,
}