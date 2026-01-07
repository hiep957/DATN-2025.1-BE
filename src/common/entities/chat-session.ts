import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ChatMessage } from "./chat-message";



@Entity('chat_sessions')
export class ChatSession {
    // Define columns and relationships as needed
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @OneToOne(() => User, (user) => user.chatSession, { onDelete: 'CASCADE' })
    user: User;

    @Column({ name: 'user_id' })
    userId: number; 
    @OneToMany(() => ChatMessage, (msg) => msg.session)
    messages: ChatMessage[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

}