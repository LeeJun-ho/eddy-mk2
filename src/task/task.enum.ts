/** 타입 */
export enum TaskType {
  /** 개발 */
  DEVELOPMENT = 'DEVELOPMENT',
  /** 코드 리뷰 */
  CODE_REVIEW = 'CODE_REVIEW',
}

/** 상태 */
export enum TaskStatus {
  /** 대기 */
  PENDING = 'PENDING',
  /** 진행중 */
  RUNNING = 'RUNNING',
  /** 완료 */
  DONE = 'DONE',
  /** 실패 */
  FAILED = 'FAILED',
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