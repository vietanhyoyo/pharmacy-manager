import { BadRequestException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

export function required(value: unknown, label: string, max = 255): string {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) throw new BadRequestException(`${label} không hợp lệ`);
  return value.trim();
}
export function body(value: unknown): void {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new BadRequestException('Dữ liệu gửi lên không hợp lệ');
}
export function optional(value: unknown, max = 500): string | null {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string' || value.length > max) throw new BadRequestException('Trường văn bản không hợp lệ');
  return value.trim() || null;
}
export function positive(value: unknown, label: string, allowZero = false): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < (allowZero ? 0 : 0.000001) || value > 1e9 || !Number.isInteger(value * 1e6)) {
    throw new BadRequestException(`${label} phải là số hợp lệ (tối đa 6 chữ số thập phân)`);
  }
  return value;
}
export function date(value: unknown, label: string): string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new BadRequestException(`${label} không hợp lệ`);
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) throw new BadRequestException(`${label} không hợp lệ`);
  return value;
}
export function requireEntity<T>(entity: T | null | undefined, label: string): T {
  if (!entity) throw new BadRequestException(`${label} không tồn tại hoặc không thuộc hệ thống`);
  return entity;
}

export function translateDuplicate(error: unknown, message: string): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new ConflictException(message);
  const databaseCode = (error as { meta?: { code?: string } } | null)?.meta?.code;
  if (databaseCode === 'ER_DUP_ENTRY') throw new ConflictException(message);
  throw error;
}
