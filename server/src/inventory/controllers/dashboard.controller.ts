import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AdminGuard, AdminRequest } from '../../auth/admin.guard';
import { InventoryService } from '../services/inventory.service';

@UseGuards(AdminGuard)
@Controller('admin')
export class DashboardController {
  constructor(private readonly inventory: InventoryService) {}

  @Get('dashboard')
  dashboard(@Req() req: AdminRequest) {
    return this.inventory.dashboard(req.admin);
  }

  @Get('lookups')
  lookups(@Req() req: AdminRequest) {
    return this.inventory.lookups(req.admin);
  }

  @Get('stock')
  stock(@Req() req: AdminRequest) {
    return this.inventory.stock(req.admin);
  }

  @Get('movements')
  movements(@Req() req: AdminRequest) {
    return this.inventory.movements(req.admin);
  }
}
