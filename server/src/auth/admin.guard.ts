import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AdminUser, AuthService } from './auth.service';

export type AdminRequest = { headers: { authorization?: string }; admin: AdminUser };

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AdminRequest>();
    request.admin = await this.auth.authenticate(request.headers.authorization);
    return true;
  }
}
