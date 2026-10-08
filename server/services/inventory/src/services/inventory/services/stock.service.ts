import { Injectable } from '@nestjs/common';
import { AdminUser } from '../../../shared/contracts/admin-user';
import { StockRepository } from '../repositories/stock.repository';

@Injectable()
export class StockService {
  constructor(private readonly repo: StockRepository) {}

  stock(user: AdminUser) { return this.repo.stock(user.organizationId); }
}
