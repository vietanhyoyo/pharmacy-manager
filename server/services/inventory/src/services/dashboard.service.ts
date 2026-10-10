import { Injectable } from '@nestjs/common';
import { AdminUser } from '../shared/contracts/admin-user';
import { DashboardRepository } from '../repositories/dashboard.repository';

@Injectable()
export class DashboardService {
  constructor(private readonly repo: DashboardRepository) {}

  dashboard(user: AdminUser) { return this.repo.dashboard(user); }
}
