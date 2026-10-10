import { Controller, Get, Param, Query } from '@nestjs/common';
import { CatalogService } from '../services/catalog.service';

@Controller()
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('categories') categories() { return this.catalog.categories(); }

  @Get('products') products(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('page') page?: string,
  ) { return this.catalog.products({ search, category, page }); }

  @Get('products/:slug') product(@Param('slug') slug: string) { return this.catalog.product(slug); }
}
