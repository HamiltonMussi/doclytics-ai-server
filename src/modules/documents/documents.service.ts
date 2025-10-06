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

  async processOcr(documentId: string, buffer: Buffer) {
    try {
      await this.prisma.document.update({
        where: { id: documentId },
        data: { ocrStatus: 'PROCESSING' },
      });

      const extractedText = await this.ocrService.extractTextFromBuffer(buffer);

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

  processOcrInBackground(documentId: string, buffer: Buffer) {
    this.processOcr(documentId, buffer).catch((error) => {
      console.error('Background OCR error:', error);
    });
  }

  async generateAnnotatedDocument(documentId: string, userId: string): Promise<string> {
    const document = await this.prisma.document.findFirst({
      where: { id: documentId, userId },
      include: {
        interactions: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const sections: string[] = [];

    sections.push('='.repeat(80));
    sections.push('EXTRACTED TEXT');
    sections.push('='.repeat(80));
    sections.push('');
    sections.push(document.extractedText || 'No text extracted');
    sections.push('');
    sections.push('');

    if (document.summary) {
      sections.push('='.repeat(80));
      sections.push('SUMMARY');
      sections.push('='.repeat(80));
      sections.push('');
      sections.push(this.stripMarkdown(document.summary));
      sections.push('');
      sections.push('');
    }

    if (document.interactions.length > 0) {
      sections.push('='.repeat(80));
      sections.push('LLM INTERACTIONS');
      sections.push('='.repeat(80));
      sections.push('');

      document.interactions.forEach((interaction, index) => {
        sections.push(`[Interaction ${index + 1}]`);
        sections.push('-'.repeat(80));
        sections.push('');
        sections.push('HUMAN:');
        sections.push(interaction.question);
        sections.push('');
        sections.push('ASSISTANT:');
        sections.push(this.stripMarkdown(interaction.answer));
        sections.push('');
        sections.push('');
      });
    }

    return sections.join('\n');
  }

  private stripMarkdown(text: string): string {
    return text
      .replace(/```[\s\S]*?```/g, (match) => match.replace(/```\w*\n?/g, ''))
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/^#+\s+/gm, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/^[*\-+]\s+/gm, '• ');
  }
}
