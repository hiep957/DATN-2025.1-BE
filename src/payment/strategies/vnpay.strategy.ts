// src/payment/strategies/vnpay.strategy.ts
import { Injectable } from '@nestjs/common';
import { IPaymentStrategy } from '../interfaces/payment-strategy.interface';

@Injectable()
export class VnPayStrategy implements IPaymentStrategy {
  // Có thể inject ConfigService để lấy Key VNPAY
  // constructor(private config: ConfigService) {}

  async processPayment(orderId: string, amount: number): Promise<any> {
    // Logic: Tạo URL thanh toán, mã hóa checksum gửi sang VNPay
    const vnpUrl = 'https://sandbox.vnpayment.vn/paymentv2/...'; 
    return { status: 'redirect', method: 'VNPAY', url: vnpUrl };
  }
}