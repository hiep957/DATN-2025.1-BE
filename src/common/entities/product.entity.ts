import {
  Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, OneToMany, CreateDateColumn
} from 'typeorm';
import { Brand } from './brand.entity';
import { Category } from './category.entity';
import { ProductVariant } from './product-variant.entity';
import { ProductImage } from './product-image.entity';


// 1 note quan trọng, có cả mảng Product

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Index({ unique: true })
  @Column({ length: 255 })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description?: string;
  
  @ManyToOne(() => Category, (c) => c.products, { onDelete: 'SET NULL', nullable: true })
  category?: Category;

  @ManyToOne(() => Brand, (b) => b.products, { onDelete: 'SET NULL', nullable: true })
  brand?: Brand;

  @Column({ default: false })
  is_published: boolean;

  @CreateDateColumn()
  created: Date;

  // Thuộc tính chung của sản phẩm (Postgres JSONB)
  @Column({ type: 'jsonb', nullable: true })
  specs?: Record<string, any>;

  // Ảnh đại diện màu sản phẩm
  @Column({ type: 'jsonb', nullable: true })
  image_colors?: Record<string, any>;

  @OneToMany(() => ProductVariant, (v) => v.product, { cascade: true })
  variants: ProductVariant[];

  @OneToMany(() => ProductImage, (img) => img.product, { cascade: true})
  images: ProductImage[];
}
