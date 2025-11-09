import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, createProjectDto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        ...createProjectDto,
        userId,
      },
      include: {
        tasks: true,
      },
    });
  }

  async findAll(userId: number) {
    return this.prisma.project.findMany({
      where: { userId },
      include: {
        tasks: true,
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number, userId: number) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        tasks: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    if (project.userId !== userId) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return project;
  }

  async update(id: number, userId: number, updateProjectDto: UpdateProjectDto) {
    await this.findOne(id, userId); // Check if project exists and user has access

    return this.prisma.project.update({
      where: { id },
      data: updateProjectDto,
      include: {
        tasks: true,
      },
    });
  }

  async remove(id: number, userId: number) {
    await this.findOne(id, userId); // Check if project exists and user has access

    return this.prisma.project.delete({
      where: { id },
    });
  }
}
