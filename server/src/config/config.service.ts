import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService) {}

  get databaseUrl(): string {
    return this.configService.get<string>('DATABASE_URL') || '';
  }

  get jwtSecret(): string {
    return this.configService.get<string>('JWT_SECRET') || 'secret';
  }

  get jwtAccessExpiration(): string {
    return this.configService.get<string>('JWT_ACCESS_EXPIRATION') || '15m';
  }

  get jwtRefreshExpiration(): string {
    return this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d';
  }

  get geminiApiKey(): string {
    return this.configService.get<string>('GEMINI_API_KEY') || '';
  }

  get port(): number {
    return this.configService.get<number>('PORT') || 3000;
  }

  get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV') || 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }
}
