// src/orders/entities/order.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OrderStatus, PaymentMethod, PaymentStatus } from '../utils/type.utils';
import { OrderItem } from './order-item.entity';
import { User } from 'src/users/entities/user.entity';


@Entity('orders') // Đặt tên bảng là 'orders'
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(
    () => User,
    (user) => user.orders, // 'orders' là tên thuộc tính bên trong User entity
    {
      onDelete: 'SET NULL', // Tùy chọn: Nếu User bị xóa, cột userId sẽ tự set về NULL
      nullable: true,       // Khẳng định quan hệ này có thể null
    }
  )
  @JoinColumn({ name: 'userId' }) // Chỉ định rõ cột nào là khóa ngoại
  user: User | null; // Đây là thuộc tính để truy cập đối tượng User từ Order
  @Column()
  customer_name: string;

  @Column()
  customer_phone: string;

  @Column()
  shipping_address: string;

  @Column({ nullable: true })
  note: string;

  @Column()
  payment_method: string;

  @Column()
  order_status: string;

  @Column()
  payment_status: string;

  @Column({ nullable: true }) // Mã giao dịch từ VNPAY hoặc mã đối soát
  transaction_code: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotal: number; // Tổng tiền hàng

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  shipping_fee: number; // Phí vận chuyển

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount_amount: number; // Số tiền giảm giá

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  grand_total: number; // Tổng cộng phải trả

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Định nghĩa quan hệ Một-Nhiều
  // Một Order có thể có nhiều OrderItem
  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true, // Tự động lưu/cập nhật/xóa OrderItem khi Order thay đổi
  })
  orderItems: OrderItem[];
}