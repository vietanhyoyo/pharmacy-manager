import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AdminUser } from '../../../shared/contracts/admin-user';
import { IssueRequest } from '../requests';
import { InventoryService } from '../services/inventory.service';
import { InventoryAuthGuard } from '../guards/inventory-auth.guard';

type AuthenticatedRequest = { admin: AdminUser };

@Controller('v1/inventory/issues')
@UseGuards(InventoryAuthGuard)
export class IssuesController {
  constructor(private readonly inventory: InventoryService) {}

  @Get()
  list(@Req() request: AuthenticatedRequest) {
    return this.inventory.issues(request.admin);
  }

  @Post()
  create(@Req() request: AuthenticatedRequest, @Body() body: IssueRequest) {
    return this.inventory.issue(request.admin, body);
  }
}
