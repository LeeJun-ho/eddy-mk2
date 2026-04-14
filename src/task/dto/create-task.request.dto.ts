import { TaskType } from '../task.enum';

export class CreateTaskRequestDto {
  type?: TaskType;
  title!: string;
  description?: string;
  jiraKey?: string;
  priority?: number;
}
