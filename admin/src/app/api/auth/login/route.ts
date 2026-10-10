import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient } from '@/lib/api/server-client';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.username !== 'string' || typeof body.password !== 'string') {
    return NextResponse.json({ message: 'Cần tài khoản và mật khẩu' }, { status: 400 });
  }
  try {
    const upstream = await backendApiClient.post<{ user?: unknown; token?: unknown }>(
      '/api/v1/auth/login',
      body,
      { validateStatus: () => true },
    );
    const data = upstream.data;
    if (upstream.status < 200 || upstream.status >= 300) {
      return NextResponse.json(data, { status: upstream.status });
    }
    if (!data.user || typeof data.token !== 'string') {
      return NextResponse.json({ message: 'Phản hồi đăng nhập từ máy chủ không hợp lệ' }, { status: 502 });
    }
    const response = NextResponse.json({ user: data.user });
    response.cookies.set('admin_session', data.token, {
      httpOnly: true, sameSite: 'strict', secure: request.nextUrl.protocol === 'https:' || request.headers.get('x-forwarded-proto') === 'https', path: '/', maxAge: 8 * 3600,
    });
    return response;
  } catch {
    return NextResponse.json({ message: 'Không kết nối được máy chủ' }, { status: 502 });
  }
}
