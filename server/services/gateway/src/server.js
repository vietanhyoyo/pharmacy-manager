import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import express from 'express';

const port = Number(process.env.PORT ?? 3000);
const authServiceUrl = process.env.AUTH_SERVICE_URL ?? 'http://localhost:8081';
const inventoryServiceUrl = process.env.INVENTORY_SERVICE_URL ?? 'http://localhost:3002';
const storefrontServiceUrl = process.env.STOREFRONT_SERVICE_URL ?? 'http://localhost:3003';

const app = express();
app.disable('x-powered-by');

function proxyTo(serviceUrl) {
  return async (request, response) => {
    const headers = new Headers();
    for (const [name, value] of Object.entries(request.headers)) {
      if (value === undefined || ['host', 'connection', 'content-length', 'transfer-encoding', 'keep-alive'].includes(name.toLowerCase())) continue;
      headers.set(name, Array.isArray(value) ? value.join(', ') : value);
    }

    const method = request.method.toUpperCase();
    const options = {
      method,
      headers,
      signal: AbortSignal.timeout(Number(process.env.GATEWAY_TIMEOUT_MS ?? 35000)),
    };
    if (method !== 'GET' && method !== 'HEAD') {
      options.body = request;
      options.duplex = 'half';
    }

    try {
      const target = new URL(request.originalUrl, `${serviceUrl.replace(/\/$/, '')}/`);
      const upstream = await fetch(target, options);
      response.status(upstream.status);
      for (const name of ['content-type', 'cache-control', 'etag', 'last-modified', 'content-disposition']) {
        const value = upstream.headers.get(name);
        if (value) response.setHeader(name, value);
      }
      if (!upstream.body || method === 'HEAD') return response.end();
      await pipeline(Readable.fromWeb(upstream.body), response);
    } catch (error) {
      if (response.headersSent) return response.destroy(error);
      const timedOut = error?.name === 'TimeoutError' || error?.name === 'AbortError';
      response.status(timedOut ? 504 : 502).json({ message: timedOut ? 'Dịch vụ xử lý quá thời gian' : 'Không kết nối được dịch vụ' });
    }
  };
}

app.get('/api/health', (_request, response) => response.json({ status: 'ok', service: 'gateway' }));
app.use('/api/v1/auth', proxyTo(authServiceUrl));
app.use('/api/v1/inventory', proxyTo(inventoryServiceUrl));
app.use('/api/v1/storefront', proxyTo(storefrontServiceUrl));
app.use((_request, response) => response.status(404).json({ message: 'Đường dẫn không hợp lệ' }));

const server = app.listen(port, '0.0.0.0', () => console.log(`Gateway listening on ${port}`));
function shutdown() { server.close(); }
process.once('SIGTERM', shutdown);
process.once('SIGINT', shutdown);
