import { apiClient } from './client';
import { API_PREFIXES } from '../../constants/api-paths';
import type { ChangePasswordRequest, LoginRequest } from './req/auth.req';
import type { AdminUser, LoginResponse } from './res/auth.res';

export async function login(request: LoginRequest): Promise<AdminUser> {
  const { data } = await apiClient.post<LoginResponse>('/auth/login', request);
  return data.user;
}

export async function getCurrentAdmin(): Promise<AdminUser> {
  const { data } = await apiClient.get<AdminUser>(`${API_PREFIXES.auth}/me`);
  return data;
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}

export async function changePassword(request: ChangePasswordRequest): Promise<void> {
  await apiClient.post(`${API_PREFIXES.auth}/change-password`, request);
}
