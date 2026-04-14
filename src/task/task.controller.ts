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
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TaskService } from './task.service';
import { CreateTaskRequestDto } from './dto/create-task.request.dto';
import { UpdateTaskRequestDto } from './dto/update-task.request.dto';
import { FindManyTaskRequestDto } from './dto/find-many-task.request.dto';
import { TaskResponseDto } from './dto/task.response.dto';
import { TaskListResponseDto } from './dto/task-list.response.dto';

@ApiTags('작업(Task)')
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @ApiOperation({ summary: '작업 생성' })
  @ApiOkResponse({ description: '작업 생성 성공', type: TaskResponseDto })
  @Post()
  async create(@Body() dto: CreateTaskRequestDto): Promise<TaskResponseDto> {
    const task = await this.taskService.create(dto);
    return TaskResponseDto.from(task);
  }

  @ApiOperation({ summary: '작업 목록 조회' })
  @ApiOkResponse({ description: '작업 목록 조회 성공', type: TaskListResponseDto })
  @Get()
  async findMany(@Query() dto: FindManyTaskRequestDto): Promise<TaskListResponseDto> {
    const items = await this.taskService.findMany(dto);
    const total = await this.taskService.count(dto);
    
    return TaskListResponseDto.from(items, total, dto.page, dto.limit);
  }

  @ApiOperation({ summary: '작업 상세 조회' })
  @ApiOkResponse({ description: '작업 상세 조회 성공', type: TaskResponseDto })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<TaskResponseDto> {
    const task = await this.taskService.findOne(id);
    return TaskResponseDto.from(task);
  }

  @ApiOperation({ summary: '작업 수정' })
  @ApiOkResponse({ description: '작업 수정 성공', type: TaskResponseDto })
  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTaskRequestDto): Promise<TaskResponseDto> {
    const task = await this.taskService.update(id, dto);
    return TaskResponseDto.from(task);
  }

  @ApiOperation({ summary: '작업 삭제' })
  @ApiOkResponse({ description: '작업 삭제 성공' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.taskService.remove(id);
  }
}
