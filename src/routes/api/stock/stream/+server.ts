import type { RequestHandler } from './$types';
import { subscribeToStock } from '$lib/realtime/stock';

export const GET: RequestHandler = async () => {
  let unsubscribe: (() => void) | null = null;
  let interval: NodeJS.Timeout | null = null;
  let isClosed = false;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const safeEnqueue = (chunk: string) => {
        if (isClosed) return;
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          isClosed = true;
        }
      };

      const send = (data: any) => safeEnqueue(`data: ${JSON.stringify(data)}\n\n`);

      unsubscribe = subscribeToStock((event) => {
        send({ type: 'stock_update', payload: event });
      });

      // Heartbeat
      interval = setInterval(() => {
        safeEnqueue(': keep-alive\n\n');
      }, 15000);

      safeEnqueue(`event: open\n` + `data: ${JSON.stringify({ ok: true })}\n\n`);
    },
    cancel() {
      isClosed = true;
      if (interval) clearInterval(interval);
      interval = null;
      if (unsubscribe) unsubscribe();
      unsubscribe = null;
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive'
    }
  });
};


