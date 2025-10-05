import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { LlmService } from '../../services/llm.service';

@Injectable()
export class LlmInteractionsService {
  constructor(
    private prisma: PrismaService,
    private llmService: LlmService,
  ) {}

  async askQuestion(documentId: string, userId: string, question: string) {
    const document = await this.prisma.document.findFirst({
      where: { id: documentId, userId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (!document.extractedText) {
      throw new NotFoundException('Document text not extracted yet');
    }

    const previousInteractions = await this.prisma.llmInteraction.findMany({
      where: { documentId },
      orderBy: { createdAt: 'asc' },
      select: {
        question: true,
        answer: true,
      },
    });

    const answer = await this.llmService.answerQuestion(
      document.extractedText,
      question,
      previousInteractions,
    );

    const interaction = await this.prisma.llmInteraction.create({
      data: {
        documentId,
        question,
        answer,
      },
    });

    return interaction;
  }

  async getInteractions(documentId: string, userId: string) {
    const document = await this.prisma.document.findFirst({
      where: { id: documentId, userId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return this.prisma.llmInteraction.findMany({
      where: { documentId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
