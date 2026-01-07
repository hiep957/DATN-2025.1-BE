// src/payment/interfaces/payment-strategy.interface.ts
export interface IPaymentStrategy {
  processPayment(orderId: string, amount: number): Promise<any>;
}