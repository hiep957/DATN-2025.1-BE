import { Inject, Injectable } from '@nestjs/common';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from 'src/common/entities/order.entity';
import { Between, In, Repository } from 'typeorm';
import { Category } from 'src/common/entities/category.entity';
import { User } from 'src/users/entities/user.entity';
import { Review } from 'src/common/entities/review.entity';
import { DashboardKpiDto } from './dto/kpi-dashboard.dto';


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
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
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
      where: { created_at: Between(start, end), order_status: 'completed' },
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

  async getAllKpis(): Promise<DashboardKpiDto> {
    const [revenue, orders, users, reviews] = await Promise.all([
      this.getRevenueKpi(),
      this.getOrderKpi(),
      this.getUserKpi(),
      this.getReviewKpi(),
    ]);

    return {
      totalRevenue: revenue.totalRevenue,
      todayRevenue: revenue.todayRevenue,

      totalOrders: orders.totalOrders,
      todayOrders: orders.todayOrders,

      totalUsers: users.totalUsers,
      todayUsers: users.todayUsers,

      totalReviews: reviews.totalReviews,
      todayReviews: reviews.todayReviews,
    };
  }

  async getRevenueKpi() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
    const totalQb = this.orderRepository
      .createQueryBuilder('o')
      .select('COALESCE(SUM(o.grand_total), 0)', 'totalRevenue')
      .andWhere('o.order_status = :done', { done: 'completed' });
    const [totalResult] = await totalQb.getRawMany();

    const todayQb = this.orderRepository
      .createQueryBuilder('o')
      .select('COALESCE(SUM(o.grand_total), 0)', 'todayRevenue')
      .andWhere('o.order_status = :done', { done: 'completed' })
      .andWhere('o.created_at >= :startOfToday AND o.created_at < :startOfTomorrow', {
        startOfToday,
        startOfTomorrow,
      });
    const [todayResult] = await todayQb.getRawMany();
    return {
      totalRevenue: Number(totalResult.totalRevenue ?? 0),
      todayRevenue: Number(todayResult.todayRevenue ?? 0),
    };
  }

  async getOrderKpi() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
    const totalOrders = await this.orderRepository.count();
    const todayOrders = await this.orderRepository.count({
      where: {
        created_at: Between(startOfToday, startOfTomorrow),
      },
    });
    return {
      totalOrders: Number(totalOrders ?? 0),
      todayOrders: Number(todayOrders ?? 0),
    };
  }

  async getUserKpi() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

    // ====== (A) Tổng user ======
    const totalUsers = await this.userRepository.count();

    // ====== (B) User tạo hôm nay ======
    const todayUsers = await this.userRepository
      .createQueryBuilder('u')
      .where('u.createdAt >= :start AND u.createdAt < :end', {
        start: startOfToday,
        end: startOfTomorrow,
      })
      .getCount();

    return {
      totalUsers: Number(totalUsers ?? 0),
      todayUsers: Number(todayUsers ?? 0),
    };
  }


  async getReviewKpi() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
    // ====== (A) Tổng review ======
    const totalReviews = await this.reviewRepository.count();
    // ====== (B) Review tạo hôm nay ======
    const todayReviews = await this.reviewRepository
      .createQueryBuilder('r')
      .where('r.createdAt >= :start AND r.createdAt < :end', {
        start: startOfToday,
        end: startOfTomorrow,
      })
      .getCount();
    return {
      totalReviews: Number(totalReviews ?? 0),
      todayReviews: Number(todayReviews ?? 0),
    };
  }



}
