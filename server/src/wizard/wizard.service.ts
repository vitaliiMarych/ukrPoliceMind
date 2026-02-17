import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { LlmService } from '../llm/llm.service';
import {
  CreateWizardCategoryDto,
  UpdateWizardCategoryDto,
  SubmitWizardDto,
  WizardResponseDto,
} from './dto/wizard.dto';
import { MessageRole, MessageStatus, SessionMode } from '@prisma/client';

@Injectable()
export class WizardService {
  constructor(
    private prisma: PrismaService,
    private llmService: LlmService,
  ) {}

  async getCategories() {
    return this.prisma.wizardCategory.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCategory(id: string) {
    const category = await this.prisma.wizardCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async submitWizard(userId: string, dto: SubmitWizardDto): Promise<WizardResponseDto> {
    const category = await this.prisma.wizardCategory.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const session = await this.prisma.consultationSession.create({
      data: {
        userId,
        mode: SessionMode.wizard,
        topic: category.title,
        title: `Консультація: ${category.title}`,
      },
    });

    const formattedAnswers = Object.entries(dto.answers)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    const userContent = `Категорія: ${category.title}\n\nВідповіді:\n${formattedAnswers}`;

    await this.prisma.message.create({
      data: {
        sessionId: session.id,
        role: MessageRole.user,
        content: userContent,
        status: MessageStatus.done,
      },
    });

    const assistantMessage = await this.prisma.message.create({
      data: {
        sessionId: session.id,
        role: MessageRole.assistant,
        content: '',
        status: MessageStatus.pending,
      },
    });

    return {
      sessionId: session.id,
      assistantMessageId: assistantMessage.id,
      streamUrl: `/api/v1/messages/${assistantMessage.id}/stream`,
    };
  }

  async createCategory(dto: CreateWizardCategoryDto) {
    return this.prisma.wizardCategory.create({
      data: {
        title: dto.title,
        description: dto.description,
        icon: dto.icon,
        schemaJson: JSON.stringify(dto.schemaJson),
        isActive: dto.isActive,
      },
    });
  }

  async updateCategory(id: string, dto: UpdateWizardCategoryDto) {
    const category = await this.prisma.wizardCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.prisma.wizardCategory.update({
      where: { id },
      data: {
        ...dto,
        schemaJson: dto.schemaJson ? JSON.stringify(dto.schemaJson) : undefined,
      },
    });
  }

  async deleteCategory(id: string) {
    const category = await this.prisma.wizardCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    await this.prisma.wizardCategory.delete({
      where: { id },
    });
  }
}
