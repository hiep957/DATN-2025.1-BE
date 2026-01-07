// src/payment/payment.factory.ts
import { Injectable } from '@nestjs/common';
import { CodStrategy } from './strategies/cod.strategy';
import { SepayStrategy } from './strategies/sepay.strategy';
import { IPaymentStrategy } from './interfaces/payment-strategy.interface';
import { VnPayStrategy } from './strategies/vnpay.strategy';

@Injectable()
export class PaymentStrategyFactory {
  // Inject sẵn 2 thằng này vào đây (DI - Association trong biểu đồ)
  constructor(
    private readonly codStrategy: CodStrategy,
    private readonly sePayStrategy: SepayStrategy,
    private readonly vnPayStrategy: VnPayStrategy,
  ) {}

  getStrategy(type: 'COD' | 'SEPAY'|'VNPAY'): IPaymentStrategy {
    if (type === 'SEPAY') {
      return this.sePayStrategy;
    }
    if (type === 'VNPAY') {
        return this.vnPayStrategy;
    }
    return this.codStrategy; // Mặc định là COD
  }
}