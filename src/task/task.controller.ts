import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskRequestDto } from './dto/create-task.request.dto';
import { UpdateTaskRequestDto } from './dto/update-task.request.dto';
import { FindManyTaskRequestDto } from './dto/find-many-task.request.dto';

// @ApiTags('작업(Task)')
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  create(@Body() dto: CreateTaskRequestDto) {
    return this.taskService.create(dto);
  }

  @Get()
  findMany(@Query() dto: FindManyTaskRequestDto) {
    return this.taskService.findMany(dto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.taskService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTaskRequestDto) {
    return this.taskService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.taskService.remove(id);
  }
}
