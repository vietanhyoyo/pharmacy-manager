import { Body, Controller, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AdminGuard, AdminRequest } from '../../auth/admin.guard';
import { IdResponse } from '../responses/inventory.response';
import { ProductRequest } from '../requests';
import { InventoryService } from '../services/inventory.service';

@UseGuards(AdminGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly inventory: InventoryService) {}

  @Get()
  products(@Req() req: AdminRequest) {
    return this.inventory.products(req.admin);
  }

  @Post()
  createProduct(@Req() req: AdminRequest, @Body() body: ProductRequest): Promise<IdResponse> {
    return this.inventory.createProduct(req.admin, body);
  }

  @Put(':id')
  updateProduct(
    @Req() req: AdminRequest,
    @Param('id') id: string,
    @Body() body: ProductRequest,
  ): Promise<IdResponse> {
    return this.inventory.updateProduct(req.admin, id, body);
  }
}
