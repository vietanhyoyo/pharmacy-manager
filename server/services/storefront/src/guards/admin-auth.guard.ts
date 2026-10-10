import { CanActivate, ExecutionContext, Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';

export type AdminUser = { id: string; organizationId: string; username: string; fullName?: string };

@Injectable()
export class AdminAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{ headers: { authorization?: string }; admin?: AdminUser }>();
    const authorization = request.headers.authorization;
    if (!authorization?.startsWith('Bearer ')) throw new UnauthorizedException('Unauthorized');
    try {
      const response = await fetch(`${(process.env.KAFKA_RPC_URL ?? 'http://localhost:3100').replace(/\/$/, '')}/rpc`, {
        method: 'POST', headers: { 'content-type': 'application/json', 'x-internal-service-secret': process.env.INTERNAL_SERVICE_SECRET ?? '' },
        body: JSON.stringify({ pattern: 'auth.authenticate', payload: { authorization } }), signal: AbortSignal.timeout(10_000),
      });
      if (response.status === 401) throw new UnauthorizedException('Phiên đăng nhập đã hết hạn');
      if (!response.ok) throw new ServiceUnavailableException('Không thể xác thực phiên đăng nhập');
      const admin = await response.json() as AdminUser;
      if (!admin?.id || !admin.organizationId || !admin.username) throw new ServiceUnavailableException('Auth service trả về dữ liệu không hợp lệ');
      request.admin = admin;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof ServiceUnavailableException) throw error;
      throw new ServiceUnavailableException('Auth service tạm thời không khả dụng');
    }
  }
}
