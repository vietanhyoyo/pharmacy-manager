import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AdminUser } from '../shared/contracts/admin-user';
import { InventoryService } from '../services/app.service';
import { InventoryAuthGuard } from '../guards/app-auth.guard';

type AuthenticatedRequest = { admin: AdminUser };

@Controller('lookups')
@UseGuards(InventoryAuthGuard)
export class LookupsController {
  constructor(private readonly inventory: InventoryService) {}

  @Get()
  getLookups(@Req() request: AuthenticatedRequest) {
    return this.inventory.lookups(request.admin);
  }
}
