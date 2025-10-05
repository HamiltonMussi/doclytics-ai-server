import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StorageService } from '../../services/storage.service';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly storageService: StorageService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({ fileType: '.(jpg|jpeg|png|pdf)' }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Request() req,
  ) {
    const fileUrl = await this.storageService.upload(file);

    const document = await this.documentsService.create(
      req.user.id,
      file.originalname,
      fileUrl,
    );
    // TODO: change this to queue
    this.documentsService.processOcrInBackground(document.id, fileUrl);

    return document;
  }

  @Get()
  async findAll(@Request() req) {
    return this.documentsService.findAll(req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.documentsService.findOne(id, req.user.id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const document = await this.documentsService.findOne(id, req.user.id);

    await this.storageService.delete(document.fileUrl);

    await this.documentsService.remove(id, req.user.id);

    return { message: 'Document deleted successfully' };
  }
}
