import { getD1 } from "../../../db";
import { D1OrderRepository } from "./d1-order-repository";
import { memoryOrderRepository, type OrderRepository } from "./order-repository";

export function getOrderRepository(): OrderRepository {
  if (process.env.ORDER_STORAGE === "memory") return memoryOrderRepository;
  return new D1OrderRepository(getD1());
}
