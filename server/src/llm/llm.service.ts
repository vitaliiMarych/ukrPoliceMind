import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI, type GenerativeModel, type Part } from '@google/generative-ai';
import { readFileSync } from 'fs';
import { join, extname } from 'path';
import { ConfigService } from '../config/config.service';
import { PrismaService } from '../database/prisma.service';

interface LlmMessage {
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
}

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
};

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private readonly model: GenerativeModel | null = null;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const apiKey = this.configService.geminiApiKey;

    if (apiKey && apiKey !== 'your-gemini-api-key-here') {
      const genAI = new GoogleGenerativeAI(apiKey);
      this.model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      this.logger.log('Gemini AI initialized with model: gemini-2.5-flash');
    } else {
      this.logger.warn('Gemini API key not configured. LLM features will be limited.');
    }
  }

  async *streamResponse(
    sessionId: string,
    messages: LlmMessage[],
  ): AsyncGenerator<string, void, unknown> {
    const startTime = Date.now();

    try {
      if (!this.model) {
        yield 'LLM не налаштований. Будь ласка, додайте GEMINI_API_KEY у .env файл.';
        return;
      }

      const systemPromptConfig = await this.prisma.systemConfig.findUnique({
        where: { key: 'system_prompt' },
      });

      const systemPrompt =
        systemPromptConfig?.value ||
        'Ти - експертний асистент з питань правоохоронної діяльності в Україні. Надавай точні, структуровані та професійні відповіді на запитання користувачів.';

      const history = messages.slice(0, -1).map((msg) => ({
        role: msg.role === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: msg.content }],
      }));

      const lastMessage = messages[messages.length - 1];

      const chat = this.model.startChat({
        history: [
          { role: 'user', parts: [{ text: systemPrompt }] },
          { role: 'model', parts: [{ text: 'Зрозумів. Готовий надавати консультації.' }] },
          ...history,
        ],
      });

      const messageParts: Part[] = [];

      if (lastMessage.content) {
        messageParts.push({ text: lastMessage.content });
      } else if (lastMessage.imageUrl) {
        messageParts.push({ text: 'Проаналізуй це зображення та надай відповідь.' });
      }

      if (lastMessage.imageUrl) {
        const imagePart = this.buildImagePart(lastMessage.imageUrl);
        if (imagePart) messageParts.push(imagePart);
      }

      if (messageParts.length === 0) {
        messageParts.push({ text: '' });
      }

      const result = await chat.sendMessageStream(messageParts);

      for await (const chunk of result.stream) {
        yield chunk.text();
      }

      await this.logLlmRequest(sessionId, 'success', Date.now() - startTime);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error('LLM stream error:', message);
      await this.logLlmRequest(sessionId, 'error', Date.now() - startTime, message);
      yield `Помилка генерації відповіді: ${message}`;
    }
  }

  private buildImagePart(imageUrl: string): Part | null {
    try {
      const imagePath = join(__dirname, '..', '..', imageUrl);
      const imageData = readFileSync(imagePath);
      const ext = extname(imageUrl).toLowerCase();
      const mimeType = MIME_TYPES[ext] || 'image/jpeg';

      return {
        inlineData: {
          mimeType,
          data: imageData.toString('base64'),
        },
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Failed to read image: ${message}`);
      return null;
    }
  }

  private async logLlmRequest(
    sessionId: string,
    status: string,
    latencyMs: number,
    errorMessage?: string,
  ): Promise<void> {
    try {
      await this.prisma.llmLog.create({
        data: {
          sessionId,
          model: 'gemini-2.5-flash',
          status,
          latencyMs,
          errorMessage,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to log LLM request: ${message}`);
    }
  }
}
