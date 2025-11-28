// src/orders/entities/order-item.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
  Index,
} from 'typeorm';
import { Order } from './order.entity';
import { ProductVariant } from './product-variant.entity';

@Entity('order_items') // Đặt tên bảng là 'order_items'
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Index()
  @Column({ name: 'product_variant_id' })
  productVariantId: number;

  @ManyToOne(() => ProductVariant, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'product_variant_id' })
  productVariant?: ProductVariant | null;

  @Column({ type: 'int' })
  quantity: number;

  

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unit_price: number; // Đơn giá tại thời điểm mua

  // --- Dữ liệu "denormalized" (phi chuẩn hóa) ---
  // Lưu lại để tránh mất mát thông tin khi sản phẩm gốc bị xóa/sửa

  @Column()
  productName: string; // Tên sản phẩm tại thời điểm mua

  @Column()
  link_image: string; // Ảnh sản phẩm tại thời điểm mua

  // --- Định nghĩa quan hệ Nhiều-Một ---
  // Nhiều OrderItem thuộc về một Order
  @ManyToOne(() => Order, (order) => order.orderItems, {
    onDelete: 'CASCADE', // Nếu xóa Order, tự động xóa các OrderItem liên quan
  })
  @JoinColumn({ name: 'orderId' }) // Chỉ định cột foreign key
  order: Order;
}