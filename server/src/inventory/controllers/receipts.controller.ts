import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AdminGuard, AdminRequest } from '../../auth/admin.guard';
import { ReceiptRequest } from '../requests';
import { ReceiptCreatedResponse } from '../responses/inventory.response';
import { InventoryService } from '../services/inventory.service';

@UseGuards(AdminGuard)
@Controller('admin/receipts')
export class ReceiptsController {
  constructor(private readonly inventory: InventoryService) {}

  @Get()
  receipts(@Req() req: AdminRequest) {
    return this.inventory.receipts(req.admin);
  }

  @Post()
  receive(
    @Req() req: AdminRequest,
    @Body() body: ReceiptRequest,
  ): Promise<ReceiptCreatedResponse> {
    return this.inventory.receive(req.admin, body);
  }
}
