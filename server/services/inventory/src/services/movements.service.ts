import { Injectable } from '@nestjs/common';
import { AdminUser } from '../shared/contracts/admin-user';
import { MovementsRepository } from '../repositories/movements.repository';

@Injectable()
export class MovementsService {
  constructor(private readonly repo: MovementsRepository) {}

  movements(user: AdminUser) { return this.repo.movements(user.organizationId); }
}
