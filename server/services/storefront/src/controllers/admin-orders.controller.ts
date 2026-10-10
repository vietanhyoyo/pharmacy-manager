import { Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AdminAuthGuard, AdminUser } from '../guards/admin-auth.guard';
import { AdminOrdersService } from '../services/admin-orders.service';

@Controller('admin')
@UseGuards(AdminAuthGuard)
export class AdminOrdersController {
  constructor(private readonly orders: AdminOrdersService) {}

  @Get('branches') branches(@Req() request: { admin: AdminUser }) { return this.orders.branches(request.admin); }
  @Get('orders') list(@Req() request: { admin: AdminUser }, @Query('branchId') branchId?: string, @Query('status') status?: string, @Query('search') search?: string, @Query('page') page?: string) {
    return this.orders.list(request.admin, { branchId, status, search, page });
  }
  @Get('orders/:id') detail(@Req() request: { admin: AdminUser }, @Param('id') id: string) { return this.orders.detail(request.admin, id); }
  @Post('orders/:id/confirm') confirm(@Req() request: { admin: AdminUser }, @Param('id') id: string) { return this.orders.action(request.admin, id, 'confirm'); }
  @Post('orders/:id/dispatch') dispatch(@Req() request: { admin: AdminUser }, @Param('id') id: string) { return this.orders.action(request.admin, id, 'dispatch'); }
  @Post('orders/:id/complete') complete(@Req() request: { admin: AdminUser }, @Param('id') id: string) { return this.orders.action(request.admin, id, 'complete'); }
  @Post('orders/:id/cancel') cancel(@Req() request: { admin: AdminUser }, @Param('id') id: string) { return this.orders.action(request.admin, id, 'cancel'); }
}
