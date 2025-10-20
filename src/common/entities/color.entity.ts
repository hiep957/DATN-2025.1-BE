import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('colors')
export class Color {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ length: 7 })
  code: string;       // "#FFFFFF", "#000000", "#000080"..

  @Column({ length: 64 })
  name: string;       // "Trắng", "Đen", "Xanh navy"

  @Column({ length: 128, nullable: true })
  englishName: string;  // "White", "Black", "Navy Blue"
}
