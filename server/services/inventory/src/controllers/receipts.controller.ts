import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AdminUser } from '../shared/contracts/admin-user';
import { ReceiptRequest } from '../requests';
import { InventoryService } from '../services/app.service';
import { InventoryAuthGuard } from '../guards/app-auth.guard';

type AuthenticatedRequest = { admin: AdminUser };

@Controller('receipts')
@UseGuards(InventoryAuthGuard)
export class ReceiptsController {
  constructor(private readonly inventory: InventoryService) {}

  @Get()
  list(@Req() request: AuthenticatedRequest, @Query('warehouseId') warehouseId?: string) {
    return this.inventory.receipts(request.admin, warehouseId);
  }

  @Post()
  create(@Req() request: AuthenticatedRequest, @Body() body: ReceiptRequest) {
    return this.inventory.receive(request.admin, body);
  }
}
