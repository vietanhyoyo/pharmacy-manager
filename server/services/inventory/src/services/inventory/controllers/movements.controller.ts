import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AdminUser } from '../../../shared/contracts/admin-user';
import { InventoryService } from '../services/inventory.service';
import { InventoryAuthGuard } from './inventory-auth.guard';

type AuthenticatedRequest = { admin: AdminUser };

@Controller('v1/inventory/movements')
@UseGuards(InventoryAuthGuard)
export class MovementsController {
  constructor(private readonly inventory: InventoryService) {}

  @Get()
  list(@Req() request: AuthenticatedRequest) {
    return this.inventory.movements(request.admin);
  }
}
