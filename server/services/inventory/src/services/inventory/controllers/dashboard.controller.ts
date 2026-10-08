import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AdminUser } from '../../../shared/contracts/admin-user';
import { InventoryService } from '../services/inventory.service';
import { InventoryAuthGuard } from './inventory-auth.guard';

type AuthenticatedRequest = { admin: AdminUser };

@Controller('v1/inventory/dashboard')
@UseGuards(InventoryAuthGuard)
export class DashboardController {
  constructor(private readonly inventory: InventoryService) {}

  @Get()
  getDashboard(@Req() request: AuthenticatedRequest) {
    return this.inventory.dashboard(request.admin);
  }
}
