// chat-message.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { ChatSession } from './chat-session';


export type ChatRole = 'user' | 'assistant' | 'system';

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ChatSession, (session) => session.messages, {
    onDelete: 'CASCADE',
  })
  session: ChatSession;


  @Column({ type: 'varchar', length: 20 })
  role: ChatRole; // 'user' | 'assistant' | 'system'

  @Column({ type: 'text' })
  content: string;

  // Nếu muốn lưu thêm metadata RAG (nguồn, id sản phẩm, vv)
  @Column({ type: 'jsonb', nullable: true })
  metadata: any; // { productIds: [1,2], sources: [...] }

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
