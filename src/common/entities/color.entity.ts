import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('colors')
export class Color {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ length: 7 })
  code: string;       // ví dụ: "white", "black", "navy"

  @Column({ length: 64 })
  name: string;       // "Trắng", "Đen", "Xanh navy"
}
