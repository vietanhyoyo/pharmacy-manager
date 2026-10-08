import { Body, Controller, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AdminUser } from '../../../shared/contracts/admin-user';
import { LotRequest } from '../requests';
import { InventoryService } from '../services/inventory.service';
import { InventoryAuthGuard } from './inventory-auth.guard';

type AuthenticatedRequest = { admin: AdminUser };

@Controller('v1/inventory/lots')
@UseGuards(InventoryAuthGuard)
export class LotsController {
  constructor(private readonly inventory: InventoryService) {}

  @Get()
  list(@Req() request: AuthenticatedRequest) {
    return this.inventory.lots(request.admin);
  }

  @Post()
  create(@Req() request: AuthenticatedRequest, @Body() body: LotRequest) {
    return this.inventory.createLot(request.admin, body);
  }

  @Put(':id')
  update(@Req() request: AuthenticatedRequest, @Param('id') id: string, @Body() body: LotRequest) {
    return this.inventory.updateLot(request.admin, id, body);
  }
}
