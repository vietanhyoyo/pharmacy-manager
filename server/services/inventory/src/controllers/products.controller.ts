import { Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { AdminUser } from '../shared/contracts/admin-user';
import type { ProductListQuery, ProductRequest } from '../requests';
import { InventoryService } from '../services/app.service';
import { InventoryAuthGuard } from '../guards/app-auth.guard';

type AuthenticatedRequest = { admin: AdminUser };

@Controller('products')
@UseGuards(InventoryAuthGuard)
export class ProductsController {
  constructor(private readonly inventory: InventoryService) {}

  @Get()
  list(@Req() request: AuthenticatedRequest, @Query() query: ProductListQuery) {
    return this.inventory.products(request.admin, query);
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
