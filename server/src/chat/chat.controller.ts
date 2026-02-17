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
    const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
    cb(null, uniqueName);
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
    console.log('[ChatController] Getting current session for user:', user.userId);
    const sessions = await this.sessionsService.findAll(user.userId);
    const currentSession = sessions.length > 0 ? sessions[0] : null;
    console.log('[ChatController] Current session:', currentSession?.id || 'none');
    return currentSession;
  }

  @Post('sessions')
  async createSession(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateSessionDto,
  ): Promise<SessionResponseDto> {
    console.log('[ChatController] Creating new session for user:', user.userId);
    const result = await this.sessionsService.create(user.userId, dto);
    console.log('[ChatController] Session created:', result.id);
    return result;
  }

  @Get('sessions/:id')
  async getSession(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<SessionResponseDto> {
    console.log('[ChatController] Getting session:', { userId: user.userId, sessionId: id });
    return this.sessionsService.findOne(id, user.userId);
  }

  @Post('message')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: imageStorage,
      fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(null, false);
        }
      },
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  async sendMessage(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: { message: string; sessionId?: string },
    @UploadedFile() image?: Express.Multer.File,
  ): Promise<CreateMessageResponseDto> {
    const imageUrl = image ? `/uploads/${image.filename}` : undefined;

    console.log('[ChatController] Sending message:', {
      userId: user.userId,
      sessionId: dto.sessionId || 'new',
      messageLength: dto.message?.length || 0,
      hasImage: !!image,
    });

    const result = await this.messagesService.createMessage(dto.sessionId, user.userId, {
      content: dto.message || '',
    }, imageUrl);

    console.log('[ChatController] Message created:', {
      userMessageId: result.userMessageId,
      sessionId: result.sessionId,
    });
    return result;
  }
}
