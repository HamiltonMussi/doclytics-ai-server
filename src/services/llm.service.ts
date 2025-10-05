import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class LlmService {
  private genAI: GoogleGenerativeAI;
  private model;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  async generateSummary(text: string): Promise<string> {
    const prompt = `Você é um assistente que resume documentos.
Leia o texto extraído abaixo e crie um resumo conciso (máximo 3-4 linhas) destacando as informações mais importantes.

Texto:
${text}

Resumo:`;

    const result = await this.model.generateContent(prompt);
    const response = result.response;
    return response.text();
  }
}
