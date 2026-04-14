import { TaskPriority, TaskStatus, TaskType } from '../task.enum';

export class FindManyTaskRequestDto {
  page: number = 1;
  limit: number = 20;
  type?: TaskType;
  status?: TaskStatus;
  priority?: TaskPriority;
  title?: string;
  jiraKey?: string;
}
