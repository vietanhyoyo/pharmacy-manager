import crypto from 'node:crypto';
import express from 'express';
import { Kafka } from 'kafkajs';

const port = Number(process.env.PORT ?? 3100);
const brokers = (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(',').map(value => value.trim()).filter(Boolean);
const secret = process.env.INTERNAL_SERVICE_SECRET ?? '';
if (secret.length < 32 || secret.startsWith('replace_with_')) throw new Error('INTERNAL_SERVICE_SECRET must be a random value of at least 32 characters');

const topics = {
  auth: 'pharmacy.auth.requests',
  replies: 'pharmacy.rpc.responses',
};
const allowedPatterns = new Set([
  'auth.health', 'auth.login', 'auth.authenticate', 'auth.change-password',
]);
const kafka = new Kafka({ clientId: 'pharmacy-kafka-rpc', brokers });
const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'pharmacy-kafka-rpc-responses' });
const pending = new Map();
let ready = false;

await producer.connect();
await consumer.connect();
await consumer.subscribe({ topic: topics.replies, fromBeginning: false });
await consumer.run({ eachMessage: async ({ message }) => {
  if (!message.value) return;
  try {
    const response = JSON.parse(message.value.toString());
    const waiter = pending.get(response.id);
    if (!waiter) return;
    pending.delete(response.id);
    clearTimeout(waiter.timer);
    waiter.resolve(response);
  } catch (error) {
    console.error('Invalid Kafka reply', error);
  }
}});
ready = true;

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));
app.get('/health', (_request, response) => response.status(ready ? 200 : 503).json({ status: ready ? 'ok' : 'starting', service: 'kafka' }));
app.post('/rpc', async (request, response) => {
  if (request.header('x-internal-service-secret') !== secret) return response.status(401).json({ message: 'Unauthorized' });
  const { pattern, payload } = request.body ?? {};
  if (typeof pattern !== 'string' || !allowedPatterns.has(pattern)) return response.status(400).json({ message: 'Kafka pattern không được hỗ trợ' });
  if (!ready) return response.status(503).json({ message: 'Kafka service chưa sẵn sàng' });

  const id = crypto.randomUUID();
  let timer;
  const result = new Promise((resolve, reject) => {
    timer = setTimeout(() => {
      pending.delete(id);
      reject(Object.assign(new Error('Service không phản hồi kịp thời'), { status: 504 }));
    }, Number(process.env.RPC_TIMEOUT_MS ?? 30000));
    pending.set(id, { resolve, reject, timer });
  });
  try {
    await producer.send({ topic: topics.auth, messages: [{ key: id, value: JSON.stringify({ id, pattern, payload, replyTo: topics.replies }) }] });
    const rpcResponse = await result;
    if (rpcResponse.ok) return response.json(rpcResponse.data);
    const failure = rpcResponse.error ?? {};
    return response.status(Number(failure.status) || 500).json({ message: failure.message ?? 'Lỗi nội bộ service' });
  } catch (error) {
    if (error?.status === 504) return response.status(504).json({ message: error.message });
    console.error('Kafka RPC failed', error);
    return response.status(503).json({ message: 'Kafka service tạm thời không khả dụng' });
  } finally {
    const waiter = pending.get(id);
    if (waiter) { clearTimeout(waiter.timer); pending.delete(id); }
  }
});

const server = app.listen(port, '0.0.0.0', () => console.log(`Kafka RPC service listening on ${port}`));
async function shutdown() {
  ready = false;
  server.close();
  await Promise.allSettled([consumer.disconnect(), producer.disconnect()]);
  for (const [id, waiter] of pending) { clearTimeout(waiter.timer); waiter.reject(new Error('Kafka service stopped')); pending.delete(id); }
}
process.once('SIGTERM', shutdown);
process.once('SIGINT', shutdown);
