import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AdminUser } from '../shared/contracts/admin-user';
import { InventoryService } from '../services/app.service';
import { InventoryAuthGuard } from '../guards/app-auth.guard';

type AuthenticatedRequest = { admin: AdminUser };

@Controller('stock')
@UseGuards(InventoryAuthGuard)
export class StockController {
  constructor(private readonly inventory: InventoryService) {}

  @Get()
  list(@Req() request: AuthenticatedRequest, @Query('warehouseId') warehouseId?: string) {
    return this.inventory.stock(request.admin, warehouseId);
  }
}
