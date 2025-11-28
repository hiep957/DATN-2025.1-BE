import { ChatService } from './chat.service';
import { Controller, Post, Body, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Response } from 'express'; // Lưu ý import từ express
import { firstValueFrom } from 'rxjs'
@Controller('chat')
export class ChatController {
  constructor(
    private readonly httpService: HttpService
  ) { }
  @Post('ask')
  async ask(@Body() body: { question: string }, @Res() res: Response) {
    const pythonApiUrl = 'https://unpolitely-multihued-jaydon.ngrok-free.dev/chat_stream';

    try {
      // 1. Gọi sang Python với responseType là 'stream'
      const response = await this.httpService.axiosRef.post(
        pythonApiUrl,
        { question: body.question },
        { responseType: 'stream' } // Quan trọng!
      );

      // 2. Thiết lập Header để Frontend biết đây là text stream
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Transfer-Encoding', 'chunked');

      // 3. Pipe (nối ống) dữ liệu trực tiếp từ Python xuống Client
      response.data.pipe(res);

    } catch (error) {
      console.error('Error calling Python Service:', error);
      res.status(500).json({ message: 'Lỗi kết nối tới AI Service' });
    }
  }
}
