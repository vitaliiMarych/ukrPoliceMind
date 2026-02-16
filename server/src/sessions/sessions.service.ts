import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { SessionResponseDto } from './dto/session-response.dto';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateSessionDto): Promise<SessionResponseDto> {
    const session = await this.prisma.consultationSession.create({
      data: {
        userId,
        mode: dto.mode,
        topic: dto.topic,
      },
    });

    return session;
  }

  async findAll(userId: string): Promise<SessionResponseDto[]> {
    const sessions = await this.prisma.consultationSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return sessions;
  }

  async findOne(id: string, userId: string): Promise<SessionResponseDto> {
    const session = await this.prisma.consultationSession.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return session;
  }

  async delete(id: string, userId: string): Promise<void> {
    const session = await this.prisma.consultationSession.findUnique({
      where: { id },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    await this.prisma.consultationSession.delete({
      where: { id },
    });
  }

  async updateTitle(id: string, userId: string, title: string): Promise<SessionResponseDto> {
    const session = await this.prisma.consultationSession.findUnique({
      where: { id },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.consultationSession.update({
      where: { id },
      data: { title },
    });
  }
}
