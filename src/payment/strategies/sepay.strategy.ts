
import { Injectable } from '@nestjs/common';
import { IPaymentStrategy } from '../interfaces/payment-strategy.interface';
import { SePayPgClient } from 'sepay-pg-node';

@Injectable()
export class SepayStrategy implements IPaymentStrategy {
    // Có thể inject ConfigService để lấy Key VNPAY
    // constructor(private config: ConfigService) {}
    private client = new SePayPgClient({
        env: 'production',
        merchant_id: 'SP-LIVE-HMAB9B89',
        secret_key: 'spsk_live_XFme4sB9CCvuboBPkoEJ9jDPpq2YSLUf'
    });
    async processPayment(orderId: string, amount: number): Promise<any> {
        // Logic: Tạo URL thanh toán, mã hóa checksum gửi sang VNPay
        const fields = this.client.checkout.initOneTimePaymentFields({
            operation: 'PURCHASE',
            payment_method: 'BANK_TRANSFER',
            order_invoice_number: String(orderId),
            order_amount: amount,
            currency: 'VND',
            order_description: `Payment for ORDER${orderId}`,
            success_url: 'http://localhost:8000/payment',
            // rror_url?: string,
        })
        console.log('Payment Link from Sepay:', fields);
        const checkoutUrl = this.client.checkout.initCheckoutUrl();
        console.log('Checkout URL:', checkoutUrl);
        return { checkoutUrl, fields };
    }
    
}