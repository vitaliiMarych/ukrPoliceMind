import { Controller, Get, Delete, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { SessionsService } from '../sessions/sessions.service';
import { SessionResponseDto } from '../sessions/dto/session-response.dto';
import { CurrentUser, type CurrentUserPayload } from '../common/decorators/current-user.decorator';

interface PaginationParams {
  page?: number;
  limit?: number;
}

interface SessionsListResponse {
  sessions: SessionResponseDto[];
  total: number;
  page: number;
  limit: number;
}

@Controller('history')
export class HistoryController {
  constructor(private sessionsService: SessionsService) {}

  @Get('sessions')
  async getSessions(
    @CurrentUser() user: CurrentUserPayload,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<SessionsListResponse> {
    console.log('[HistoryController] Getting sessions:', { userId: user.userId, page, limit });

    const pageNum = page ? Number(page) : 1;
    const limitNum = limit ? Number(limit) : 10;

    const allSessions = await this.sessionsService.findAll(user.userId);
    const total = allSessions.length;

    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const sessions = allSessions.slice(startIndex, endIndex);

    console.log('[HistoryController] Returning sessions:', {
      total,
      page: pageNum,
      limit: limitNum,
      returned: sessions.length,
    });

    return {
      sessions,
      total,
      page: pageNum,
      limit: limitNum,
    };
  }

  @Get('sessions/:id')
  async getSession(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<SessionResponseDto> {
    console.log('[HistoryController] Getting session:', { userId: user.userId, sessionId: id });
    return this.sessionsService.findOne(id, user.userId);
  }

  @Delete('sessions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSession(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<void> {
    console.log('[HistoryController] Deleting session:', { userId: user.userId, sessionId: id });
    return this.sessionsService.delete(id, user.userId);
  }
}
