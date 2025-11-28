// src/vnpay/vnpay.service.ts
import { Injectable } from '@nestjs/common';
import { VnpayService } from 'nestjs-vnpay';

@Injectable()
export class VnpayAdapterService {
  constructor(private readonly vnpay: VnpayService) {}

  // tạo URL thanh toán từ orderId, amount, ip, returnUrl, ...
  async createPaymentUrl(payload: {
    orderId: string;
    amount: number;
    ipAddr: string;
    returnUrl: string;
  }) {
    console.log('Payload VNPAY:', payload);
    return this.vnpay.buildPaymentUrl({
      vnp_Amount: payload.amount, // FIX: Use 'vnp_Amount' and multiply by 100
      vnp_OrderInfo: `Thanh toan don hang #${payload.orderId}`, // FIX: Use 'vnp_OrderInfo'
      vnp_TxnRef: payload.orderId, // FIX: Use 'vnp_TxnRef'
      vnp_IpAddr: payload.ipAddr, // FIX: Use 'vnp_IpAddr'
      vnp_ReturnUrl: payload.returnUrl, // FIX: Use 'vnp_ReturnUrl'
    });
  }

//   // verify callback / returnUrl
//   verifyReturn(query: ReturnQueryFromVNPay) {
//     return this.vnpay.verifyReturnUrl(query);
//   }

  getBankList() {
    return this.vnpay.getBankList();
  }
}
