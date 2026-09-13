import { deliveryFee, sizeSurcharge } from "../../data/pricing";
import { getCatalogueSnapshot } from "../../server/catalogue/catalogue-service";

export async function GET() {
  const { categories, products, toppings } = await getCatalogueSnapshot();
  return Response.json(
    { categories, products, toppings, pricing: { sizeSurcharge, deliveryFee } },
    { headers: { "cache-control": "public, max-age=300" } },
  );
}
