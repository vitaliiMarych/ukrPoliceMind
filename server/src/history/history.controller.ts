import { Controller, Get, Delete, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { SessionsService } from '../sessions/sessions.service';
import { SessionResponseDto } from '../sessions/dto/session-response.dto';
import { CurrentUser, type CurrentUserPayload } from '../common/decorators/current-user.decorator';

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
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    const allSessions = await this.sessionsService.findAll(user.userId);
    const start = (pageNum - 1) * limitNum;

    return {
      sessions: allSessions.slice(start, start + limitNum),
      total: allSessions.length,
      page: pageNum,
      limit: limitNum,
    };
  }

  @Get('sessions/:id')
  async getSession(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<SessionResponseDto> {
    return this.sessionsService.findOne(id, user.userId);
  }

  @Delete('sessions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSession(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<void> {
    return this.sessionsService.delete(id, user.userId);
  }
}
