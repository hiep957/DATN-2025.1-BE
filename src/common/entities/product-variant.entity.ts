import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, Index, Unique
} from 'typeorm';
import { Product } from './product.entity';

import { Color } from './color.entity';
import { Size } from './size.entity';
import { CartItem } from './cart-item.entity';


@Entity('product_variants')
@Unique('UQ_product_color_size', ['product', 'color', 'size'])
export class ProductVariant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  price: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  compare_at_price?: string;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @ManyToOne(() => Product, (p) => p.variants, { onDelete: 'CASCADE' })
  product: Product;

  @ManyToOne(() => Color, { eager: true, onDelete: 'RESTRICT' })
  color: Color;

  @ManyToOne(() => Size, { eager: true, onDelete: 'RESTRICT' })
  size: Size;

  //sản phẩm đã bán được
  @Column({ type: 'int', default: 0 })
  sold: number;

  @OneToMany(() => CartItem, (ci) => ci.variant)
  cartItems: CartItem[];

}
