import {
  BadRequestException,
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
import { TaskStatus } from './task.enum';

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

  @ApiOperation({ summary: '실패한 작업 재시도 (FAILED → PENDING, currentStep 유지)' })
  @ApiOkResponse({ description: '재시도 등록 성공', type: TaskResponseDto })
  @Post(':id/retry')
  async retry(@Param('id', ParseIntPipe) id: number): Promise<TaskResponseDto> {
    const task = await this.taskService.findOne(id);
    if (task.status !== TaskStatus.FAILED) {
      throw new BadRequestException('실패한 작업만 재시도할 수 있습니다.');
    }
    await this.taskService.retryTask(task);
    return TaskResponseDto.from(await this.taskService.findOne(id));
  }

  @ApiOperation({ summary: '작업 삭제' })
  @ApiOkResponse({ description: '작업 삭제 성공' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.taskService.remove(id);
  }
}
