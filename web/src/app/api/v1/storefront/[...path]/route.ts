import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const backend = (process.env.BACKEND_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  const target = `${backend}/api/v1/storefront/${path.map(encodeURIComponent).join('/')}${request.nextUrl.search}`;
  try {
    const response = await fetch(target, {
      method: request.method,
      headers: { 'content-type': request.headers.get('content-type') ?? 'application/json' },
      body: request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.text(),
      cache: 'no-store',
      signal: AbortSignal.timeout(30000),
    });
    return new NextResponse(response.body, { status: response.status, headers: { 'content-type': response.headers.get('content-type') ?? 'application/json' } });
  } catch {
    return NextResponse.json({ message: 'Không kết nối được dịch vụ bán hàng' }, { status: 502 });
  }
}

export const GET = proxy;
export const POST = proxy;
