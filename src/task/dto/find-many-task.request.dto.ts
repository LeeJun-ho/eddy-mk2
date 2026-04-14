import { ApiProperty } from '@nestjs/swagger';
import { TaskPriority, TaskStatus, TaskType } from '../task.enum';

export class FindManyTaskRequestDto {
  @ApiProperty({ title: '페이지', default: 1, required: false })
  page: number = 1;

  @ApiProperty({ title: '페이지 크기', default: 20, required: false })
  limit: number = 20;

  @ApiProperty({ title: '타입', enum: TaskType, required: false })
  type?: TaskType;

  @ApiProperty({ title: '상태', enum: TaskStatus, required: false })
  status?: TaskStatus;

  @ApiProperty({ title: '우선순위', enum: TaskPriority, required: false })
  priority?: TaskPriority;

  @ApiProperty({ title: '제목 (부분 검색)', required: false })
  title?: string;

  @ApiProperty({ title: 'Jira 키', required: false })
  jiraKey?: string;
}
