import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AdminUser } from '../shared/contracts/admin-user';
import { InventoryService } from '../services/app.service';
import { InventoryAuthGuard } from '../guards/app-auth.guard';

type AuthenticatedRequest = { admin: AdminUser };

@Controller('dashboard')
@UseGuards(InventoryAuthGuard)
export class DashboardController {
  constructor(private readonly inventory: InventoryService) {}

  @Get()
  getDashboard(@Req() request: AuthenticatedRequest, @Query('warehouseId') warehouseId?: string) {
    return this.inventory.dashboard(request.admin, warehouseId);
  }
}
