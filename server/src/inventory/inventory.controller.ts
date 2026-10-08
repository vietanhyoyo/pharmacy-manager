import { Body, Controller, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AdminGuard, AdminRequest } from '../auth/admin.guard';
import { InventoryService } from './inventory.service';
import { IssueInput, LotInput, ProductInput, ReceiptInput, SupplierInput } from './inventory.types';

@UseGuards(AdminGuard)
@Controller('admin')
export class InventoryController {
  constructor(private readonly inventory: InventoryService) {}

  @Get('dashboard') dashboard(@Req() req: AdminRequest) { return this.inventory.dashboard(req.admin); }
  @Get('lookups') lookups(@Req() req: AdminRequest) { return this.inventory.lookups(req.admin); }
  @Get('products') products(@Req() req: AdminRequest) { return this.inventory.products(req.admin); }
  @Post('products') createProduct(@Req() req: AdminRequest, @Body() body: ProductInput) { return this.inventory.createProduct(req.admin, body); }
  @Put('products/:id') updateProduct(@Req() req: AdminRequest, @Param('id') id: string, @Body() body: ProductInput) { return this.inventory.updateProduct(req.admin, id, body); }
  @Get('suppliers') suppliers(@Req() req: AdminRequest) { return this.inventory.suppliers(req.admin); }
  @Post('suppliers') createSupplier(@Req() req: AdminRequest, @Body() body: SupplierInput) { return this.inventory.createSupplier(req.admin, body); }
  @Put('suppliers/:id') updateSupplier(@Req() req: AdminRequest, @Param('id') id: string, @Body() body: SupplierInput) { return this.inventory.updateSupplier(req.admin, id, body); }
  @Get('lots') lots(@Req() req: AdminRequest) { return this.inventory.lots(req.admin); }
  @Post('lots') createLot(@Req() req: AdminRequest, @Body() body: LotInput) { return this.inventory.createLot(req.admin, body); }
  @Put('lots/:id') updateLot(@Req() req: AdminRequest, @Param('id') id: string, @Body() body: LotInput) { return this.inventory.updateLot(req.admin, id, body); }
  @Get('stock') stock(@Req() req: AdminRequest) { return this.inventory.stock(req.admin); }
  @Get('receipts') receipts(@Req() req: AdminRequest) { return this.inventory.receipts(req.admin); }
  @Post('receipts') receive(@Req() req: AdminRequest, @Body() body: ReceiptInput) { return this.inventory.receive(req.admin, body); }
  @Get('issues') issues(@Req() req: AdminRequest) { return this.inventory.issues(req.admin); }
  @Post('issues') issue(@Req() req: AdminRequest, @Body() body: IssueInput) { return this.inventory.issue(req.admin, body); }
  @Get('movements') movements(@Req() req: AdminRequest) { return this.inventory.movements(req.admin); }
}
