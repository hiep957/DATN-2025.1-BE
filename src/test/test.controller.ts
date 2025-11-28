import { Controller, Get, Query, Res } from '@nestjs/common';
import { TestService } from './test.service';

@Controller('test')
export class TestController {
  constructor(private readonly testService: TestService) { }
  @Get('create')
  create(@Query() q: any, @Res() res: Response) {
    // demo: /vnpay/create?amount=100000&orderId=ABC123&info=Thanh%20toan&bankCode=NCB
    const url = this.testService.createPaymentUrl({
      amount: Number(q.amount),
      orderId: String(q.orderId),
      orderInfo: String(q.info ?? 'Thanh toan don hang'),
      ipAddr: 
        '127.0.0.1',
      bankCode: q.bankCode,
    });
    return url;
  }

  // @Get('return')
  // vnpReturn(@Query() query: any, @Res() res: Response) {
  //   const { isValid, data } = this.testService.verifyReturn(query);
  //   if (!isValid) {
  //     return res.status(HttpStatus.BAD_REQUEST).json({ code: '97', message: 'Invalid signature' });
  //   }
  //   // TODO: kiểm tra vnp_ResponseCode === '00' => thanh toán thành công
  //   return res.json({ code: '00', message: 'Ok', data });
  // }

  // @Get('ipn')
  // vnpIpn(@Query() query: any, @Res() res: Response) {
  //   const { isValid, data } = this.vnpay.verifyIpn(query);
  //   if (!isValid) {
  //     // theo spec VNPay: trả code=97 nếu sai chữ ký
  //     return res.json({ RspCode: '97', Message: 'Invalid signature' });
  //   }
  //   // TODO: kiểm tra tình trạng đơn, số tiền, vnp_TmnCode, vnp_Amount, vnp_TxnRef...
  //   // Nếu hợp lệ và xử lý thành công:
  //   return res.json({ RspCode: '00', Message: 'Confirm Success' });
  // }
}
