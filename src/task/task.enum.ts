/** 타입 */
export enum TaskType {
  /** 단순 작업 */
  SIMPLE = 'simple',
  /** 개발 */
  DEVELOPMENT = 'development',
  /** 코드 리뷰 */
  CODE_REVIEW = 'code_review',
}

/** 단계 (단계별 개발 타입에서 사용) */
export enum TaskStepPhase {
  /** 명세 작성 */
  SPEC = 'spec',
  /** 계획 수립 */
  PLAN = 'plan',
  /** 개발 */
  DEVELOPMENT = 'development',
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