import { ApiProperty } from '@nestjs/swagger';
import { TaskPriority, TaskType } from '../task.enum';

export class CreateTaskRequestDto {
  @ApiProperty({ title: '타입', enum: TaskType, required: false })
  type?: TaskType;

  @ApiProperty({ title: '제목' })
  title!: string;

  @ApiProperty({ title: '설명', nullable: true, required: false })
  description?: string;

  @ApiProperty({ title: 'Jira 키', nullable: true, required: false })
  jiraKey?: string;

  @ApiProperty({ title: '우선순위', enum: TaskPriority, required: false })
  priority?: TaskPriority;
}
