import { BadRequestException, Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AdminGuard, AdminRequest } from './admin.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  login(@Body() body: { username?: string; password?: string }) {
    if (typeof body?.username !== 'string' || typeof body?.password !== 'string') throw new BadRequestException('Cần tài khoản và mật khẩu');
    return this.auth.login(body.username.trim(), body.password);
  }

  @UseGuards(AdminGuard)
  @Get('me')
  me(@Req() request: AdminRequest) { return request.admin; }

  @UseGuards(AdminGuard)
  @Post('change-password')
  changePassword(@Req() request: AdminRequest, @Body() body: { currentPassword?: string; newPassword?: string }) {
    if (typeof body?.currentPassword !== 'string' || typeof body?.newPassword !== 'string') throw new BadRequestException('Thiếu mật khẩu');
    return this.auth.changePassword(request.admin.id, body.currentPassword, body.newPassword);
  }
}
