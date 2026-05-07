import { ApiProperty } from '@nestjs/swagger';
import { Task } from '../task.entity';
import { TaskPriority, TaskStatus, TaskStep, TaskType } from '../task.enum';

export class TaskResponseDto {
  @ApiProperty({ title: '고유 식별자', type: Number, example: 1 })
  id: number;

  @ApiProperty({ title: '타입', enum: TaskType, enumName: 'TaskType', example: TaskType.DEVELOPMENT })
  type: TaskType;

  @ApiProperty({ title: '상태', enum: TaskStatus, enumName: 'TaskStatus', example: TaskStatus.PENDING })
  status: TaskStatus;

  @ApiProperty({ title: '제목', example: '로그인 API 개발' })
  title: string;

  @ApiProperty({ title: '설명', nullable: true, required: false })
  description?: string;

  @ApiProperty({ title: 'Jira 키', example: 'VL-123', nullable: true, required: false })
  jiraKey?: string;

  @ApiProperty({ title: '코드리뷰 실행 여부', example: false })
  enableCodeReview: boolean;

  @ApiProperty({ title: '우선순위', enum: TaskPriority, enumName: 'TaskPriority', example: TaskPriority.MEDIUM })
  priority: TaskPriority;

  @ApiProperty({ title: '현재 단계', enum: TaskStep, enumName: 'TaskStep', nullable: true, required: false })
  currentStep?: TaskStep;

  @ApiProperty({ title: '생성 일시', type: Date })
  createdAt: Date;

  @ApiProperty({ title: '수정 일시', type: Date })
  updatedAt: Date;

  @ApiProperty({ title: '시작 일시', type: Date, nullable: true, required: false })
  startedAt?: Date;

  @ApiProperty({ title: '완료 일시', type: Date, nullable: true, required: false })
  finishedAt?: Date;

  static from(entity: Task): TaskResponseDto {
    const response = new TaskResponseDto();
    response.id = entity.id;
    response.type = entity.type;
    response.status = entity.status;
    response.title = entity.title;
    response.description = entity.description;
    response.jiraKey = entity.jiraKey;
    response.enableCodeReview = entity.enableCodeReview;
    response.priority = entity.priority;
    response.currentStep = entity.currentStep;
    response.createdAt = entity.createdAt;
    response.updatedAt = entity.updatedAt;
    response.startedAt = entity.startedAt;
    response.finishedAt = entity.finishedAt;
    return response;
  }
}
