import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query, Res, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentLinkDto } from './dto/create-payment.dto';
import { CreateOrderDto } from './dto/order.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Roles } from 'src/common/decorators/role.decorator';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) { }

  @Post('/create-payment')
  async createPayment(@Body() body: { type: 'COD' | 'VNPAY'; orderId: string; amount: number }) {
    return this.paymentService.createPayment(body.type, body.orderId, body.amount);
  }

  @Post('/user-orders')
  @UseGuards(AuthGuard)
  async getUserOrders(@Req() req: Request) {
    const userId = req['user'].sub;
    console.log('Fetching orders for userId:', userId);
    return this.paymentService.getOrderByUser(userId);
  }

  @Get('/orders')
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  async getOrders(@Query() query: QueryOrdersDto) {
    console.log('Query Orders with params:', query);
    return this.paymentService.getOrders(query);
  }

  @Patch('/update-order-status/:orderId')
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  async updateOrderStatus(@Param('orderId') orderId: string, @Body() body: { status: string }) {
    console.log('Updating order status for orderId:', orderId, 'to status:', body.status);
    return this.paymentService.updateOrderStatus(orderId, body.status);
  }

  @Post('/create-order')
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    console.log('Creating order with data:', createOrderDto);
    return this.paymentService.createOrder(createOrderDto);
  }


  @Post('/create-payment-link')
  async createPaymentLink(@Body() createPaymentLinkDto: CreatePaymentLinkDto) {
    return this.paymentService.createPaymentLink(createPaymentLinkDto);
  }

  @Post('/create-sepay-payment-link')
  async createSepayPaymentLink(@Body() createPaymentLinkDto: CreatePaymentLinkDto) {
    console.log('Creating Sepay payment link');
    return this.paymentService.createPaymentLinkBySepay(createPaymentLinkDto);
  }

  @Post('/process-cod')
  async processCod(@Body() body: { orderId: string; userId: string }) {

    const { orderId, userId } = body;
    console.log('Processing COD for orderId:', orderId, 'userId:', userId);
    return this.paymentService.processPaymentByCod(orderId, userId);
  }


  @Post('/sepay-ipn')
  async sepayIpn(
    @Body() body: any,
  ) {

    // 2) Xử lý event
    await this.paymentService.handleSepayIpn(body);

    // 3) ACK cho SePay
    return { success: true };
  }


  @Post('/vnpay-ipn')
  async vnpayIpn(@Query() query: Record<string, any>, @Res() res: Response) {
    console.log('VNPAY IPN Request:', query);
    const result = await this.paymentService.handleVnpayIpn(query);
    return result
  }

}
