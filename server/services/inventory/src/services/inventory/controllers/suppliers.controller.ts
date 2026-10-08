import { Body, Controller, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AdminUser } from '../../../shared/contracts/admin-user';
import { SupplierRequest } from '../requests';
import { InventoryService } from '../services/inventory.service';
import { InventoryAuthGuard } from './inventory-auth.guard';

type AuthenticatedRequest = { admin: AdminUser };

@Controller('v1/inventory/suppliers')
@UseGuards(InventoryAuthGuard)
export class SuppliersController {
  constructor(private readonly inventory: InventoryService) {}

  @Get()
  list(@Req() request: AuthenticatedRequest) {
    return this.inventory.suppliers(request.admin);
  }

  @Post()
  create(@Req() request: AuthenticatedRequest, @Body() body: SupplierRequest) {
    return this.inventory.createSupplier(request.admin, body);
  }

  @Put(':id')
  update(@Req() request: AuthenticatedRequest, @Param('id') id: string, @Body() body: SupplierRequest) {
    return this.inventory.updateSupplier(request.admin, id, body);
  }
}
