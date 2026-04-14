import { ApiProperty } from '@nestjs/swagger';
import { TaskPriority, TaskStatus, TaskType } from '../task.enum';

export class UpdateTaskRequestDto {
  @ApiProperty({ title: '타입', enum: TaskType, required: false })
  type?: TaskType;

  @ApiProperty({ title: '상태', enum: TaskStatus, required: false })
  status?: TaskStatus;

  @ApiProperty({ title: '제목', required: false })
  title?: string;

  @ApiProperty({ title: '설명', nullable: true, required: false })
  description?: string;

  @ApiProperty({ title: 'Jira 키', nullable: true, required: false })
  jiraKey?: string;

  @ApiProperty({ title: '우선순위', enum: TaskPriority, required: false })
  priority?: TaskPriority;

  @ApiProperty({ title: '시작 일시', type: Date, required: false })
  startedAt?: Date;

  @ApiProperty({ title: '완료 일시', type: Date, required: false })
  finishedAt?: Date;
}
