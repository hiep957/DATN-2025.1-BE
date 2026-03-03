
import { Injectable } from '@nestjs/common';
import { IPaymentStrategy } from '../interfaces/payment-strategy.interface';
import { SePayPgClient } from 'sepay-pg-node';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SepayStrategy implements IPaymentStrategy {
    private client: SePayPgClient;

    constructor(private configService: ConfigService) {
        // 2. Khởi tạo client trong constructor để dùng được configService
        this.client = new SePayPgClient({
            env: (this.configService.get<string>('SEPAY_ENV') ?? 'production') as 'production' | 'sandbox',
            merchant_id: this.configService.get<string>('SEPAY_MERCHANT_ID') ?? '',
            secret_key: this.configService.get<string>('SEPAY_SECRET_KEY') ?? '',
        });
    }

    async processPayment(orderId: string, amount: number): Promise<any> {
        // Logic: Tạo URL thanh toán, mã hóa checksum gửi sang VNPay
        const fields = this.client.checkout.initOneTimePaymentFields({
            operation: 'PURCHASE',
            payment_method: 'BANK_TRANSFER',
            order_invoice_number: String(orderId),
            order_amount: 2000, // Số tiền thanh toán
            currency: 'VND',
            order_description: `Payment for ORDER${orderId}`,
            success_url: 'https://datn-2025-1-fe.vercel.app/payment',
            // rror_url?: string,
        })
        console.log('Payment Link from Sepay:', fields);
        const checkoutUrl = this.client.checkout.initCheckoutUrl();
        console.log('Checkout URL:', checkoutUrl);
        return { checkoutUrl, fields };
    }

}