import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, createTaskDto: CreateTaskDto) {
    // Verify project belongs to user
    const project = await this.prisma.project.findUnique({
      where: { id: createTaskDto.projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${createTaskDto.projectId} not found`);
    }

    if (project.userId !== userId) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return this.prisma.task.create({
      data: {
        ...createTaskDto,
        dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
      },
      include: {
        project: true,
      },
    });
  }

  async findAll(userId: number, projectId?: number) {
    const where: any = {
      project: {
        userId,
      },
    };

    if (projectId) {
      where.projectId = projectId;
    }

    return this.prisma.task.findMany({
      where,
      include: {
        project: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number, userId: number) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        project: true,
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    if (task.project.userId !== userId) {
      throw new ForbiddenException('You do not have access to this task');
    }

    return task;
  }

  async update(id: number, userId: number, updateTaskDto: UpdateTaskDto) {
    await this.findOne(id, userId); // Check if task exists and user has access

    return this.prisma.task.update({
      where: { id },
      data: {
        ...updateTaskDto,
        dueDate: updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : undefined,
      },
      include: {
        project: true,
      },
    });
  }

  async remove(id: number, userId: number) {
    await this.findOne(id, userId); // Check if task exists and user has access

    return this.prisma.task.delete({
      where: { id },
    });
  }

  async getTaskStats(userId: number, projectId?: number) {
    const where: any = {
      project: {
        userId,
      },
    };

    if (projectId) {
      where.projectId = projectId;
    }

    const [total, pending, inProgress, completed] = await Promise.all([
      this.prisma.task.count({ where }),
      this.prisma.task.count({ where: { ...where, status: 'pending' } }),
      this.prisma.task.count({ where: { ...where, status: 'in_progress' } }),
      this.prisma.task.count({ where: { ...where, status: 'completed' } }),
    ]);

    return {
      total,
      pending,
      inProgress,
      completed,
    };
  }
}
