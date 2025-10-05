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

  async answerQuestion(
    documentText: string,
    question: string,
    previousInteractions?: Array<{ question: string; answer: string }>,
  ): Promise<string> {
    let conversationContext = '';

    if (previousInteractions && previousInteractions.length > 0) {
      conversationContext = '\n---HISTÓRICO DE CONVERSAS ANTERIORES (para contexto)---\n';
      previousInteractions.forEach((interaction) => {
        conversationContext += `\nHumano: ${interaction.question}\nAssistente: ${interaction.answer}\n`;
      });
      conversationContext += '\n---FIM DO HISTÓRICO---\n';
    }

    const prompt = `Você é um assistente especializado em análise de documentos. Sua tarefa é responder perguntas baseando-se EXCLUSIVAMENTE no conteúdo do DOCUMENTO fornecido abaixo.

Regras:
- Responda apenas com informações presentes no DOCUMENTO
- O histórico de conversas é apenas para contexto, NÃO invente informações que não estejam no documento
- Se a informação não estiver no DOCUMENTO, diga claramente que não encontrou
- Seja claro, objetivo e conciso
- Use formatação markdown se necessário para melhor legibilidade

---DOCUMENTO ORIGINAL (fonte da verdade)---
${documentText}
---FIM DO DOCUMENTO---
${conversationContext}

Pergunta atual do Humano: ${question}

Resposta do Assistente:`;

    const result = await this.model.generateContent(prompt);
    const response = result.response;
    return response.text();
  }
}
