export enum PaymentMethod {
  COD = 'cod',
  VNPAY = 'vnpay',
}

export enum OrderStatus {
  PENDING = 'pending',       // Chờ xác nhận
  CONFIRMED = 'confirmed',   // Đã xác nhận
  DELIVERING = 'delivering', // Đang giao
  COMPLETED = 'completed',   // Đã hoàn thành
  CANCELLED = 'cancelled',   // Đã hủy
}

export enum PaymentStatus {
  PENDING = 'pending',     // Chờ thanh toán
  PAID = 'paid',           // Đã thanh toán
  FAILED = 'failed',       // Thất bại
  REFUNDED = 'refunded',   // Đã hoàn tiền
}

/* 🎨 Màu sắc cho hiển thị frontend (theo Tailwind hoặc hex color) */
export const PaymentMethodColor: Record<PaymentMethod, string> = {
  [PaymentMethod.COD]: '#facc15',   // vàng — tiền mặt
  [PaymentMethod.VNPAY]: '#3b82f6', // xanh dương — online
}

export const OrderStatusColor: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: '#f59e0b',    // cam — chờ xác nhận
  [OrderStatus.CONFIRMED]: '#3b82f6',  // xanh — đã xác nhận
  [OrderStatus.DELIVERING]: '#06b6d4', // xanh ngọc — đang giao
  [OrderStatus.COMPLETED]: '#10b981',  // xanh lá — hoàn thành
  [OrderStatus.CANCELLED]: '#ef4444',  // đỏ — đã hủy
}

export const PaymentStatusColor: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: '#f59e0b',  // cam — chờ thanh toán
  [PaymentStatus.PAID]: '#10b981',     // xanh lá — đã thanh toán
  [PaymentStatus.FAILED]: '#ef4444',   // đỏ — thất bại
  [PaymentStatus.REFUNDED]: '#3b82f6', // xanh — hoàn tiền
}
