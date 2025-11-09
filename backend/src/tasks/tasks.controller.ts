import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller('tasks')
@UseGuards(AuthGuard('jwt'))
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Request() req, @Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(req.user.userId, createTaskDto);
  }

  @Get()
  findAll(@Request() req, @Query('projectId') projectId?: string) {
    return this.tasksService.findAll(
      req.user.userId,
      projectId ? +projectId : undefined,
    );
  }

  @Get('stats')
  getStats(@Request() req, @Query('projectId') projectId?: string) {
    return this.tasksService.getTaskStats(
      req.user.userId,
      projectId ? +projectId : undefined,
    );
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.tasksService.findOne(+id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.tasksService.update(+id, req.user.userId, updateTaskDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.tasksService.remove(+id, req.user.userId);
  }
}
