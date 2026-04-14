import { ApiProperty } from '@nestjs/swagger';
import { Task } from '../task.entity';
import { PaginationResponseDto } from '@libs/dtos/pagination.response.dto';
import { TaskResponseDto } from './task.response.dto';

export class TaskListResponseDto extends PaginationResponseDto<TaskResponseDto> {
  @ApiProperty({ title: '작업 목록', type: [TaskResponseDto] })
  declare items: TaskResponseDto[];

  static from(entities: Task[], total: number, page: number, limit: number): TaskListResponseDto {
    const response = new TaskListResponseDto();
    response.total = total;
    response.page = page;
    response.limit = limit;
    response.items = entities.map((e) => TaskResponseDto.from(e));
    return response;
  }
}
