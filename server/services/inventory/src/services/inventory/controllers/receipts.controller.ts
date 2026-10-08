import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AdminUser } from '../../../shared/contracts/admin-user';
import { ReceiptRequest } from '../requests';
import { InventoryService } from '../services/inventory.service';
import { InventoryAuthGuard } from './inventory-auth.guard';

type AuthenticatedRequest = { admin: AdminUser };

@Controller('v1/inventory/receipts')
@UseGuards(InventoryAuthGuard)
export class ReceiptsController {
  constructor(private readonly inventory: InventoryService) {}

  @Get()
  list(@Req() request: AuthenticatedRequest) {
    return this.inventory.receipts(request.admin);
  }

  @Post()
  create(@Req() request: AuthenticatedRequest, @Body() body: ReceiptRequest) {
    return this.inventory.receive(request.admin, body);
  }
}
