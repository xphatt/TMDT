import { getD1 } from "../../../db";
import { baseProducts, categories as defaultCategories, toppings as defaultToppings } from "../../data/products";
import { applyPromotions, defaultPromotions } from "../../data/promotions";
import type { CategoryId, Product, Promotion, ToppingOption } from "../../types";
import { CompletionError } from "../completion-error";

export type CatalogueCategory = { id: CategoryId; label: string; description: string; sortOrder: number; isActive: boolean };
export type AdminCatalogueProduct = Omit<Product, "price" | "promotion" | "originalPrice"> & { basePrice: number; isActive: boolean; createdAt: string; updatedAt: string };
export type AdminTopping = ToppingOption & { isActive: boolean; updatedAt: string };

export type CatalogueSnapshot = {
  categories: Array<{ id: "all" | CategoryId; label: string; description: string }>;
  products: Product[];
  toppings: ToppingOption[];
  promotions: Promotion[];
};

type CategoryRow = { id: CategoryId; label: string; description: string; sort_order: number; is_active: number };
type ProductRow = {
  id: string; slug: string; name: string; category_id: CategoryId; base_price: number; description: string;
  ingredients: string; tags_json: string; popularity: number; image: string; image_position: string;
  tone: Product["tone"]; is_active: number; created_at: string; updated_at: string;
};
type ToppingRow = { id: string; name: string; price: number; is_active: number; updated_at: string };
type PromotionRow = { id: string; product_id: string; label: string; sale_price: number; starts_at: string; ends_at: string; is_active: number; created_at: string; updated_at: string };

function parseTags(value: string): Product["tags"] {
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.filter((tag): tag is "Bán chạy" | "Mới" => tag === "Bán chạy" || tag === "Mới") : [];
  } catch {
    return [];
  }
}

function rowToPromotion(row: PromotionRow): Promotion {
  return { id: row.id, productId: row.product_id, label: row.label, salePrice: row.sale_price, startsAt: row.starts_at, endsAt: row.ends_at, isActive: Boolean(row.is_active) };
}

export async function getCatalogueSnapshot(now = new Date()): Promise<CatalogueSnapshot> {
  try {
    const database = getD1();
    const [categoryResult, productResult, toppingResult, promotionResult] = await Promise.all([
      database.prepare("SELECT id, label, description, sort_order, is_active FROM catalogue_categories ORDER BY sort_order, label").all<CategoryRow>(),
      database.prepare("SELECT id, slug, name, category_id, base_price, description, ingredients, tags_json, popularity, image, image_position, tone, is_active, created_at, updated_at FROM catalogue_products ORDER BY popularity DESC, name").all<ProductRow>(),
      database.prepare("SELECT id, name, price, is_active, updated_at FROM catalogue_toppings ORDER BY name").all<ToppingRow>(),
      database.prepare("SELECT id, product_id, label, sale_price, starts_at, ends_at, is_active, created_at, updated_at FROM promotions ORDER BY created_at DESC").all<PromotionRow>(),
    ]);
    const categoryRows = categoryResult.results.filter((row) => Boolean(row.is_active));
    const rawProducts: Product[] = productResult.results.filter((row) => Boolean(row.is_active)).map((row) => ({
      id: row.id, slug: row.slug, name: row.name, category: row.category_id, price: row.base_price,
      description: row.description, ingredients: row.ingredients, tags: parseTags(row.tags_json), popularity: row.popularity,
      image: row.image, imagePosition: row.image_position, tone: row.tone, isActive: true,
    }));
    const promotionRows = promotionResult.results.map(rowToPromotion);
    return {
      categories: [{ id: "all", label: "Tất cả", description: "Toàn bộ món đang có" }, ...categoryRows.map((row) => ({ id: row.id, label: row.label, description: row.description }))],
      products: applyPromotions(rawProducts, promotionRows, now),
      toppings: toppingResult.results.filter((row) => Boolean(row.is_active)).map((row) => ({ id: row.id, name: row.name, price: row.price })),
      promotions: promotionRows,
    };
  } catch {
    return { categories: defaultCategories, products: applyPromotions(baseProducts, defaultPromotions, now), toppings: defaultToppings, promotions: defaultPromotions };
  }
}

export async function getAdminCatalogue() {
  const database = getD1();
  const [categoryResult, productResult, toppingResult, promotionResult] = await Promise.all([
    database.prepare("SELECT id, label, description, sort_order, is_active FROM catalogue_categories ORDER BY sort_order, label").all<CategoryRow>(),
    database.prepare("SELECT id, slug, name, category_id, base_price, description, ingredients, tags_json, popularity, image, image_position, tone, is_active, created_at, updated_at FROM catalogue_products ORDER BY updated_at DESC").all<ProductRow>(),
    database.prepare("SELECT id, name, price, is_active, updated_at FROM catalogue_toppings ORDER BY name").all<ToppingRow>(),
    database.prepare("SELECT id, product_id, label, sale_price, starts_at, ends_at, is_active, created_at, updated_at FROM promotions ORDER BY updated_at DESC").all<PromotionRow>(),
  ]);
  return {
    categories: categoryResult.results.map((row): CatalogueCategory => ({ id: row.id, label: row.label, description: row.description, sortOrder: row.sort_order, isActive: Boolean(row.is_active) })),
    products: productResult.results.map((row): AdminCatalogueProduct => ({
      id: row.id, slug: row.slug, name: row.name, category: row.category_id, basePrice: row.base_price,
      description: row.description, ingredients: row.ingredients, tags: parseTags(row.tags_json), popularity: row.popularity,
      image: row.image, imagePosition: row.image_position, tone: row.tone, isActive: Boolean(row.is_active), createdAt: row.created_at, updatedAt: row.updated_at,
    })),
    toppings: toppingResult.results.map((row): AdminTopping => ({ id: row.id, name: row.name, price: row.price, isActive: Boolean(row.is_active), updatedAt: row.updated_at })),
    promotions: promotionResult.results.map(rowToPromotion),
  };
}

const categoryIds = new Set<CategoryId>(["milk-tea", "fruit-tea", "macchiato", "topping"]);
const tones = new Set<Product["tone"]>(["milk", "orange", "green", "purple"]);

function text(value: unknown, max: number) { return typeof value === "string" ? value.trim().slice(0, max) : ""; }
function boolean(value: unknown, fallback = true) { return typeof value === "boolean" ? value : fallback; }
function integer(value: unknown, min: number, max: number) { const parsed = Number(value); return Number.isInteger(parsed) && parsed >= min && parsed <= max ? parsed : null; }

export async function saveCatalogueProduct(value: Record<string, unknown>, existingId?: string) {
  const id = existingId ?? text(value.id, 80);
  const slug = text(value.slug, 120).toLocaleLowerCase("vi");
  const name = text(value.name, 120);
  const category = text(value.category, 40) as CategoryId;
  const basePrice = integer(value.basePrice, 1000, 5_000_000);
  const description = text(value.description, 500);
  const ingredients = text(value.ingredients, 500);
  const popularity = integer(value.popularity, 0, 100) ?? 0;
  const image = text(value.image, 240);
  const imagePosition = text(value.imagePosition, 40) || "50% 50%";
  const tone = text(value.tone, 20) as Product["tone"];
  const tags = Array.isArray(value.tags) ? value.tags.filter((tag) => tag === "Bán chạy" || tag === "Mới") : [];
  const fields: Record<string, string> = {};
  if (!/^[a-zA-Z0-9_-]{1,80}$/u.test(id)) fields.id = "Mã sản phẩm chỉ dùng chữ, số, gạch ngang hoặc gạch dưới.";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(slug)) fields.slug = "Slug cần dùng chữ thường, số và gạch ngang.";
  if (name.length < 2) fields.name = "Tên sản phẩm cần có ít nhất 2 ký tự.";
  if (!categoryIds.has(category)) fields.category = "Danh mục không hợp lệ.";
  if (basePrice === null) fields.basePrice = "Giá gốc phải từ 1.000đ đến 5.000.000đ.";
  if (description.length < 10) fields.description = "Mô tả cần có ít nhất 10 ký tự.";
  if (ingredients.length < 3) fields.ingredients = "Nhập thành phần chính.";
  if (!image.startsWith("/images/") || image.includes("..")) fields.image = "Ảnh phải là asset nội bộ trong /images/.";
  if (!tones.has(tone)) fields.tone = "Tông màu không hợp lệ.";
  if (Object.keys(fields).length) throw new CompletionError("invalid_product", "Thông tin sản phẩm chưa hợp lệ.", 400, fields);
  const database = getD1();
  const now = new Date().toISOString();
  await database.prepare(`INSERT INTO catalogue_products (id, slug, name, category_id, base_price, description, ingredients, tags_json, popularity, image, image_position, tone, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET slug=excluded.slug, name=excluded.name, category_id=excluded.category_id, base_price=excluded.base_price, description=excluded.description, ingredients=excluded.ingredients, tags_json=excluded.tags_json, popularity=excluded.popularity, image=excluded.image, image_position=excluded.image_position, tone=excluded.tone, is_active=excluded.is_active, updated_at=excluded.updated_at`).bind(
    id, slug, name, category, basePrice, description, ingredients, JSON.stringify(tags), popularity, image, imagePosition, tone, boolean(value.isActive) ? 1 : 0, now, now,
  ).run();
  return getAdminCatalogue();
}

export async function setCatalogueProductActive(id: string, active: boolean) {
  const result = await getD1().prepare("UPDATE catalogue_products SET is_active = ?, updated_at = ? WHERE id = ?").bind(active ? 1 : 0, new Date().toISOString(), id).run();
  if ((result.meta.changes ?? 0) !== 1) throw new CompletionError("product_not_found", "Không tìm thấy sản phẩm.", 404);
  return getAdminCatalogue();
}

export async function savePromotion(value: Record<string, unknown>, existingId?: string) {
  const id = existingId ?? text(value.id, 80);
  const productId = text(value.productId, 80);
  const label = text(value.label, 100);
  const salePrice = integer(value.salePrice, 1000, 5_000_000);
  const startsAt = text(value.startsAt, 40);
  const endsAt = text(value.endsAt, 40);
  const startMs = Date.parse(startsAt);
  const endMs = Date.parse(endsAt);
  const database = getD1();
  const product = await database.prepare("SELECT base_price FROM catalogue_products WHERE id = ?").bind(productId).first<{ base_price: number }>();
  const fields: Record<string, string> = {};
  if (!/^[a-zA-Z0-9_-]{1,80}$/u.test(id)) fields.id = "Mã khuyến mãi không hợp lệ.";
  if (!product) fields.productId = "Sản phẩm không tồn tại.";
  if (label.length < 2) fields.label = "Nhãn khuyến mãi cần có ít nhất 2 ký tự.";
  if (salePrice === null || (product && salePrice >= product.base_price)) fields.salePrice = "Giá khuyến mãi phải nhỏ hơn giá gốc.";
  if (!Number.isFinite(startMs)) fields.startsAt = "Ngày bắt đầu không hợp lệ.";
  if (!Number.isFinite(endMs) || endMs <= startMs) fields.endsAt = "Ngày kết thúc phải sau ngày bắt đầu.";
  if (Object.keys(fields).length) throw new CompletionError("invalid_promotion", "Thông tin khuyến mãi chưa hợp lệ.", 400, fields);
  const now = new Date().toISOString();
  await database.prepare(`INSERT INTO promotions (id, product_id, label, sale_price, starts_at, ends_at, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET product_id=excluded.product_id, label=excluded.label, sale_price=excluded.sale_price, starts_at=excluded.starts_at, ends_at=excluded.ends_at, is_active=excluded.is_active, updated_at=excluded.updated_at`).bind(
    id, productId, label, salePrice, new Date(startMs).toISOString(), new Date(endMs).toISOString(), boolean(value.isActive) ? 1 : 0, now, now,
  ).run();
  return getAdminCatalogue();
}

export async function setPromotionActive(id: string, active: boolean) {
  const result = await getD1().prepare("UPDATE promotions SET is_active = ?, updated_at = ? WHERE id = ?").bind(active ? 1 : 0, new Date().toISOString(), id).run();
  if ((result.meta.changes ?? 0) !== 1) throw new CompletionError("promotion_not_found", "Không tìm thấy khuyến mãi.", 404);
  return getAdminCatalogue();
}

export async function saveCategory(id: string, value: Record<string, unknown>) {
  if (!categoryIds.has(id as CategoryId)) throw new CompletionError("category_not_found", "Danh mục không tồn tại.", 404);
  const label = text(value.label, 80);
  const description = text(value.description, 180);
  if (label.length < 2 || description.length < 3) throw new CompletionError("invalid_category", "Tên hoặc mô tả danh mục chưa hợp lệ.", 400);
  await getD1().prepare("UPDATE catalogue_categories SET label = ?, description = ?, is_active = ?, updated_at = ? WHERE id = ?").bind(label, description, boolean(value.isActive) ? 1 : 0, new Date().toISOString(), id).run();
  return getAdminCatalogue();
}

export async function saveTopping(id: string, value: Record<string, unknown>) {
  const name = text(value.name, 100);
  const price = integer(value.price, 0, 500_000);
  if (!/^[a-zA-Z0-9_-]{1,80}$/u.test(id) || name.length < 2 || price === null) throw new CompletionError("invalid_topping", "Thông tin topping chưa hợp lệ.", 400);
  const now = new Date().toISOString();
  await getD1().prepare(`INSERT INTO catalogue_toppings (id, name, price, is_active, updated_at) VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET name=excluded.name, price=excluded.price, is_active=excluded.is_active, updated_at=excluded.updated_at`).bind(id, name, price, boolean(value.isActive) ? 1 : 0, now).run();
  return getAdminCatalogue();
}
