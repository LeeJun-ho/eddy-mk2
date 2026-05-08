import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, QueryOrder, Transactional, TransactionPropagation } from '@mikro-orm/sqlite';
import { BaseEntityRepository } from '@libs/database/repositories/base-entity.repository';
import { Task } from './task.entity';
import { TaskStepResult } from './task-step-result.entity';
import { TaskStep } from './task.enum';

interface CreateTaskStepResultParams {
  task: Task;
  step: TaskStep;
  content?: string;
  stdout?: string;
}

@Injectable()
export class TaskStepResultService {
  constructor(
    private readonly em: EntityManager,
    @InjectRepository(TaskStepResult)
    private readonly taskStepResultRepository: BaseEntityRepository<TaskStepResult>,
  ) {}

  @Transactional({ propagation: TransactionPropagation.REQUIRED })
  async create(params: CreateTaskStepResultParams): Promise<TaskStepResult> {
    return this.taskStepResultRepository.createAndFlush(params);
  }

  /**
   * 작업 ID로 작업 단계 결과 목록 조회
   */
  async findByTaskId(taskId: number): Promise<TaskStepResult[]> {
    return this.taskStepResultRepository.find(
      { task: taskId },
      { orderBy: { createdAt: QueryOrder.ASC } },
    );
  }
}
