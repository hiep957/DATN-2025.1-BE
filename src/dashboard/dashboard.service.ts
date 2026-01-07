import { Injectable } from '@nestjs/common';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from 'src/common/entities/order.entity';
import { Between, Repository } from 'typeorm';
import { Category } from 'src/common/entities/category.entity';


type DailyRevenue = {
  date: string; //yyyy-mm-dd
  total: number;
}

type OrderStatus = "pending" | "confirmed" | "delivering" | "completed" | "cancelled";

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) { }
  /** Format Date -> 'yyyy-mm-dd' (để group theo ngày) */

  async getCategoryProductCounts() {
    const raw = await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoin('category.products', 'product')
      .select('category.id', 'categoryId')
      .addSelect('category.name', 'categoryName')
      .addSelect('COUNT(product.id)', 'productCount')
      .groupBy('category.id')
      .addGroupBy('category.name')
      .orderBy('category.id', 'ASC')
      .getRawMany();
    //trả về mảng
    const result = raw.map(item => ({
      categoryId: Number(item.categoryId),
      categoryName: item.categoryName,
      productCount: Number(item.productCount),
    }));
    console.log(typeof result);
    return result;
  }


  async getOrderCountByStatus() {
    const orderStatuses: OrderStatus[] = [
      "pending",
      "confirmed",
      "delivering",
      "completed",
      "cancelled"
    ];

    const results: { status: OrderStatus; count: number }[] = [];

    for (const status of orderStatuses) {
      const count = await this.orderRepository.count({
        where: { order_status: status },
      });

      results.push({ status, count });
    }
    console.log(typeof results);

    return results;
  }

  private formatDateKey(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /** Lấy doanh thu từng ngày trong N ngày gần nhất (bao gồm hôm nay) */
  async getDailyRevenue(days: number): Promise<DailyRevenue[]> {
    const now = new Date();

    // start: N-1 ngày trước (để có đủ N ngày bao gồm hôm nay)
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (days - 1));

    const end = new Date();
    end.setHours(23, 59, 59, 999);
    console.log('Lấy doanh thu từ', start, 'đến', end);
    // Lấy chỉ amount + createdAt trong khoảng [start, end]
    const transactions = await this.orderRepository.find({
      where: { created_at: Between(start, end) },
      select: ['grand_total', 'created_at'],
      order: { created_at: 'ASC' },
    });

    // Group tổng tiền theo ngày
    const map: Record<string, number> = {};

    for (const tx of transactions) {
      const created =
        tx.created_at instanceof Date
          ? tx.created_at
          : new Date(String(tx.created_at).replace(' ', 'T'));

      const key = this.formatDateKey(created);
      map[key] = (map[key] || 0) + Number(tx.grand_total);
    }

    // Build đủ N ngày liên tục, ngày không có data thì = 0
    const result: DailyRevenue[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);

      const key = this.formatDateKey(d);
      result.push({
        date: key,
        total: map[key] || 0,
      });
    }

    return result;
  }

  async getAllDailyRevenueRanges() {
    const [last7Days, last30Days, last90Days] = await Promise.all([
      this.getDailyRevenue(7),
      this.getDailyRevenue(30),
      this.getDailyRevenue(90),
    ]);

    return {
      last7Days,
      last30Days,
      last90Days,
    };
  }

  findAll() {
    return `This action returns all dashboard`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dashboard`;
  }

  update(id: number, updateDashboardDto: UpdateDashboardDto) {
    return `This action updates a #${id} dashboard`;
  }

  remove(id: number) {
    return `This action removes a #${id} dashboard`;
  }
}
