import { Injectable } from '@nestjs/common';
import Tesseract from 'tesseract.js';

@Injectable()
export class OcrService {
  async extractText(imageUrl: string): Promise<string> {
    const result = await Tesseract.recognize(imageUrl, 'por', {
      logger: (m) => console.log(m),
    });

    return result.data.text;
  }

  async extractTextFromBuffer(buffer: Buffer): Promise<string> {
    const result = await Tesseract.recognize(buffer, 'por', {
      logger: (m) => console.log(m),
    });

    return result.data.text;
  }
}
