
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';


@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255 })
  slug: string;

  @Column({ nullable: true })
  thumbnail?: string;

  @ManyToOne(() => Category, (c) => c.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  parent?: Category;

  @OneToMany(() => Category, (c) => c.parent)
  children: Category[];

  @OneToMany(() => Product, (p) => p.category)
  products: Product[];
}
