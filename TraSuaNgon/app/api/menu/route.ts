import { categories, products, toppings } from "../../data/products";
import { deliveryFee, sizeSurcharge } from "../../data/pricing";

export async function GET() {
  return Response.json(
    { categories, products, toppings, pricing: { sizeSurcharge, deliveryFee } },
    { headers: { "cache-control": "public, max-age=300" } },
  );
}
