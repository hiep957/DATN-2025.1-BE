import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { OrderService } from './order.service';
import { PaymentStatus } from 'src/common/utils/type.utils';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Post('/create-payment')
  async createPayment(@Body() body: { type: 'COD' | 'VNPAY'; orderId: string; amount: number }) {

  }

  @Post('/user-orders')
  @UseGuards(AuthGuard)
  async getUserOrders(@Req() req: Request) {
    const userId = req['user'].sub;
    console.log('Fetching orders for userId:', userId);

  }

  @Get('/orders')
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  async getOrders() {
    console.log('Query Orders with params:');

  }

  @Patch('/update-order-status/:orderId')
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  async updateOrderStatus(@Param('orderId') orderId: string, @Body() body: { status: string }) {


  }

  @Patch('/update-payment-status/:orderId')
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  async updatePaymentStatus(@Param('orderId') orderId: string, @Body() body: { status: PaymentStatus }) {
    return this.orderService.updatePaymentStatus(orderId, body.status);

  }


  @Post('/create-order')
  async createOrder() {
    console.log('Creating order with data:');

  }

  @Post('/cancel-order/:orderId')
  @UseGuards(AuthGuard)
  async cancelOrder(@Param('orderId') orderId: string) {
    return this.orderService.cancelOrder(orderId);
  }


  //   @Post('/create-payment-link')
  //   async createPaymentLink(@Body() createPaymentLinkDto: CreatePaymentLinkDto) {
  //     return this.paymentService.createPaymentLink(createPaymentLinkDto);
  //   }

  //   @Post('/create-sepay-payment-link')
  //   async createSepayPaymentLink(@Body() createPaymentLinkDto: CreatePaymentLinkDto) {
  //     console.log('Creating Sepay payment link');
  //     return this.paymentService.createPaymentLinkBySepay(createPaymentLinkDto);
  //   }

}
