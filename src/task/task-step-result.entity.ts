import { Entity, Enum, ManyToOne, Opt, PrimaryKey, Property } from '@mikro-orm/core';
import { IsoDateTimeType } from '@libs/database/types/iso-datetime.type';
import { Task } from './task.entity';
import { TaskStep } from './task.enum';

@Entity({ comment: '작업 단계 결과' })
export class TaskStepResult {
  @PrimaryKey({ type: 'integer', comment: 'ID' })
  id!: number;

  @ManyToOne(() => Task, { comment: '작업' })
  task!: Task;

  @Enum({ items: () => TaskStep, comment: '단계' })
  step!: TaskStep;

  @Property({ type: 'text', nullable: true, comment: '출력 파일 내용 (spec/plan)' })
  content?: string;

  @Property({ type: 'text', nullable: true, comment: 'Claude stdout' })
  stdout?: string;

  @Property({
    type: IsoDateTimeType,
    onCreate: () => new Date(),
    defaultRaw: 'CURRENT_TIMESTAMP',
    comment: '생성 일시',
  })
  createdAt: Opt<Date>;
}
