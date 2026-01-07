import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePaymentLinkDto } from './dto/create-payment.dto';
import { VnpayAdapterService } from 'src/vnpay/vnpay.service';
import moment from 'moment';
import * as crypto from 'crypto';
import * as qs from 'qs'
import dayjs = require('dayjs');
import { CreateOrderDto } from './dto/order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from 'src/common/entities/order.entity';
import { DataSource, In, Repository } from 'typeorm';
import { OrderItem } from 'src/common/entities/order-item.entity';
import { ProductVariant } from 'src/common/entities/product-variant.entity';
import { OrderStatus, PaymentMethod, PaymentStatus } from 'src/common/utils/type.utils';
import { User } from 'src/users/entities/user.entity';
import { CartsService } from 'src/carts/carts.service';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { SePayPgClient } from 'sepay-pg-node';
import { PaymentStrategyFactory } from './payment.factory';

@Injectable()
export class PaymentService {
  private client = new SePayPgClient({
    env: 'production',
    merchant_id: 'SP-LIVE-HMAB9B89',
    secret_key: 'spsk_live_XFme4sB9CCvuboBPkoEJ9jDPpq2YSLUf'
  });
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    private readonly dataSource: DataSource,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ProductVariant)
    private readonly productVariantRepository: Repository<ProductVariant>,
    private readonly cartsService: CartsService,
    private readonly paymentFactory: PaymentStrategyFactory
  ) { }

  async createPayment(type: 'COD' | 'SEPAY' | 'VNPAY', orderId: string, amount: number) {
    // Bước 1: Lấy chiến lược phù hợp
    const strategy = this.paymentFactory.getStrategy(type);

    // Bước 2: Thực thi (Đa hình)
    return strategy.processPayment(orderId, amount);
  }

  async handleSepayIpn(data: any) {
    console.log('Received Sepay IPN data:', data);
    const type = data?.notification_type;

    if (type !== 'ORDER_PAID') {
      // ignore các event khác (hoặc log)
      return;
    }
    const orderId = data.order.order_invoice_number;
    if (!orderId) {
      return new BadRequestException('Missing order ID in Sepay IPN data');
    }

    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['orderItems', 'user'],
    })

    if (!order) {
      console.error('IPN: Order not found', { orderId });
      throw new BadRequestException('Order not found');
    }
    console.log("Order found:", order);
    //update order payment status

    order.payment_status = PaymentStatus.PAID;

    //Trừ sản phẩm đã bán
    const variantIds = order.orderItems.map(item => item.productVariantId);
    for (const variantId of variantIds) {
      const variant = await this.productVariantRepository.findOne({
        where: { id: variantId }
      })
      if (!variant) throw new BadRequestException('Product variant not found');
      variant.sold += order.orderItems
        .filter(item => item.productVariantId === variantId)
        .reduce((sum, item) => sum + item.quantity, 0);
      await this.productVariantRepository.save(variant);

      variant.quantity -= order.orderItems
        .filter(item => item.productVariantId === variantId)
        .reduce((sum, item) => sum + item.quantity, 0);
      await this.productVariantRepository.save(variant);
      if (variant.quantity < 0) {
        variant.quantity = 0;
        await this.productVariantRepository.save(variant);
      }
      await this.cartsService.removeItemFromCart(variantId, Number(order.user?.id));
    }
    await this.orderRepository.save(order);

  }

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    const { userId, customer_name, customer_phone,
      shipping_address, note, payment_method,
      order_status, payment_status, transaction_code,
      subtotal, shipping_fee, discount_amount, grand_total, orderItems } = dto;

    const order = this.orderRepository.create({
      customer_name,
      customer_phone,
      shipping_address,
      note,
      payment_method,
      order_status,
      payment_status,
      transaction_code,
      subtotal,
      shipping_fee,
      discount_amount,
      grand_total,
      user: userId ? await this.userRepository.findOne({ where: { id: Number(userId) } }) : null,
    })

    for (const item of orderItems) {
      const variant = await this.productVariantRepository.findOne({
        where: { id: item.productVariantId }
      })
      if (!variant) throw new BadRequestException('Product variant not found');
      if (variant.quantity < item.quantity) {
        throw new BadRequestException(`Màu và size này của sản phẩm ${item.productName} không đủ số lượng.`);
      }
    }

    order.orderItems = orderItems.map((item) => {
      const orderItem = new OrderItem();
      orderItem.productVariantId = item.productVariantId;
      orderItem.quantity = item.quantity;
      orderItem.unit_price = item.unit_price;
      orderItem.productName = item.productName;
      orderItem.link_image = item.link_image;
      return orderItem;
    })
    return this.orderRepository.save(order);

  }

  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new BadRequestException('Order not found');
    }
    order.order_status = status;
    return this.orderRepository.save(order);
  }

  async updatePaymentStatus(orderId: string, status: PaymentStatus): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new BadRequestException('Order not found');
    }
    order.payment_status = status;
    return this.orderRepository.save(order);
  }

  async createPaymentLink(createPaymentLinkDto: CreatePaymentLinkDto): Promise<{ paymentUrl: string, orderId: string }> {
    process.env.TZ = 'Asia/Ho_Chi_Minh';
    const date = new Date();
    const createDate = dayjs(date).format('YYYYMMDDHHmmss');

    const tmnCode = "1QQJHY7E"
    const secretKey = "LIZO8N5JJ2LT0SY9O56YI3RXN6318TEU"
    const vnpUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"
    const returnUrl = "http://localhost:8000/payment"
    const bankCode = "NCB"
    const language = 'vn';
    const ipAddr = '127.0.0.1';
    if (!tmnCode || !secretKey || !vnpUrl || !returnUrl) {
      throw new Error('Missing VNPAY config');
    }

    const amountPay = createPaymentLinkDto.amount * 100; // nhân 100 theo quy ước của VNPAY
    const orderId = createPaymentLinkDto.orderId;
    const orderInfo = `Thanh toan cho ma GD:${orderId}`;

    const vnp_Params_raw: Record<string, any> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Locale: language,
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: 'other',
      vnp_Amount: amountPay,
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
    };
    if (bankCode) vnp_Params_raw['vnp_BankCode'] = bankCode.toUpperCase();

    // sort + encode kiểu VNP
    const sorted = Object.keys(vnp_Params_raw)
      .sort()
      .reduce((acc, key) => {
        acc[key] = encodeURIComponent(vnp_Params_raw[key]).replace(/%20/g, '+');
        return acc;
      }, {} as Record<string, string>);

    const signData = qs.stringify(sorted, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const signature = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    sorted['vnp_SecureHash'] = signature;

    const paymentUrl = `${vnpUrl}?${qs.stringify(sorted, { encode: false })}`;
    return { paymentUrl, orderId };
  }


  async createPaymentLinkBySepay(createPaymentLinkDto: CreatePaymentLinkDto) {
    const fields = this.client.checkout.initOneTimePaymentFields({
      operation: 'PURCHASE',
      payment_method: 'BANK_TRANSFER',
      order_invoice_number: String(createPaymentLinkDto.orderId),
      order_amount: 2000,
      currency: 'VND',
      order_description: `Payment for ORDER${createPaymentLinkDto.orderId}`,
    })
    console.log('Payment Link from Sepay:', fields);
    const checkoutUrl = this.client.checkout.initCheckoutUrl();
    console.log('Checkout URL:', checkoutUrl);
    return { checkoutUrl, fields };
  }

  async handleVnpayIpn(query: Record<string, any>) {
    // Lấy secretKey từ config (phải giống hệt lúc tạo link)
    const secretKey = "LIZO8N5JJ2LT0SY9O56YI3RXN6318TEU";

    // Lấy các tham số từ query
    const vnp_SecureHash = query['vnp_SecureHash'];
    const vnp_TxnRef = query['vnp_TxnRef']; // Đây là orderId của bạn
    const vnp_ResponseCode = query['vnp_ResponseCode'];

    // Xóa vnp_SecureHash và vnp_SecureHashType (nếu có) khỏi query để chuẩn bị hash
    delete query['vnp_SecureHash'];
    delete query['vnp_SecureHashType'];

    // Sắp xếp các key theo thứ tự alphabet
    const sortedKeys = Object.keys(query).sort();

    // Tạo chuỗi signData
    let signData = '';
    for (const key of sortedKeys) {
      const value = query[key];
      // Bỏ qua các giá trị rỗng
      if (value === null || value === undefined || value === '') {
        continue;
      }
      // VNPAY yêu cầu encode value, nhưng query từ NestJS/Express thường đã được decode
      // Tuy nhiên, VNPAY docs nói rõ là phải dùng "raw" query, nên cẩn thận
      // Cách an toàn nhất là dùng qs.stringify như lúc tạo link

      // *** Tạm dùng cách build string thủ công để kiểm soát ***
      // LƯU Ý: Nếu giá trị chứa dấu cách, VNPAY IPN có thể gửi là dấu '+'
      // Cần đảm bảo logic encode/decode nhất quán.
      // Dưới đây là cách an toàn nhất, giả định `query` đã được decode
      const encodedKey = encodeURIComponent(key);
      const encodedValue = encodeURIComponent(value).replace(/%20/g, '+');
      signData += (signData ? '&' : '') + `${encodedKey}=${encodedValue}`;
    }

    // Hash dữ liệu bằng secretKey
    const hmac = crypto.createHmac('sha512', secretKey);
    const calculatedHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    // 1. KIỂM TRA CHỮ KÝ
    if (vnp_SecureHash !== calculatedHash) {
      console.error('IPN: Invalid checksum', { vnp_SecureHash, calculatedHash, signData });
      // Chữ ký sai -> Không xử lý
      return { RspCode: '97', Message: 'Invalid Checksum' };
    }

    // 2. KIỂM TRA ĐƠN HÀNG (Dùng vnp_TxnRef)
    // TODO: Tìm đơn hàng trong DB của bạn bằng vnp_TxnRef (orderId)
    // const order = await this.orderRepository.findOne({ where: { id: vnp_TxnRef } });
    const order = await this.orderRepository.findOne({
      where: { id: vnp_TxnRef },
      relations: ['orderItems', 'user'],
    })

    if (!order) {
      console.error('IPN: Order not found', { vnp_TxnRef });
      throw new BadRequestException('Order not found');
    }
    console.log("Order found:", order);
    //update order payment status
    if (vnp_ResponseCode === '00') {
      order.payment_status = PaymentStatus.PAID;
    } else {
      order.payment_status = PaymentStatus.FAILED;
    }
    //Trừ sản phẩm đã bán
    const variantIds = order.orderItems.map(item => item.productVariantId);
    for (const variantId of variantIds) {
      const variant = await this.productVariantRepository.findOne({
        where: { id: variantId }
      })
      if (!variant) throw new BadRequestException('Product variant not found');
      variant.sold += order.orderItems
        .filter(item => item.productVariantId === variantId)
        .reduce((sum, item) => sum + item.quantity, 0);
      await this.productVariantRepository.save(variant);

      variant.quantity -= order.orderItems
        .filter(item => item.productVariantId === variantId)
        .reduce((sum, item) => sum + item.quantity, 0);
      await this.productVariantRepository.save(variant);
      if (variant.quantity < 0) {
        variant.quantity = 0;
        await this.productVariantRepository.save(variant);
      }
      await this.cartsService.removeItemFromCart(variantId, Number(order.user?.id));
    }
    await this.orderRepository.save(order);

    // 3. TRẢ VỀ KẾT QUẢ CHO VNPAY
    return { RspCode: '00', Message: 'Confirm Success' };
  }


  async processPaymentByCod(orderId: string, userId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['orderItems', 'user'],
    });
    if (!order) {
      throw new BadRequestException('Order not found');
    }
    order.payment_status = PaymentStatus.PENDING;
    order.order_status = OrderStatus.PENDING;
    //tru so luong san pham
    const variantIds = order.orderItems.map(item => item.productVariantId);
    for (const variantId of variantIds) {
      const variant = await this.productVariantRepository.findOne({
        where: { id: variantId }
      })
      if (!variant) throw new BadRequestException('Product variant not found');
      variant.sold += order.orderItems
        .filter(item => item.productVariantId === variantId)
        .reduce((sum, item) => sum + item.quantity, 0);
      await this.productVariantRepository.save(variant);

      variant.quantity -= order.orderItems
        .filter(item => item.productVariantId === variantId)
        .reduce((sum, item) => sum + item.quantity, 0);
      await this.productVariantRepository.save(variant);
      if (variant.quantity < 0) {
        variant.quantity = 0;
        await this.productVariantRepository.save(variant);
      }
      await this.cartsService.removeItemFromCart(variantId, Number(order.user?.id));
    }
    await this.orderRepository.save(order);
    return order;
  }


  // Get Orders for Admin with pagination and filters can be added here
  async getOrders(query: QueryOrdersDto) {
    const { q, payment_method, payment_status, order_status, sortBy, sortOrder, page = 1, limit = 10 } = query;
    const qb = this.orderRepository.createQueryBuilder('order');
    qb.leftJoinAndSelect('order.orderItems', 'orderItem');
    qb.leftJoinAndSelect('order.user', 'user');
    console.log('Building query with params:', query);
    if (q) {

      qb.andWhere('order.customer_name LIKE :q OR order.customer_phone LIKE :q', { q: `%${q}%` });
      console.log('Added search filter for query:', q);
    }

    if (payment_method) {
      qb.andWhere('order.payment_method = :payment_method', { payment_method });
    }
    if (payment_status) {
      qb.andWhere('order.payment_status = :payment_status', { payment_status });
    }
    if (order_status) {
      qb.andWhere('order.order_status = :order_status', { order_status });
    }
    if (sortBy) {
      qb.orderBy(`order.${sortBy}`, sortOrder === 'DESC' ? 'DESC' : 'ASC');
    } else {
      qb.orderBy('order.created_at', 'DESC');
    }
    qb.skip((page - 1) * limit).take(limit);
    // ⏱️ Thực thi
    const [data, total] = await qb.getManyAndCount();
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getOrderByUser(userId: string): Promise<Order[]> {
    const orders = await this.orderRepository.find({
      where: { user: { id: Number(userId) } },
      relations: ['orderItems', 'user'],
    });

    return orders;
  }




}
