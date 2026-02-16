import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CreateWizardCategoryDto, UpdateWizardCategoryDto } from '../wizard/dto/wizard.dto';

@Controller('admin')
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private adminService: AdminService) {}

  // Users
  @Get('users')
  async getUsers() {
    return this.adminService.getUsers();
  }

  @Patch('users/:id/block')
  async blockUser(@Param('id') id: string) {
    return this.adminService.blockUser(id);
  }

  @Patch('users/:id/unblock')
  async unblockUser(@Param('id') id: string) {
    return this.adminService.unblockUser(id);
  }

  // Sessions
  @Get('sessions')
  async getAllSessions() {
    return this.adminService.getAllSessions();
  }

  @Get('sessions/:id')
  async getSessionDetails(@Param('id') id: string) {
    return this.adminService.getSessionDetails(id);
  }

  @Delete('sessions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSession(@Param('id') id: string) {
    return this.adminService.deleteSession(id);
  }

  // Wizard categories
  @Get('wizard/categories')
  async getAllWizardCategories() {
    return this.adminService.getAllWizardCategories();
  }

  @Post('wizard/categories')
  async createWizardCategory(@Body() dto: CreateWizardCategoryDto) {
    return this.adminService.createWizardCategory(dto);
  }

  @Patch('wizard/categories/:id')
  async updateWizardCategory(@Param('id') id: string, @Body() dto: UpdateWizardCategoryDto) {
    return this.adminService.updateWizardCategory(id, dto);
  }

  @Delete('wizard/categories/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteWizardCategory(@Param('id') id: string) {
    return this.adminService.deleteWizardCategory(id);
  }

  // System config
  @Get('system-config')
  async getSystemConfig() {
    return this.adminService.getSystemConfig();
  }

  @Patch('system-config/:key')
  async updateSystemConfig(@Param('key') key: string, @Body('value') value: string) {
    return this.adminService.updateSystemConfig(key, value);
  }

  // Stats
  @Get('stats')
  async getStats() {
    return this.adminService.getStats();
  }

  // Logs
  @Get('llm-logs')
  async getLlmLogs(@Query('limit') limit?: string) {
    return this.adminService.getLlmLogs(limit ? parseInt(limit) : 100);
  }
}
