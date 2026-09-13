import { effectiveProductPrice, isPromotionActive } from "../domain/completion-rules";
import type { Product, Promotion } from "../types";

export const defaultPromotions: Promotion[] = [
  {
    id: "promo-tra-dao-2026",
    productId: "p4",
    label: "Ưu đãi mùa trà",
    salePrice: 37000,
    startsAt: "2026-01-01T00:00:00.000Z",
    endsAt: "2027-12-31T23:59:59.999Z",
    isActive: true,
  },
];

export function applyPromotions(baseProducts: Product[], promotions: Promotion[], now = new Date()): Product[] {
  return baseProducts.map((product) => {
    const promotion = promotions.find((entry) => entry.productId === product.id && isPromotionActive(entry, now));
    const price = effectiveProductPrice(product.price, promotion ?? null, now);
    return promotion && price < product.price
      ? { ...product, price, originalPrice: product.price, promotion }
      : { ...product, originalPrice: undefined, promotion: undefined };
  });
}
