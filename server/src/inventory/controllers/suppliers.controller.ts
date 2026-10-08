import { Body, Controller, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AdminGuard, AdminRequest } from '../../auth/admin.guard';
import { SupplierRequest } from '../requests';
import { IdResponse } from '../responses/inventory.response';
import { InventoryService } from '../services/inventory.service';

@UseGuards(AdminGuard)
@Controller('admin/suppliers')
export class SuppliersController {
  constructor(private readonly inventory: InventoryService) {}

  @Get()
  suppliers(@Req() req: AdminRequest) {
    return this.inventory.suppliers(req.admin);
  }

  @Post()
  createSupplier(@Req() req: AdminRequest, @Body() body: SupplierRequest): Promise<IdResponse> {
    return this.inventory.createSupplier(req.admin, body);
  }

  @Put(':id')
  updateSupplier(
    @Req() req: AdminRequest,
    @Param('id') id: string,
    @Body() body: SupplierRequest,
  ): Promise<IdResponse> {
    return this.inventory.updateSupplier(req.admin, id, body);
  }
}
