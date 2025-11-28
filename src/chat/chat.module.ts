import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [ChatController],
  providers: [ChatService],
  imports:[HttpModule]
})
export class ChatModule {}
