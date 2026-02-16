import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { WizardService } from '../wizard/wizard.service';
import { CreateWizardCategoryDto, UpdateWizardCategoryDto } from '../wizard/dto/wizard.dto';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private wizardService: WizardService,
  ) {}

  // Users management
  async getUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        isBlocked: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async blockUser(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isBlocked: true },
    });
  }

  async unblockUser(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isBlocked: false },
    });
  }

  // Sessions management
  async getAllSessions() {
    return this.prisma.consultationSession.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getSessionDetails(id: string) {
    const session = await this.prisma.consultationSession.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return session;
  }

  async deleteSession(id: string) {
    await this.prisma.consultationSession.delete({
      where: { id },
    });
  }

  // System config management
  async getSystemConfig() {
    return this.prisma.systemConfig.findMany({
      orderBy: { key: 'asc' },
    });
  }

  async updateSystemConfig(key: string, value: string) {
    return this.prisma.systemConfig.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  // Stats
  async getStats() {
    const [totalUsers, totalSessions, totalMessages, activeSessions] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.consultationSession.count(),
      this.prisma.message.count(),
      this.prisma.consultationSession.count({
        where: {
          updatedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24h
          },
        },
      }),
    ]);

    return {
      totalUsers,
      totalSessions,
      totalMessages,
      activeSessions,
    };
  }

  // LLM Logs
  async getLlmLogs(limit = 100) {
    return this.prisma.llmLog.findMany({
      include: {
        session: {
          select: {
            id: true,
            mode: true,
            topic: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  // Wizard categories (delegate to WizardService)
  async createWizardCategory(dto: CreateWizardCategoryDto) {
    return this.wizardService.createCategory(dto);
  }

  async updateWizardCategory(id: string, dto: UpdateWizardCategoryDto) {
    return this.wizardService.updateCategory(id, dto);
  }

  async deleteWizardCategory(id: string) {
    return this.wizardService.deleteCategory(id);
  }

  async getAllWizardCategories() {
    return this.prisma.wizardCategory.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
