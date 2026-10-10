import axios from 'axios';

const gateway = process.env.BACKEND_URL?.replace(/\/$/, '') ?? 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: typeof window === 'undefined' ? `${gateway}/api/v1/storefront` : '/api/v1/storefront',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

export function apiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) return message.join(', ');
    if (typeof message === 'string') return message;
  }
  return 'Không kết nối được với hệ thống. Vui lòng thử lại.';
}
