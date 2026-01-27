import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { RolesGuard } from 'src/common/guards/role.guard';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }

  @Get('categories/product-counts')
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  async getCategoryProductCounts() {
    return this.dashboardService.getCategoryProductCounts();
  }

  @Get('revenue/daily')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getDailyRevenue(@Query('days') days = '7') {
    const numDays = Number(days) || 7;
    return this.dashboardService.getDailyRevenue(numDays);
  }

  @Get('orders/status-count')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getOrderCountByStatus() {
    return this.dashboardService.getOrderCountByStatus();
  }

  @Get('/revenue/all')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getAllDailyRevenueRanges() {
    return this.dashboardService.getAllDailyRevenueRanges();
  }

  // @Get('/kpi/revenues')
  // async getRevenueKpi() {
  //   return this.dashboardService.getRevenueKpi();
  // }
  // @Get('/kpi/orders')
  // async getOrderKpi() {
  //   return this.dashboardService.getOrderKpi();
  // }
  // @Get('/kpi/users')
  // async getUserKpi() {
  //   return this.dashboardService.getUserKpi();
  // }

  @Get('/kpis')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getAllKpis() {
    return this.dashboardService.getAllKpis();
  }
}
