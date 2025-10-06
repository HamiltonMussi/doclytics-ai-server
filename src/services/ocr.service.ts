import { Injectable } from '@nestjs/common';
import Tesseract from 'tesseract.js';
import { extractText, getDocumentProxy } from 'unpdf';

@Injectable()
export class OcrService {
  async extractText(imageUrl: string): Promise<string> {
    const result = await Tesseract.recognize(imageUrl, 'por', {
      logger: (m) => console.log(m),
    });

    return result.data.text;
  }

  async extractTextFromBuffer(buffer: Buffer): Promise<string> {
    if (this.isPdf(buffer)) {
      const pdf = await getDocumentProxy(new Uint8Array(buffer));
      const { text } = await extractText(pdf, { mergePages: true });
      return text;
    }

    const result = await Tesseract.recognize(buffer, 'por', {
      logger: (m) => console.log(m),
    });

    return result.data.text;
  }

  private isPdf(buffer: Buffer): boolean {
    if (buffer.length < 5) return false;
    const header = buffer.toString('ascii', 0, 5);
    return header === '%PDF-';
  }
}
