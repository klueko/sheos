type StockEvent = {
  productId: number;
  variantId: number;
  stock: number;
};

type Subscriber = (event: StockEvent) => void;

const subscribers = new Set<Subscriber>();

export function subscribeToStock(fn: Subscriber): () => void {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

export function broadcastStockUpdate(event: StockEvent) {
  for (const fn of subscribers) {
    try {
      fn(event);
    } catch {}
  }
}


