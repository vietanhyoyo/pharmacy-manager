import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
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
  list(@Req() request: AuthenticatedRequest) {
    return this.inventory.receipts(request.admin);
  }

  @Post()
  create(@Req() request: AuthenticatedRequest, @Body() body: ReceiptRequest) {
    return this.inventory.receive(request.admin, body);
  }
}
