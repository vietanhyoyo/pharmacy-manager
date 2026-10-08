import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AdminCredentials } from '../database/entities/admin-credentials.entity';
import { Users } from '../database/entities/users.entity';

@Injectable()
export class AuthRepository {
  constructor(private readonly db: DataSource) {}

  async findAdmin(username: string) {
    return this.db.getRepository(Users).createQueryBuilder('u')
      .innerJoin('organizations', 'o', "o.id = u.organization_id AND o.code = 'PHARMACY_DEMO' AND o.status = 'ACTIVE'")
      .innerJoin('user_roles', 'ur', 'ur.user_id = u.id')
      .innerJoin('roles', 'r', "r.id = ur.role_id AND r.code = 'ADMIN' AND r.organization_id = u.organization_id")
      .innerJoin(AdminCredentials, 'c', 'c.user_id = u.id')
      .where('u.username = :username AND u.status = :status', { username, status: 'ACTIVE' })
      .select(['u.id AS id', 'u.organization_id AS organizationId', 'u.username AS username', 'u.full_name AS fullName', 'c.password_hash AS passwordHash'])
      .getRawOne<{ id: string; organizationId: string; username: string; fullName: string; passwordHash: string }>();
  }

  async findAdminById(id: string) {
    return this.db.getRepository(Users).createQueryBuilder('u')
      .innerJoin('organizations', 'o', "o.id = u.organization_id AND o.code = 'PHARMACY_DEMO' AND o.status = 'ACTIVE'")
      .innerJoin('user_roles', 'ur', 'ur.user_id = u.id')
      .innerJoin('roles', 'r', "r.id = ur.role_id AND r.code = 'ADMIN' AND r.organization_id = u.organization_id")
      .where('u.id = :id AND u.status = :status', { id, status: 'ACTIVE' })
      .select(['u.id AS id', 'u.organization_id AS organizationId', 'u.username AS username', 'u.full_name AS fullName'])
      .getRawOne<{ id: string; organizationId: string; username: string; fullName: string }>();
  }

  async updatePassword(userId: string, passwordHash: string) {
    await this.db.getRepository(AdminCredentials).update({ userId }, { passwordHash });
  }
}
