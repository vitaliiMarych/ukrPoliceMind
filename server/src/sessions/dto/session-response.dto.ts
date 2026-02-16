import { SessionMode } from '@prisma/client';

export class SessionResponseDto {
  id: string;
  userId: string;
  mode: SessionMode;
  topic?: string | null;
  title?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
