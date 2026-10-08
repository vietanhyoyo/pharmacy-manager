import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { AuthRepository } from './auth.repository';

const scrypt = promisify(scryptCallback);
export type AdminUser = { id: string; organizationId: string; username: string; fullName: string };

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const hash = (await scrypt(password, salt, 64) as Buffer).toString('hex');
  return `${salt}:${hash}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hex] = stored.split(':');
  if (!salt || !hex || hex.length !== 128) return false;
  const hash = await scrypt(password, salt, 64) as Buffer;
  return timingSafeEqual(hash, Buffer.from(hex, 'hex'));
}

@Injectable()
export class AuthService {
  private readonly secret: string;

  constructor(private readonly repo: AuthRepository) {
    this.secret = process.env.ADMIN_JWT_SECRET ?? '';
    if (this.secret.length < 32 || this.secret.startsWith('replace_with_')) throw new Error('ADMIN_JWT_SECRET must be a random value of at least 32 characters');
  }

  async login(username: string, password: string) {
    const user = await this.repo.findAdmin(username);
    if (!user || !(await verifyPassword(password, user.passwordHash))) throw new UnauthorizedException('Tài khoản hoặc mật khẩu không đúng');
    const { passwordHash: _, ...admin } = user;
    return { token: this.sign({ sub: admin.id, org: admin.organizationId, exp: Math.floor(Date.now() / 1000) + 8 * 3600 }), user: admin };
  }

  async authenticate(authorization?: string): Promise<AdminUser> {
    if (!authorization?.startsWith('Bearer ')) throw new UnauthorizedException();
    const token = authorization.slice(7);
    const [header, payload, signature] = token.split('.');
    if (!header || !payload || !signature) throw new UnauthorizedException();
    const expected = createHmac('sha256', this.secret).update(`${header}.${payload}`).digest();
    const actual = Buffer.from(signature, 'base64url');
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw new UnauthorizedException();
    let claims: { sub?: string; org?: string; exp?: number };
    try { claims = JSON.parse(Buffer.from(payload, 'base64url').toString()); }
    catch { throw new UnauthorizedException(); }
    if (!claims.sub || !claims.org || !claims.exp || claims.exp <= Date.now() / 1000) throw new UnauthorizedException();
    const user = await this.repo.findAdminById(claims.sub);
    if (!user || user.organizationId !== claims.org) throw new UnauthorizedException();
    return user;
  }

  async changePassword(userId: string, currentPassword: string, nextPassword: string) {
    if (nextPassword.length < 12 || nextPassword.length > 128) throw new BadRequestException('Mật khẩu mới cần từ 12 đến 128 ký tự');
    const user = await this.repo.findAdminById(userId);
    const credentials = user && await this.repo.findAdmin(user.username);
    if (!credentials || !(await verifyPassword(currentPassword, credentials.passwordHash))) throw new UnauthorizedException('Mật khẩu hiện tại không đúng');
    await this.repo.updatePassword(userId, await hashPassword(nextPassword));
    return { message: 'Đã đổi mật khẩu' };
  }

  private sign(claims: object): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify(claims)).toString('base64url');
    const signature = createHmac('sha256', this.secret).update(`${header}.${payload}`).digest('base64url');
    return `${header}.${payload}.${signature}`;
  }
}
