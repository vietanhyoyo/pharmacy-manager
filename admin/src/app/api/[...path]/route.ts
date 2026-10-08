import { NextRequest, NextResponse } from 'next/server';

async function proxy(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const token = request.cookies.get('admin_session')?.value;
  if (!token) return NextResponse.json({ message: 'Phiên đăng nhập đã hết hạn' }, { status: 401 });
  if (request.method !== 'GET') {
    const origin = request.headers.get('origin');
    if (origin && new URL(origin).host !== request.headers.get('host')) return NextResponse.json({ message: 'Yêu cầu không hợp lệ' }, { status: 403 });
    if (!request.headers.get('content-type')?.startsWith('application/json')) return NextResponse.json({ message: 'Chỉ nhận JSON' }, { status: 415 });
  }
  const { path } = await params;
  if (!path.length || path.some(item => !/^[a-zA-Z0-9_-]+$/.test(item))) return NextResponse.json({ message: 'Đường dẫn không hợp lệ' }, { status: 400 });
  const inventoryPaths = ['dashboard', 'lookups', 'products', 'lots', 'stock', 'receipts', 'issues', 'suppliers', 'movements'];
  const isInventoryPath = path[0] === 'v1' && path[1] === 'inventory' && inventoryPaths.includes(path[2]);
  const isAuthPath = path[0] === 'v1' && path[1] === 'auth' && ['me', 'change-password'].includes(path[2]) && path.length === 3;
  if (!isInventoryPath && !isAuthPath) {
    return NextResponse.json({ message: 'Đường dẫn không hợp lệ' }, { status: 404 });
  }
  try {
    const query = request.nextUrl.search;
    const upstream = await fetch(`${process.env.BACKEND_URL ?? 'http://127.0.0.1:3000'}/api/${path.join('/')}${query}`, {
      method: request.method,
      headers: { authorization: `Bearer ${token}`, ...(request.method !== 'GET' ? { 'content-type': 'application/json' } : {}) },
      body: request.method === 'GET' ? undefined : await request.text(),
      cache: 'no-store',
    });
    const response = new NextResponse(await upstream.text(), { status: upstream.status, headers: { 'content-type': 'application/json' } });
    if (upstream.status === 401) response.cookies.delete('admin_session');
    return response;
  } catch {
    return NextResponse.json({ message: 'Không kết nối được máy chủ' }, { status: 502 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
