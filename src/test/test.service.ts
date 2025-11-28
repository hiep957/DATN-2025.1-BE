import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import tz from 'dayjs/plugin/timezone';
import { buildQueryToSign, hmacSHA512, sortObject } from 'src/common/utils/vnpay.utils';

@Injectable()
export class TestService {
    private vnp_TmnCode = process.env.VNP_TMN_CODE!;
    private vnp_HashSecret = process.env.VNP_HASH_SECRET!;
    private vnp_Url = process.env.VNP_URL!;           // https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
    private vnp_ReturnUrl = process.env.VNP_RETURN_URL!; // URL FE/BE nhận return

    // amount: đơn vị VND (chưa x100), orderId: chuỗi duy nhất
    createPaymentUrl({
        amount,
        orderId,
        orderInfo,
        ipAddr,
        bankCode,
        locale = 'vn',
        currCode = 'VND',
    }: {
        amount: number;
        orderId: string;
        orderInfo: string;
        ipAddr: string;
        bankCode?: string;
        locale?: 'vn' | 'en';
        currCode?: 'VND';
    }) {
        const now = dayjs().tz('Asia/Ho_Chi_Minh');
        const createDate = now.format('YYYYMMDDHHmmss');

        const rawParams: Record<string, any> = {
            vnp_Version: '2.1.0',
            vnp_Command: 'pay',
            vnp_TmnCode: this.vnp_TmnCode,
            vnp_Locale: locale,
            vnp_CurrCode: currCode,
            vnp_TxnRef: orderId,
            vnp_OrderInfo: orderInfo,
            vnp_OrderType: 'other',
            vnp_Amount: amount * 100, // BẮT BUỘC x100
            vnp_ReturnUrl: this.vnp_ReturnUrl,
            vnp_IpAddr: ipAddr || '127.0.0.1',
            vnp_CreateDate: createDate,
            // vnp_ExpireDate: now.add(15, 'minute').format('YYYYMMDDHHmmss'), // optional
        };

        if (bankCode) rawParams['vnp_BankCode'] = bankCode;

        const sorted = sortObject(rawParams);
        const queryToSign = buildQueryToSign(sorted);
        const secureHash = hmacSHA512(this.vnp_HashSecret, queryToSign);

        const url = `${this.vnp_Url}?${queryToSign}&vnp_SecureHash=${secureHash}`;
        return url;
    }

    // Verify chữ ký ở trang return (user được redirect về)
    verifyReturn(query: Record<string, string | string[]>) {
        const vnp_Params = { ...query } as Record<string, string>;
        const secureHash = vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        const sorted = sortObject(vnp_Params);
        const queryToSign = buildQueryToSign(sorted);
        const checkHash = hmacSHA512(this.vnp_HashSecret, queryToSign);

        const isValid = checkHash === secureHash;
        return { isValid, data: vnp_Params };
    }

    // Verify chữ ký ở IPN (server-to-server callback)
    verifyIpn(query: Record<string, string | string[]>) {
        // VNPay gọi về bằng query string (GET), xử lý giống verifyReturn
        return this.verifyReturn(query);
    }
}
