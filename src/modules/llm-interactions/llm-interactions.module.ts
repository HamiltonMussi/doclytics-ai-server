import { Module } from '@nestjs/common';
import { LlmInteractionsService } from './llm-interactions.service';
import { LlmInteractionsController } from './llm-interactions.controller';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { LlmService } from '../../services/llm.service';

@Module({
  controllers: [LlmInteractionsController],
  providers: [LlmInteractionsService, PrismaService, LlmService],
})
export class LlmInteractionsModule {}
