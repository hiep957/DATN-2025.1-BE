// src/entities/brand.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, Index, OneToMany } from 'typeorm';
import { Product } from './product.entity';



@Entity('brands')
export class Brand {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Index({ unique: true })
  @Column({ length: 255 })
  slug: string;

  @Column({ nullable: true })
  logo_url?: string;

  @OneToMany(() => Product, (p) => p.brand)
  products: Product[];
}
