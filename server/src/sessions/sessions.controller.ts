import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { SessionResponseDto } from './dto/session-response.dto';
import { CurrentUser, type CurrentUserPayload } from '../common/decorators/current-user.decorator';

@Controller('sessions')
export class SessionsController {
  constructor(private sessionsService: SessionsService) {}

  @Post()
  async create(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateSessionDto,
  ): Promise<SessionResponseDto> {
    return this.sessionsService.create(user.userId, dto);
  }

  @Get()
  async findAll(@CurrentUser() user: CurrentUserPayload): Promise<SessionResponseDto[]> {
    return this.sessionsService.findAll(user.userId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<SessionResponseDto> {
    return this.sessionsService.findOne(id, user.userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload): Promise<void> {
    return this.sessionsService.delete(id, user.userId);
  }
}
