import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('sizes')
export class Size {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ length: 64 })
  code: string;       // "S", "M", "L", "36", "37"...

  @Column({ length: 64 })
  name: string;       // "Size S", "Size 37", ...
}
