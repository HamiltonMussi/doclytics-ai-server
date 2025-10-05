import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { LlmInteractionsModule } from './modules/llm-interactions/llm-interactions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    DocumentsModule,
    LlmInteractionsModule,
  ],
})
export class AppModule {}
