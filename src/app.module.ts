import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { LlmInteractionsModule } from './modules/llm-interactions/llm-interactions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    DocumentsModule,
    LlmInteractionsModule,
  ],
})
export class AppModule {}
