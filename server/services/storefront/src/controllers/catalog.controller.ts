import { Controller, Get, Param, Query } from '@nestjs/common';
import { CatalogService } from '../services/catalog.service';

@Controller()
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('branches') branches() { return this.catalog.branches(); }

  @Get('categories') categories(@Query('branchId') branchId?: string) { return this.catalog.categories(branchId); }

  @Get('products') products(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('page') page?: string,
    @Query('branchId') branchId?: string,
  ) { return this.catalog.products({ search, category, page, branchId }); }

  @Get('products/:slug') product(@Param('slug') slug: string, @Query('branchId') branchId?: string) { return this.catalog.product(slug, branchId); }
}
