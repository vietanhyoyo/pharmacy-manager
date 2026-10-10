import { Injectable } from '@nestjs/common';
import { AdminUser } from '../shared/contracts/admin-user';
import type { IssueRequest, LotRequest, ProductListQuery, ProductRequest, ReceiptRequest, SupplierRequest } from '../requests';
import { DashboardService } from './dashboard.service';
import { IssuesService } from './issues.service';
import { LookupsService } from './lookups.service';
import { LotsService } from './lots.service';
import { MovementsService } from './movements.service';
import { ProductsService } from './products.service';
import { ReceiptsService } from './receipts.service';
import { StockService } from './stock.service';
import { SuppliersService } from './suppliers.service';

@Injectable()
export class InventoryService {
  constructor(
    private readonly dashboardFeature: DashboardService,
    private readonly lookupsFeature: LookupsService,
    private readonly productsFeature: ProductsService,
    private readonly suppliersFeature: SuppliersService,
    private readonly lotsFeature: LotsService,
    private readonly stockFeature: StockService,
    private readonly receiptsFeature: ReceiptsService,
    private readonly issuesFeature: IssuesService,
    private readonly movementsFeature: MovementsService,
  ) {}

  lookups(user: AdminUser) { return this.lookupsFeature.lookups(user); }
  dashboard(user: AdminUser, warehouseId?: string) { return this.dashboardFeature.dashboard(user, warehouseId); }
  products(user: AdminUser, query: ProductListQuery) { return this.productsFeature.products(user, query); }
  suppliers(user: AdminUser) { return this.suppliersFeature.suppliers(user); }
  lots(user: AdminUser, warehouseId?: string) { return this.lotsFeature.lots(user, warehouseId); }
  stock(user: AdminUser, warehouseId?: string) { return this.stockFeature.stock(user, warehouseId); }
  receipts(user: AdminUser, warehouseId?: string) { return this.receiptsFeature.receipts(user, warehouseId); }
  issues(user: AdminUser, warehouseId?: string) { return this.issuesFeature.issues(user, warehouseId); }
  movements(user: AdminUser, warehouseId?: string) { return this.movementsFeature.movements(user, warehouseId); }

  createProduct(user: AdminUser, input: ProductRequest) { return this.productsFeature.createProduct(user, input); }
  updateProduct(user: AdminUser, id: string, input: ProductRequest) { return this.productsFeature.updateProduct(user, id, input); }
  createSupplier(user: AdminUser, input: SupplierRequest) { return this.suppliersFeature.createSupplier(user, input); }
  updateSupplier(user: AdminUser, id: string, input: SupplierRequest) { return this.suppliersFeature.updateSupplier(user, id, input); }
  createLot(user: AdminUser, input: LotRequest) { return this.lotsFeature.createLot(user, input); }
  updateLot(user: AdminUser, id: string, input: LotRequest) { return this.lotsFeature.updateLot(user, id, input); }
  receive(user: AdminUser, input: ReceiptRequest) { return this.receiptsFeature.receive(user, input); }
  receiveInContext(user: AdminUser, context: { branchId: string; warehouseId: string; locationId: string }, input: ReceiptRequest) {
    return this.receiptsFeature.receiveInContext(user, context, input);
  }
  issue(user: AdminUser, input: IssueRequest) { return this.issuesFeature.issue(user, input); }
}
