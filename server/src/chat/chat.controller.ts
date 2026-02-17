import { Controller, Get, Post, Body, Param, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { SessionsService } from '../sessions/sessions.service';
import { MessagesService } from '../messages/messages.service';
import { CreateSessionDto } from '../sessions/dto/create-session.dto';
import { SessionResponseDto } from '../sessions/dto/session-response.dto';
import { CreateMessageResponseDto } from '../messages/dto/message-response.dto';
import { CurrentUser, type CurrentUserPayload } from '../common/decorators/current-user.decorator';

const imageStorage = diskStorage({
  destination: join(__dirname, '..', '..', 'uploads'),
  filename: (_req, file, cb) => {
    cb(null, `${uuidv4()}${extname(file.originalname)}`);
  },
});

@Controller('chat')
export class ChatController {
  constructor(
    private sessionsService: SessionsService,
    private messagesService: MessagesService,
  ) {}

  @Get('current')
  async getCurrentSession(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<SessionResponseDto | null> {
    const sessions = await this.sessionsService.findAll(user.userId);
    return sessions[0] ?? null;
  }

  @Post('sessions')
  async createSession(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateSessionDto,
  ): Promise<SessionResponseDto> {
    return this.sessionsService.create(user.userId, dto);
  }

  @Get('sessions/:id')
  async getSession(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<SessionResponseDto> {
    return this.sessionsService.findOne(id, user.userId);
  }

  @Post('message')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: imageStorage,
      fileFilter: (_req, file, cb) => cb(null, file.mimetype.startsWith('image/')),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async sendMessage(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: { message: string; sessionId?: string },
    @UploadedFile() image?: Express.Multer.File,
  ): Promise<CreateMessageResponseDto> {
    const imageUrl = image ? `/uploads/${image.filename}` : undefined;
    return this.messagesService.createMessage(dto.sessionId, user.userId, {
      content: dto.message || '',
    }, imageUrl);
  }
}
