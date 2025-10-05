import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

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

    return { message: 'Document deleted successfully' };
  }
}
