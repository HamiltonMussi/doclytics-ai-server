import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { DocumentsModule } from './modules/documents/documents.module';

@Module({
  imports: [AuthModule, DocumentsModule],
})
export class AppModule {}
