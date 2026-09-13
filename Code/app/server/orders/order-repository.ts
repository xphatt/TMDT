import type { OrderRecord } from "./order-types";

export interface OrderRepository {
  create(order: OrderRecord): Promise<OrderRecord>;
  findById(id: string): Promise<OrderRecord | null>;
  findByIdempotencyKey(key: string): Promise<OrderRecord | null>;
  update(order: OrderRecord): Promise<OrderRecord>;
}

class MemoryOrderRepository implements OrderRepository {
  private readonly orders = new Map<string, OrderRecord>();

  async create(order: OrderRecord) {
    this.orders.set(order.id, structuredClone(order));
    if (this.orders.size > 100) {
      const oldestId = this.orders.keys().next().value;
      if (oldestId) this.orders.delete(oldestId);
    }
    return structuredClone(order);
  }

  async findById(id: string) {
    const order = this.orders.get(id);
    return order ? structuredClone(order) : null;
  }

  async findByIdempotencyKey(key: string) {
    const order = [...this.orders.values()].find((entry) => entry.idempotencyKey === key);
    return order ? structuredClone(order) : null;
  }

  async update(order: OrderRecord) {
    this.orders.set(order.id, structuredClone(order));
    return structuredClone(order);
  }
}

export const memoryOrderRepository: OrderRepository = new MemoryOrderRepository();
