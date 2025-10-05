import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { OcrService } from '../../services/ocr.service';
import { LlmService } from '../../services/llm.service';

@Injectable()
export class DocumentsService {
  constructor(
    private prisma: PrismaService,
    private ocrService: OcrService,
    private llmService: LlmService,
  ) {}

  async create(userId: string, fileName: string, fileUrl: string) {
    const existingDocument = await this.prisma.document.findFirst({
      where: {
        userId,
        fileName,
      },
    });

    if (existingDocument) {
      throw new ConflictException('A document with this name already exists');
    }

    return this.prisma.document.create({
      data: {
        userId,
        fileName,
        fileUrl,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const document = await this.prisma.document.findFirst({
      where: { id, userId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  async remove(id: string, userId: string) {
    const document = await this.findOne(id, userId);

    await this.prisma.document.delete({
      where: { id: document.id },
    });

    return document;
  }

  async processOcr(documentId: string, fileUrl: string) {
    try {
      await this.prisma.document.update({
        where: { id: documentId },
        data: { ocrStatus: 'PROCESSING' },
      });

      const extractedText = await this.ocrService.extractText(fileUrl);

      const summary = await this.llmService.generateSummary(extractedText);

      await this.prisma.document.update({
        where: { id: documentId },
        data: {
          extractedText,
          summary,
          ocrStatus: 'COMPLETED',
        },
      });
    } catch (error) {
      await this.prisma.document.update({
        where: { id: documentId },
        data: { ocrStatus: 'FAILED' },
      });
      console.error('OCR processing failed:', error);
    }
  }

  processOcrInBackground(documentId: string, fileUrl: string) {
    this.processOcr(documentId, fileUrl).catch((error) => {
      console.error('Background OCR error:', error);
    });
  }
}
