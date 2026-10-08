import { Module } from '@nestjs/common';
import { AdminGuard } from './admin.guard';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  providers: [AuthRepository, AuthService, AdminGuard],
  exports: [AuthService, AdminGuard],
})
export class AuthModule {}
