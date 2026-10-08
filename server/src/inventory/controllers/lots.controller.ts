import { Body, Controller, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AdminGuard, AdminRequest } from '../../auth/admin.guard';
import { LotRequest } from '../requests';
import { IdResponse } from '../responses/inventory.response';
import { InventoryService } from '../services/inventory.service';

@UseGuards(AdminGuard)
@Controller('admin/lots')
export class LotsController {
  constructor(private readonly inventory: InventoryService) {}

  @Get()
  lots(@Req() req: AdminRequest) {
    return this.inventory.lots(req.admin);
  }

  @Post()
  createLot(@Req() req: AdminRequest, @Body() body: LotRequest): Promise<IdResponse> {
    return this.inventory.createLot(req.admin, body);
  }

  @Put(':id')
  updateLot(
    @Req() req: AdminRequest,
    @Param('id') id: string,
    @Body() body: LotRequest,
  ): Promise<IdResponse> {
    return this.inventory.updateLot(req.admin, id, body);
  }
}
