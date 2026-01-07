import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatSession } from 'src/common/entities/chat-session';
import { ChatMessage } from 'src/common/entities/chat-message';
import { User } from 'src/users/entities/user.entity';

@Module({
  controllers: [ChatController],
  providers: [ChatService],
  imports:[HttpModule, TypeOrmModule.forFeature([ChatSession, ChatMessage,User])]
})
export class ChatModule {}
