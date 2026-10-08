import { Body, Controller, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AdminUser } from '../../../shared/contracts/admin-user';
import { ProductRequest } from '../requests';
import { InventoryService } from '../services/inventory.service';
import { InventoryAuthGuard } from './inventory-auth.guard';

type AuthenticatedRequest = { admin: AdminUser };

@Controller('v1/inventory/products')
@UseGuards(InventoryAuthGuard)
export class ProductsController {
  constructor(private readonly inventory: InventoryService) {}

  @Get()
  list(@Req() request: AuthenticatedRequest) {
    return this.inventory.products(request.admin);
  }

  @Post()
  create(@Req() request: AuthenticatedRequest, @Body() body: ProductRequest) {
    return this.inventory.createProduct(request.admin, body);
  }

  @Put(':id')
  update(@Req() request: AuthenticatedRequest, @Param('id') id: string, @Body() body: ProductRequest) {
    return this.inventory.updateProduct(request.admin, id, body);
  }
}
