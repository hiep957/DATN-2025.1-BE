import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, Unique, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity('refresh_tokens')
@Unique(['user']) // mỗi user chỉ 1 token đang hoạt động
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tokenHash: string;

  @ManyToOne(() => User, u => u.refreshTokens, { onDelete: 'CASCADE', eager: true })
  @JoinColumn()
  user: User;

  @Column({ type: 'timestamp' })
  expiresAt: Date;
}
