import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Cart } from './cart.entity';
import { ProductVariant } from './product-variant.entity';

@Entity('cart_item')
export class CartItem {
    @PrimaryGeneratedColumn()
    id: number;


    @ManyToOne(() => ProductVariant, (v) => v.cartItems, { onDelete: 'RESTRICT' })
    variant: ProductVariant;

    @Column({ default: 1 })
    quantity: number;

    @Column({nullable: true})
    productId: number;

    @Column({ nullable: true })
    productName: string;

    @Column({nullable: true})
    productImage: string;

    // n CartItem <-> 1 Cart
    @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
    cart: Cart;
}
