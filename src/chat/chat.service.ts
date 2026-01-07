import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import { unwatchFile } from 'fs';
import { ChatMessage } from 'src/common/entities/chat-message';
import { ChatSession } from 'src/common/entities/chat-session';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
type HistoryMessage = {
    role: 'user' | 'assistant' | 'system';
    content: string;
};
@Injectable()
export class ChatService {
    private readonly pythonApiUrl =
        'https://unpolitely-multihued-jaydon.ngrok-free.dev/chat_stream';
    constructor(
        @InjectRepository(ChatSession)
        private readonly sessionRepo: Repository<ChatSession>,
        @InjectRepository(ChatMessage)
        private readonly messageRepo: Repository<ChatMessage>,
        private readonly httpService: HttpService,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
    ) { }

    /**
  * Hàm xử lý 1 câu hỏi:
  * - Tìm / tạo session theo userId
  * - Lưu message của user
  * - Gọi Python stream xuống FE
  * - Khi stream xong, lưu message của assistant
  */
    async askStreaming(userId: number, question: string, res: Response) {
        try {

            let session = await this.sessionRepo.findOne({ where: { userId: Number(userId) } });
            if (!session) {
                session = this.sessionRepo.create({ userId: Number(userId) });
                session = await this.sessionRepo.save(session);
            }

            const historyForLLM = await this.getHistoryForLLM(
                session.id,
                4, // lấy 10 message gần nhất
            );
            console.log('History for LLM:', historyForLLM);
            // 2. Lưu message của user vào DB
            const userMsg = this.messageRepo.create({
                session: session,
                role: 'user',
                content: question,
                metadata: null,
            });

            const savedUserMsg = await this.messageRepo.save(userMsg);
            console.log('Saving user message:', savedUserMsg);
            const response = await this.httpService.axiosRef.post(
                this.pythonApiUrl,
                { question, history: historyForLLM },
                { responseType: 'stream' },
            );
            // 4. Thiết lập header cho stream
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.setHeader('Transfer-Encoding', 'chunked');

            // 5. Vừa stream xuống FE, vừa gom text để lát lưu DB
            let fullAnswer = '';
            let lastMetadata: any = null;

            response.data.on('data', (chunk: Buffer) => {
                const text = chunk.toString('utf8');

                // Cộng dồn nội dung để lưu DB (nếu cần)
                fullAnswer += text;

                // Stream thẳng text xuống frontend
                res.write(text);
            });
            response.data.on('end', async () => {
                // 6. Khi stream xong => lưu message assistant
                if (fullAnswer.trim().length > 0) {
                    const botMsg = this.messageRepo.create({
                        session: session,
                        role: 'assistant',
                        content: fullAnswer,
                        metadata: lastMetadata,
                    });
                    await this.messageRepo.save(botMsg);
                }
                res.end();
            });
            console.log("Metadata last:", lastMetadata);
            console.log('Stream ending...', fullAnswer);
            response.data.on('error', (err: any) => {
                if (!res.headersSent) {
                    res.status(500).json({ message: 'Lỗi stream từ AI Service' });
                } else {
                    res.end();
                }
            });
        } catch (error) {
            if (!res.headersSent) {
                throw new InternalServerErrorException('Lỗi kết nối tới AI Service');
            } else {
                res.end();
            }

        }
    }

    // 2. Lấy history gần nhất để gửi cho LLM
    async getHistoryForLLM(
        sessionId: string,
        limit: number,
    ): Promise<HistoryMessage[]> {
        const session = await this.sessionRepo.findOne({ where: { id: sessionId } });
        if (!session) {
            throw new InternalServerErrorException('Session not found');
        }
        const messages = await this.messageRepo.find({
            where: { session: { id: sessionId } },
            order: { createdAt: 'DESC' },
            take: limit,
        });

        // đảo lại cho đúng thứ tự thời gian
        messages.reverse();

        // chỉ giữ user + assistant (bỏ system nếu muốn)
        return messages
            .filter((m) => m.role === 'user' || m.role === 'assistant')
            .map((m) => ({
                role: m.role as 'user' | 'assistant' | 'system',
                content: m.content,
            }));
    }


    /**
     * 
     * @param userId 
     * Mỗi người chỉ có 1 session nên get để xem lịch sử chat
     */
    async getChatByUser(userId: number) {
        const session = await this.sessionRepo.findOne({ where: { userId: Number(userId) } });
        if (!session) {
            throw new InternalServerErrorException('Session not found');
        }
        const messages = await this.messageRepo.find({
            where: { session: { id: session.id } },
            order: { createdAt: 'ASC' },
        });
        if (!messages) {
            throw new InternalServerErrorException('Messages not found');
        }
        return messages;
    }

}
