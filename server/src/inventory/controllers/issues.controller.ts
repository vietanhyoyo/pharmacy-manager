import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AdminGuard, AdminRequest } from '../../auth/admin.guard';
import { IssueRequest } from '../requests';
import { IssueCreatedResponse } from '../responses/inventory.response';
import { InventoryService } from '../services/inventory.service';

@UseGuards(AdminGuard)
@Controller('admin/issues')
export class IssuesController {
  constructor(private readonly inventory: InventoryService) {}

  @Get()
  issues(@Req() req: AdminRequest) {
    return this.inventory.issues(req.admin);
  }

  @Post()
  issue(@Req() req: AdminRequest, @Body() body: IssueRequest): Promise<IssueCreatedResponse> {
    return this.inventory.issue(req.admin, body);
  }
}
