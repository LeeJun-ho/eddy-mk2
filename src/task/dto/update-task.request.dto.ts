import { TaskStatus, TaskType } from '../task.enum';

export class UpdateTaskRequestDto {
  type?: TaskType;
  status?: TaskStatus;
  title?: string;
  description?: string;
  jiraKey?: string;
  priority?: number;
  startedAt?: Date;
  finishedAt?: Date;
}
