import { Injectable } from '@nestjs/common';
import { AdminUser } from '../../../shared/contracts/admin-user';
import { IssueRequest, LotRequest, ProductRequest, ReceiptRequest, SupplierRequest } from '../requests';
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
  dashboard(user: AdminUser) { return this.dashboardFeature.dashboard(user); }
  products(user: AdminUser) { return this.productsFeature.products(user); }
  suppliers(user: AdminUser) { return this.suppliersFeature.suppliers(user); }
  lots(user: AdminUser) { return this.lotsFeature.lots(user); }
  stock(user: AdminUser) { return this.stockFeature.stock(user); }
  receipts(user: AdminUser) { return this.receiptsFeature.receipts(user); }
  issues(user: AdminUser) { return this.issuesFeature.issues(user); }
  movements(user: AdminUser) { return this.movementsFeature.movements(user); }

  createProduct(user: AdminUser, input: ProductRequest) { return this.productsFeature.createProduct(user, input); }
  updateProduct(user: AdminUser, id: string, input: ProductRequest) { return this.productsFeature.updateProduct(user, id, input); }
  createSupplier(user: AdminUser, input: SupplierRequest) { return this.suppliersFeature.createSupplier(user, input); }
  updateSupplier(user: AdminUser, id: string, input: SupplierRequest) { return this.suppliersFeature.updateSupplier(user, id, input); }
  createLot(user: AdminUser, input: LotRequest) { return this.lotsFeature.createLot(user, input); }
  updateLot(user: AdminUser, id: string, input: LotRequest) { return this.lotsFeature.updateLot(user, id, input); }
  receive(user: AdminUser, input: ReceiptRequest) { return this.receiptsFeature.receive(user, input); }
  issue(user: AdminUser, input: IssueRequest) { return this.issuesFeature.issue(user, input); }
}
