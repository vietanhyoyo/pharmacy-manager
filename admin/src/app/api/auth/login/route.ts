import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.username !== 'string' || typeof body.password !== 'string') {
    return NextResponse.json({ message: 'Cần tài khoản và mật khẩu' }, { status: 400 });
  }
  try {
    const upstream = await fetch(`${process.env.BACKEND_URL ?? 'http://127.0.0.1:3000'}/api/v1/auth/login`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), cache: 'no-store',
    });
    const data = await upstream.json();
    if (!upstream.ok) return NextResponse.json(data, { status: upstream.status });
    const response = NextResponse.json({ user: data.user });
    response.cookies.set('admin_session', data.token, {
      httpOnly: true, sameSite: 'strict', secure: request.nextUrl.protocol === 'https:' || request.headers.get('x-forwarded-proto') === 'https', path: '/', maxAge: 8 * 3600,
    });
    return response;
  } catch {
    return NextResponse.json({ message: 'Không kết nối được máy chủ' }, { status: 502 });
  }
}
