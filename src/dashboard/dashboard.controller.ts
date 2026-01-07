import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('categories/product-counts')
  async getCategoryProductCounts() {
    return this.dashboardService.getCategoryProductCounts();
  }

   @Get('revenue/daily')
  async getDailyRevenue(@Query('days') days = '7') {
    const numDays = Number(days) || 7;
    return this.dashboardService.getDailyRevenue(numDays);
  }

  @Get('orders/status-count')
  async getOrderCountByStatus() {
    return this.dashboardService.getOrderCountByStatus();
  }

  @Get('/revenue/all')
  async getAllDailyRevenueRanges() {
    return this.dashboardService.getAllDailyRevenueRanges();
  }

  @Get()
  findAll() {
    return this.dashboardService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dashboardService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDashboardDto: UpdateDashboardDto) {
    return this.dashboardService.update(+id, updateDashboardDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dashboardService.remove(+id);
  }
}
