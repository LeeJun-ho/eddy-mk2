import { Entity, Enum, Opt, PrimaryKey, Property } from '@mikro-orm/core';
import { TaskPriority, TaskStatus, TaskStep, TaskType } from './task.enum';

@Entity({ comment: '작업' })
export class Task {
  @PrimaryKey({ type: 'integer', comment: 'ID' })
  id!: number;

  @Enum({ items: () => TaskType, comment: '타입 (개발, 코드 리뷰)' })
  type!: TaskType;

  @Enum({ items: () => TaskStatus, comment: '상태 (대기, 진행중, 완료, 실패)' })
  status!: TaskStatus;

  @Property({ comment: '제목' })
  title!: string;

  @Property({ comment: '설명', type: 'text', nullable: true })
  description?: string;

  @Property({ comment: 'Jira 키', nullable: true })
  jiraKey?: string;

  @Enum({ items: () => TaskPriority, comment: '우선순위' })
  priority!: TaskPriority;

  @Enum({ items: () => TaskStep, comment: '현재 단계 (단계별 개발 타입에서 사용)', nullable: true })
  currentStep?: TaskStep;

  @Property({
    type: 'timestamptz',
    onCreate: () => new Date(),
    defaultRaw: 'CURRENT_TIMESTAMP',
    comment: '생성 일시',
  })
  createdAt: Opt<Date>;

  @Property({
    type: 'timestamptz',
    onCreate: () => new Date(),
    onUpdate: () => new Date(),
    defaultRaw: 'CURRENT_TIMESTAMP',
    comment: '수정 일시',
  })
  updatedAt: Opt<Date>;

  @Property({ comment: '삭제 일시', type: 'timestamptz', nullable: true })
  deletedAt?: Date;

  @Property({ comment: '시작 일시', type: 'timestamptz', nullable: true })
  startedAt?: Date;

  @Property({ comment: '완료 일시', type: 'timestamptz', nullable: true })
  finishedAt?: Date;
}
