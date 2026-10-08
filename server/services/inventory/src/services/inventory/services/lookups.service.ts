import { Injectable } from '@nestjs/common';
import { AdminUser } from '../../../shared/contracts/admin-user';
import { LookupsRepository } from '../repositories/lookups.repository';

@Injectable()
export class LookupsService {
  constructor(private readonly repo: LookupsRepository) {}

  lookups(user: AdminUser) { return this.repo.lookups(user); }
}
