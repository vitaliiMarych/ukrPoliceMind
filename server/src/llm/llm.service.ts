import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '../config/config.service';
import { PrismaService } from '../database/prisma.service';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private genAI: GoogleGenerativeAI | null = null;
  private model: any;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const apiKey = this.configService.geminiApiKey;

    if (apiKey && apiKey !== 'your-gemini-api-key-here') {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
      this.logger.log('Gemini AI initialized successfully');
    } else {
      this.logger.warn('Gemini API key not configured. LLM features will be limited.');
    }
  }

  async *streamResponse(
    sessionId: string,
    messages: Message[],
  ): AsyncGenerator<string, void, unknown> {
    const startTime = Date.now();

    try {
      if (!this.genAI || !this.model) {
        yield 'LLM не налаштований. Будь ласка, додайте GEMINI_API_KEY у .env файл.';
        return;
      }

      // Get system prompt from database
      const systemPromptConfig = await this.prisma.systemConfig.findUnique({
        where: { key: 'system_prompt' },
      });

      const systemPrompt =
        systemPromptConfig?.value ||
        'Ти - експертний асистент з питань правоохоронної діяльності в Україні. Надавай точні, структуровані та професійні відповіді на запитання користувачів.';

      // Format history for Gemini
      const history = messages.slice(0, -1).map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

      const lastMessage = messages[messages.length - 1];

      // Create chat session
      const chat = this.model.startChat({
        history: [
          {
            role: 'user',
            parts: [{ text: systemPrompt }],
          },
          {
            role: 'model',
            parts: [{ text: 'Зрозумів. Готовий надавати консультації.' }],
          },
          ...history,
        ],
      });

      // Stream response
      const result = await chat.sendMessageStream(lastMessage.content);

      for await (const chunk of result.stream) {
        const text = chunk.text();
        yield text;
      }

      // Log successful completion
      const latency = Date.now() - startTime;
      await this.logLlmRequest(sessionId, 'gemini-2.0-flash-exp', 'success', latency);
    } catch (error) {
      this.logger.error('LLM stream error:', error);
      const latency = Date.now() - startTime;
      await this.logLlmRequest(
        sessionId,
        'gemini-2.0-flash-exp',
        'error',
        latency,
        error.message,
      );
      yield `Помилка генерації відповіді: ${error.message}`;
    }
  }

  private async logLlmRequest(
    sessionId: string,
    model: string,
    status: string,
    latencyMs: number,
    errorMessage?: string,
  ) {
    try {
      await this.prisma.llmLog.create({
        data: {
          sessionId,
          model,
          status,
          latencyMs,
          errorMessage,
        },
      });
    } catch (error) {
      this.logger.error('Failed to log LLM request:', error);
    }
  }
}
