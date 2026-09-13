"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { AdminCatalogueProduct, AdminTopping, CatalogueCategory } from "../../server/catalogue/catalogue-service";
import type { AdminRole } from "../../server/auth/admin-auth";
import type { Promotion } from "../../types";
import { AdminApiError, adminFetch, formatAdminVnd } from "../admin-client";

type CatalogueData = { products: AdminCatalogueProduct[]; categories: CatalogueCategory[]; toppings: AdminTopping[]; promotions: Promotion[] };
type Tab = "products" | "promotions" | "categories" | "toppings";
type ProductDraft = { id: string; slug: string; name: string; category: string; basePrice: string; description: string; ingredients: string; tags: string[]; popularity: string; image: string; imagePosition: string; tone: string; isActive: boolean };
type PromotionDraft = { id: string; productId: string; label: string; salePrice: string; startsAt: string; endsAt: string; isActive: boolean };

const emptyProduct: ProductDraft = { id: "", slug: "", name: "", category: "milk-tea", basePrice: "39000", description: "", ingredients: "", tags: [], popularity: "50", image: "/images/product-lineup.png", imagePosition: "50% 50%", tone: "milk", isActive: true };
const emptyPromotion: PromotionDraft = { id: "", productId: "", label: "", salePrice: "", startsAt: "", endsAt: "", isActive: true };

function toLocalInput(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? "" : new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16); }

export function AdminCatalogue({ role }: { role: AdminRole }) {
  const [data, setData] = useState<CatalogueData | null>(null);
  const [tab, setTab] = useState<Tab>("products");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState<"name" | "price-asc" | "price-desc">("name");
  const [productDraft, setProductDraft] = useState<ProductDraft>(emptyProduct);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [promotionDraft, setPromotionDraft] = useState<PromotionDraft>(emptyPromotion);
  const [editingPromotionId, setEditingPromotionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try { const payload = await adminFetch<{ catalogue: CatalogueData }>("/api/admin/catalogue"); setData(payload.catalogue); }
    catch (caught) { setError(caught instanceof AdminApiError ? caught.message : "Không thể tải catalogue."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { window.queueMicrotask(() => void load()); }, [load]);

  const visibleProducts = useMemo(() => {
    if (!data) return [];
    const normalized = query.trim().toLocaleLowerCase("vi");
    return data.products.filter((product) => (!category || product.category === category) && (!normalized || `${product.name} ${product.slug} ${product.description}`.toLocaleLowerCase("vi").includes(normalized))).sort((a, b) => sort === "price-asc" ? a.basePrice - b.basePrice : sort === "price-desc" ? b.basePrice - a.basePrice : a.name.localeCompare(b.name, "vi"));
  }, [category, data, query, sort]);

  async function mutate(url: string, init: RequestInit) {
    setSaving(true); setError("");
    try { const payload = await adminFetch<{ catalogue: CatalogueData }>(url, init); setData(payload.catalogue); return true; }
    catch (caught) { setError(caught instanceof AdminApiError ? caught.message : "Không thể lưu thay đổi."); return false; }
    finally { setSaving(false); }
  }

  function editProduct(product: AdminCatalogueProduct) {
    setEditingProductId(product.id);
    setProductDraft({ id: product.id, slug: product.slug, name: product.name, category: product.category, basePrice: String(product.basePrice), description: product.description, ingredients: product.ingredients, tags: product.tags, popularity: String(product.popularity), image: product.image, imagePosition: product.imagePosition, tone: product.tone, isActive: product.isActive });
    document.getElementById("admin-product-form")?.scrollIntoView({ block: "start" });
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = { ...productDraft, basePrice: Number(productDraft.basePrice), popularity: Number(productDraft.popularity) };
    const ok = await mutate(editingProductId ? `/api/admin/catalogue/products/${encodeURIComponent(editingProductId)}` : "/api/admin/catalogue", { method: editingProductId ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    if (ok) { setEditingProductId(null); setProductDraft(emptyProduct); }
  }

  async function hideProduct(product: AdminCatalogueProduct) {
    if (!window.confirm(`Ẩn sản phẩm “${product.name}” khỏi storefront? Các đơn cũ vẫn được giữ nguyên.`)) return;
    await mutate(`/api/admin/catalogue/products/${encodeURIComponent(product.id)}`, { method: "DELETE" });
  }

  function editPromotion(promotion: Promotion) {
    setEditingPromotionId(promotion.id);
    setPromotionDraft({ id: promotion.id, productId: promotion.productId, label: promotion.label, salePrice: String(promotion.salePrice), startsAt: toLocalInput(promotion.startsAt), endsAt: toLocalInput(promotion.endsAt), isActive: promotion.isActive });
  }

  async function savePromotionForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = { ...promotionDraft, salePrice: Number(promotionDraft.salePrice), startsAt: new Date(promotionDraft.startsAt).toISOString(), endsAt: new Date(promotionDraft.endsAt).toISOString() };
    const ok = await mutate(editingPromotionId ? `/api/admin/promotions/${encodeURIComponent(editingPromotionId)}` : "/api/admin/promotions", { method: editingPromotionId ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    if (ok) { setEditingPromotionId(null); setPromotionDraft(emptyPromotion); }
  }

  async function updateCategory(item: CatalogueCategory, form: HTMLFormElement) {
    const body = Object.fromEntries(new FormData(form));
    await mutate(`/api/admin/categories/${encodeURIComponent(item.id)}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...body, isActive: form.elements.namedItem("isActive") instanceof HTMLInputElement ? (form.elements.namedItem("isActive") as HTMLInputElement).checked : false }) });
  }

  async function updateTopping(item: AdminTopping, form: HTMLFormElement) {
    const body = Object.fromEntries(new FormData(form));
    await mutate(`/api/admin/toppings/${encodeURIComponent(item.id)}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...body, price: Number(body.price), isActive: form.elements.namedItem("isActive") instanceof HTMLInputElement ? (form.elements.namedItem("isActive") as HTMLInputElement).checked : false }) });
  }

  if (loading) return <div className="admin-state" role="status">Đang tải catalogue…</div>;
  if (!data) return <div className="admin-state admin-state-error" role="alert"><p>{error || "Không có dữ liệu catalogue."}</p><button type="button" onClick={() => { setLoading(true); void load(); }}>Thử lại</button></div>;
  const canEdit = role === "admin";

  return <>
    <header className="admin-page-header"><div><h1>Catalogue</h1><p>Sản phẩm, danh mục, topping và khuyến mãi dùng chung với storefront.</p></div><span className="admin-result-count">{data.products.length} món</span></header>
    {!canEdit && <div className="admin-inline-error" role="note">Tài khoản vận hành chỉ được xem catalogue.</div>}
    {error && <div className="admin-inline-error" role="alert">{error}<button type="button" onClick={() => setError("")}>Đóng</button></div>}
    <div className="admin-tablist" role="tablist" aria-label="Khu vực catalogue">{(["products","promotions","categories","toppings"] as Tab[]).map((value) => <button key={value} type="button" role="tab" aria-selected={tab === value} onClick={() => setTab(value)}>{value === "products" ? "Sản phẩm" : value === "promotions" ? "Khuyến mãi" : value === "categories" ? "Danh mục" : "Topping"}</button>)}</div>
    {tab === "products" && <div className="admin-catalogue-layout">
      <section><div className="admin-catalogue-tools"><label>Tìm sản phẩm<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} /></label><label>Danh mục<select value={category} onChange={(event) => setCategory(event.target.value)}><option value="">Tất cả</option>{data.categories.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><label>Sắp xếp<select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)}><option value="name">Tên A–Z</option><option value="price-asc">Giá tăng</option><option value="price-desc">Giá giảm</option></select></label></div><div className="admin-catalogue-list">{visibleProducts.map((product) => <article key={product.id}><Image src={product.image} width={136} height={152} sizes="68px" alt="" /><div><h2>{product.name}</h2><p>{product.description}</p><small>{product.category} · {product.isActive ? "Đang bán" : "Đã ẩn"}</small></div><strong>{formatAdminVnd(product.basePrice)}</strong>{canEdit && <div><button type="button" onClick={() => editProduct(product)}>Sửa</button><button type="button" disabled={!product.isActive} onClick={() => void hideProduct(product)}>Ẩn</button></div>}</article>)}</div></section>
      {canEdit && <form id="admin-product-form" className="admin-editor" onSubmit={saveProduct}><h2>{editingProductId ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h2><label>Mã sản phẩm<input value={productDraft.id} disabled={Boolean(editingProductId)} onChange={(event) => setProductDraft({ ...productDraft, id: event.target.value })} required /></label><label>Slug<input value={productDraft.slug} onChange={(event) => setProductDraft({ ...productDraft, slug: event.target.value })} required /></label><label>Tên<input value={productDraft.name} maxLength={120} onChange={(event) => setProductDraft({ ...productDraft, name: event.target.value })} required /></label><label>Danh mục<select value={productDraft.category} onChange={(event) => setProductDraft({ ...productDraft, category: event.target.value })}>{data.categories.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><label>Giá gốc<input type="number" min="1000" step="1000" value={productDraft.basePrice} onChange={(event) => setProductDraft({ ...productDraft, basePrice: event.target.value })} required /></label><label>Mô tả<textarea rows={3} value={productDraft.description} maxLength={500} onChange={(event) => setProductDraft({ ...productDraft, description: event.target.value })} required /></label><label>Thành phần<input value={productDraft.ingredients} maxLength={500} onChange={(event) => setProductDraft({ ...productDraft, ingredients: event.target.value })} required /></label><label>Ảnh nội bộ<input value={productDraft.image} onChange={(event) => setProductDraft({ ...productDraft, image: event.target.value })} required /></label><label>Vị trí ảnh<input value={productDraft.imagePosition} onChange={(event) => setProductDraft({ ...productDraft, imagePosition: event.target.value })} /></label><label>Tông màu<select value={productDraft.tone} onChange={(event) => setProductDraft({ ...productDraft, tone: event.target.value })}><option value="milk">Sữa</option><option value="orange">Cam</option><option value="green">Xanh</option><option value="purple">Khoai môn</option></select></label><label>Độ phổ biến<input type="number" min="0" max="100" value={productDraft.popularity} onChange={(event) => setProductDraft({ ...productDraft, popularity: event.target.value })} /></label><fieldset><legend>Nhãn</legend><label><input type="checkbox" checked={productDraft.tags.includes("Bán chạy")} onChange={(event) => setProductDraft({ ...productDraft, tags: event.target.checked ? [...productDraft.tags, "Bán chạy"] : productDraft.tags.filter((tag) => tag !== "Bán chạy") })} /> Bán chạy</label><label><input type="checkbox" checked={productDraft.tags.includes("Mới")} onChange={(event) => setProductDraft({ ...productDraft, tags: event.target.checked ? [...productDraft.tags, "Mới"] : productDraft.tags.filter((tag) => tag !== "Mới") })} /> Mới</label></fieldset><label><input type="checkbox" checked={productDraft.isActive} onChange={(event) => setProductDraft({ ...productDraft, isActive: event.target.checked })} /> Đang hiển thị</label><button className="admin-filter-button" type="submit" disabled={saving}>{saving ? "Đang lưu" : "Lưu sản phẩm"}</button>{editingProductId && <button type="button" onClick={() => { setEditingProductId(null); setProductDraft(emptyProduct); }}>Hủy sửa</button>}</form>}
    </div>}
    {tab === "promotions" && <div className="admin-catalogue-layout"><section className="admin-catalogue-list">{data.promotions.map((promotion) => <article key={promotion.id}><div><h2>{promotion.label}</h2><p>{data.products.find((item) => item.id === promotion.productId)?.name ?? promotion.productId}</p><small>{new Intl.DateTimeFormat("vi-VN").format(new Date(promotion.startsAt))} – {new Intl.DateTimeFormat("vi-VN").format(new Date(promotion.endsAt))} · {promotion.isActive ? "Đang bật" : "Đã tắt"}</small></div><strong>{formatAdminVnd(promotion.salePrice)}</strong>{canEdit && <div><button type="button" onClick={() => editPromotion(promotion)}>Sửa</button><button type="button" disabled={!promotion.isActive} onClick={() => { if (window.confirm("Tắt khuyến mãi này?")) void mutate(`/api/admin/promotions/${encodeURIComponent(promotion.id)}`, { method: "DELETE" }); }}>Tắt</button></div>}</article>)}</section>{canEdit && <form className="admin-editor" onSubmit={savePromotionForm}><h2>{editingPromotionId ? "Sửa khuyến mãi" : "Tạo khuyến mãi"}</h2><label>Mã<input value={promotionDraft.id} disabled={Boolean(editingPromotionId)} onChange={(event) => setPromotionDraft({ ...promotionDraft, id: event.target.value })} required /></label><label>Sản phẩm<select value={promotionDraft.productId} onChange={(event) => setPromotionDraft({ ...promotionDraft, productId: event.target.value })} required><option value="">Chọn món</option>{data.products.map((item) => <option key={item.id} value={item.id}>{item.name} · {formatAdminVnd(item.basePrice)}</option>)}</select></label><label>Nhãn<input value={promotionDraft.label} onChange={(event) => setPromotionDraft({ ...promotionDraft, label: event.target.value })} required /></label><label>Giá khuyến mãi<input type="number" min="1000" step="1000" value={promotionDraft.salePrice} onChange={(event) => setPromotionDraft({ ...promotionDraft, salePrice: event.target.value })} required /></label><label>Bắt đầu<input type="datetime-local" value={promotionDraft.startsAt} onChange={(event) => setPromotionDraft({ ...promotionDraft, startsAt: event.target.value })} required /></label><label>Kết thúc<input type="datetime-local" value={promotionDraft.endsAt} onChange={(event) => setPromotionDraft({ ...promotionDraft, endsAt: event.target.value })} required /></label><label><input type="checkbox" checked={promotionDraft.isActive} onChange={(event) => setPromotionDraft({ ...promotionDraft, isActive: event.target.checked })} /> Đang bật</label><button className="admin-filter-button" type="submit" disabled={saving}>Lưu khuyến mãi</button></form>}</div>}
    {tab === "categories" && <div className="admin-inline-edit-list">{data.categories.map((item) => <form key={item.id} onSubmit={(event) => { event.preventDefault(); void updateCategory(item, event.currentTarget); }}><strong>{item.id}</strong><label>Tên<input name="label" defaultValue={item.label} maxLength={120} /></label><label>Mô tả<input name="description" defaultValue={item.description} maxLength={200} /></label><label><input name="isActive" type="checkbox" defaultChecked={item.isActive} /> Hoạt động</label>{canEdit && <button type="submit" disabled={saving}>Lưu</button>}</form>)}</div>}
    {tab === "toppings" && <div className="admin-inline-edit-list">{data.toppings.map((item) => <form key={item.id} onSubmit={(event) => { event.preventDefault(); void updateTopping(item, event.currentTarget); }}><strong>{item.id}</strong><label>Tên<input name="name" defaultValue={item.name} maxLength={120} /></label><label>Giá<input name="price" type="number" min="0" step="1000" defaultValue={item.price} /></label><label><input name="isActive" type="checkbox" defaultChecked={item.isActive} /> Hoạt động</label>{canEdit && <button type="submit" disabled={saving}>Lưu</button>}</form>)}</div>}
  </>;
}
