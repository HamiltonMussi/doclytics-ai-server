import { Controller, Post, Get, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { LlmInteractionsService } from './llm-interactions.service';
import { AskQuestionDto } from './dto/ask-question.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('documents/:documentId/interactions')
@UseGuards(JwtAuthGuard)
export class LlmInteractionsController {
  constructor(private readonly llmInteractionsService: LlmInteractionsService) {}

  @Post('ask')
  async ask(
    @Param('documentId') documentId: string,
    @Body() askQuestionDto: AskQuestionDto,
    @Request() req,
  ) {
    return this.llmInteractionsService.askQuestion(
      documentId,
      req.user.id,
      askQuestionDto.question,
    );
  }

  @Get()
  async findAll(@Param('documentId') documentId: string, @Request() req) {
    return this.llmInteractionsService.getInteractions(documentId, req.user.id);
  }

  @Delete()
  async clear(@Param('documentId') documentId: string, @Request() req) {
    return this.llmInteractionsService.clearInteractions(documentId, req.user.id);
  }
}
