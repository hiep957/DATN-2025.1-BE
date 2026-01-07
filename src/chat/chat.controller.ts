import { ChatService } from './chat.service';
import { Controller, Post, Body, Res, Req, UseGuards } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Response } from 'express'; // Lưu ý import từ express
import { firstValueFrom } from 'rxjs'
import { AuthGuard } from 'src/common/guards/auth.guard';
@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService
  ) { }
  @Post('ask')
  @UseGuards(AuthGuard)
  async ask(
    @Body() body: { question: string },
    @Req() req: Request,
    @Res() res: Response,
  ) {
    // TODO: Lấy userId từ auth. Tạm thời mock cứng nếu bạn chưa có:
    // const userId = 1;

    const user = req['user']; // Access the user info attached by AuthGuard

    return this.chatService.askStreaming(user.sub, body.question, res);
  }
  @Post('/history')
  @UseGuards(AuthGuard)
  async history(
    @Req() req: Request,
  ) {
    const user = req['user']; // Access the user info attached by AuthGuard
    console.log("Fetching chat history for user:", user.sub);
    return this.chatService.getChatByUser(user.sub);
  }
}