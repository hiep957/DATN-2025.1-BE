import { User } from '../../users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { CartItem } from './cart-item.entity';


@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  // 1 Cart <-> 1 User
  @OneToOne(() => User, (user) => user.cart, { onDelete: 'CASCADE' })
  @JoinColumn() // giữ khóa ngoại ở bảng Cart
  user: User;

  // 1 Cart <-> n CartItem
  @OneToMany(() => CartItem, (item) => item.cart, { cascade: true })
  items?: CartItem[];
}
