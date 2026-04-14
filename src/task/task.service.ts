import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityRepository, QueryOrder, Transactional, TransactionPropagation } from '@mikro-orm/sqlite';
import { Task } from './task.entity';
import { TaskPriority, TaskStatus, TaskType } from './task.enum';
import { CreateTaskRequestDto } from './dto/create-task.request.dto';
import { UpdateTaskRequestDto } from './dto/update-task.request.dto';
import { FindManyTaskRequestDto } from './dto/find-many-task.request.dto';
import { InjectRepository } from '@mikro-orm/nestjs';
import { BaseEntityRepository } from '@libs/database/repositories/base-entity.repository';

@Injectable()
export class TaskService {
  constructor(@InjectRepository(Task) private readonly taskRepository: BaseEntityRepository<Task>) {}

  /**
   * 작업 생성
   */
  @Transactional({ propagation: TransactionPropagation.REQUIRED })
  async create(dto: CreateTaskRequestDto): Promise<Task> {
    const task = this.taskRepository.create({
      title: dto.title,
      type: dto.type ?? TaskType.DEVELOPMENT,
      status: TaskStatus.PENDING,
      description: dto.description,
      jiraKey: dto.jiraKey,
      priority: (dto.priority as TaskPriority | undefined) ?? TaskPriority.MEDIUM,
    });

    return this.taskRepository.createAndFlush(task);
  }

  /**
   * 작업 목록 조회
   */
  async findMany(dto: FindManyTaskRequestDto): Promise<Task[]> {
    return this.taskRepository.find({}, {
      offset: (dto.page - 1) * dto.limit,
      limit: dto.limit,
      orderBy: { priority: QueryOrder.DESC, id: QueryOrder.ASC },
    });
  }

  /**
   * 작업 목록 개수 조회
   */
  async count(dto: FindManyTaskRequestDto): Promise<number> {
    return this.taskRepository.count({}, {});
  }

  /**
   * 작업 상세 조회
   */
  async findOne(id: number): Promise<Task> {
    const task = await this.taskRepository.findOne({ id });
    if (!task) {
      throw new NotFoundException(`Task #${id} not found`);
    }
    return task;
  }

  /**
   * 작업 수정
   */
  @Transactional({ propagation: TransactionPropagation.REQUIRED })
  async update(id: number, dto: UpdateTaskRequestDto): Promise<Task> {
    const task = await this.findOne(id);
    if (!task) {
      throw new NotFoundException(`Task #${id} not found`);
    }
    return await this.taskRepository.update(task.id, dto);
  }

  /**
   * 작업 삭제
   */
  @Transactional({ propagation: TransactionPropagation.REQUIRED })
  async remove(id: number): Promise<void> {
    const task = await this.findOne(id);
    await this.taskRepository.softDelete(task);
  }
}
