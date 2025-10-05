import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { StorageService } from '../../services/storage.service';
import { OcrService } from '../../services/ocr.service';
import { LlmService } from '../../services/llm.service';

@Module({
  controllers: [DocumentsController],
  providers: [DocumentsService, PrismaService, StorageService, OcrService, LlmService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
