"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import { deliveryFee, sizeSurcharge } from "../data/pricing";
import { categories, formatVnd, products, toppings } from "../data/products";
import { CheckoutApiError, confirmOrder, createOrder, getAddressSuggestions, type AddressSuggestion } from "../lib/checkout-api";
import { loadCart, saveCart, saveOrder } from "../lib/storage";
import type { CartItem, CategoryId, CheckoutDetails, DrinkSize, IceLevel, MockOrder, Product, SugarLevel } from "../types";

type View = "home" | "menu" | "product" | "cart" | "checkout" | "success";
type SortMode = "popular" | "price-asc" | "price-desc";
type FieldErrors = Partial<Record<keyof CheckoutDetails, string>>;

const sugarLevels: SugarLevel[] = ["0%", "30%", "50%", "70%", "100%"];
const iceLevels: IceLevel[] = ["Không đá", "Ít đá", "Vừa", "Nhiều đá"];

type BrandIconName = "arrow" | "check" | "milk-tea" | "fruit-tea" | "macchiato" | "topping";

function BrandIcon({ name, className = "" }: { name: BrandIconName; className?: string }) {
  const paths: Record<BrandIconName, ReactNode> = {
    arrow: <><path d="M4 12h15" /><path d="m14 7 5 5-5 5" /></>,
    check: <path d="m5 12 4 4L19 7" />,
    "milk-tea": <><path d="M7 7h10l-1 13H8L7 7Z" /><path d="M6 4h12" /><path d="m14 4 3-3" /><circle cx="10" cy="16" r="1" /><circle cx="14" cy="13" r="1" /><circle cx="13" cy="18" r="1" /></>,
    "fruit-tea": <><path d="M12 7c-5 0-8 3-8 7s3 7 8 7 8-3 8-7-3-7-8-7Z" /><path d="M12 7c0-3 2-5 5-5" /><path d="M12 7C9 4 7 3 5 4" /><path d="M9 11c2 1 4 1 6 0" /></>,
    macchiato: <><path d="M7 8h10l-1 12H8L7 8Z" /><path d="M6 8c1-3 3-4 6-4s5 1 6 4" /><path d="M9 12h6" /></>,
    topping: <><path d="M5 11h14l-2 9H7l-2-9Z" /><circle cx="8" cy="8" r="2" /><circle cx="12" cy="6" r="2" /><circle cx="16" cy="8" r="2" /></>,
  };
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{paths[name]}</svg>;
}

function productById(id: string) {
  return products.find((product) => product.id === id);
}

function Header({ cartCount, onNavigate, onOpenMenu }: { cartCount: number; onNavigate: (view: View) => void; onOpenMenu: (category?: CategoryId) => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = (view: View) => {
    setMobileOpen(false);
    onNavigate(view);
  };

  return (
    <header className="site-header">
      <button className="wordmark" type="button" onClick={() => navigate("home")} aria-label="Trà Sữa Ngon, về trang chủ">
        Trà Sữa Ngon
      </button>
      <nav className="desktop-nav" aria-label="Điều hướng chính">
        <button type="button" onClick={() => onOpenMenu("milk-tea")}>Trà sữa</button>
        <button type="button" onClick={() => onOpenMenu("fruit-tea")}>Trà trái cây</button>
        <button type="button" onClick={() => onOpenMenu("macchiato")}>Macchiato</button>
        <button type="button" onClick={() => onOpenMenu("topping")}>Topping</button>
        <button type="button" onClick={() => navigate("menu")}>Xem menu</button>
      </nav>
      <div className="header-actions">
        <button className="mobile-menu-button" type="button" aria-expanded={mobileOpen} aria-controls="mobile-navigation" onClick={() => setMobileOpen((value) => !value)}>
          {mobileOpen ? "Đóng" : "Menu"}
        </button>
        <button className="cart-button" type="button" onClick={() => navigate("cart")} aria-label={`Mở giỏ hàng, có ${cartCount} sản phẩm`}>
          Giỏ hàng <span aria-hidden="true">{cartCount}</span>
        </button>
      </div>
      {mobileOpen && (
        <nav className="mobile-nav" id="mobile-navigation" aria-label="Điều hướng trên điện thoại">
          <button type="button" onClick={() => navigate("home")}>Trang chủ</button>
          <button type="button" onClick={() => navigate("menu")}>Thực đơn</button>
          <button type="button" onClick={() => navigate("cart")}>Giỏ hàng</button>
        </nav>
      )}
    </header>
  );
}

function ProductPicture({ product, className = "" }: { product: Product; className?: string }) {
  return <Image className={className} src={product.image} width={900} height={1100} sizes="(max-width: 767px) 100vw, (max-width: 1100px) 50vw, 34vw" style={{ objectPosition: product.imagePosition }} alt={`Ảnh ${product.name}`} />;
}

function ProductCard({ product, featured = false, onSelect }: { product: Product; featured?: boolean; onSelect: (product: Product) => void }) {
  return (
    <article className={`product-card ${featured ? "product-card-featured" : ""}`}>
      <button className="product-image-button" type="button" onClick={() => onSelect(product)} aria-label={`Xem chi tiết ${product.name}`}>
        <ProductPicture product={product} />
      </button>
      <div className="product-card-body">
        <div className="tag-row" aria-label="Nhãn sản phẩm">
          {product.tags.map((tag) => <span className="product-tag" key={tag}>{tag}</span>)}
        </div>
        <h3><button type="button" onClick={() => onSelect(product)}>{product.name}</button></h3>
        <p>{product.description}</p>
        <div className="product-card-footer">
          <strong>{formatVnd(product.price)}</strong>
          <button className="text-action" type="button" onClick={() => onSelect(product)}>Chọn món</button>
        </div>
      </div>
    </article>
  );
}

function HomeView({ onOpenMenu, onSelectProduct }: { onOpenMenu: (category?: CategoryId) => void; onSelectProduct: (product: Product) => void }) {
  const bestSellers = [...products].filter((product) => product.tags.includes("Bán chạy") && product.category !== "topping").slice(0, 3);
  return (
    <main id="main-content">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <h1 id="hero-title"><span>Trà ngon,</span><span>chọn đúng gu</span></h1>
          <p>Trà tuyển chọn, topping nấu mới và từng mức vị do bạn quyết định.</p>
          <div className="hero-actions">
            <button className="button button-primary hero-order-button" type="button" onClick={() => onOpenMenu()}>Đặt ngay <BrandIcon name="arrow" /></button>
            <button className="button button-secondary" type="button" onClick={() => document.getElementById("ingredients")?.scrollIntoView()}>Xem nguyên liệu</button>
          </div>
        </div>
        <div className="hero-stage">
          <div className="cup-ring" aria-hidden="true" />
          <Image className="hero-atmosphere" src="/images/about-tea.png" width={1448} height={1086} sizes="(max-width: 767px) 100vw, 54vw" priority alt="" aria-hidden="true" />
          <Image className="hero-cup" src="/images/hero-brown-sugar.png" width={1122} height={1402} sizes="(max-width: 767px) 72vw, 390px" priority alt="Ly trà sữa đường đen với trân châu đen" />
        </div>
        <div className="ingredient-counter" id="ingredients">
          <div><span className="ingredient-swatch ingredient-tea" aria-hidden="true" /><span><strong>Trà tuyển chọn</strong><small>Thơm chuẩn vị</small></span></div>
          <div><span className="ingredient-swatch ingredient-pearl" aria-hidden="true" /><span><strong>Trân châu dai ngon</strong><small>Nấu mới mỗi ngày</small></span></div>
          <div><span className="ingredient-swatch ingredient-sugar" aria-hidden="true" /><span><strong>Vị ngọt vừa ý</strong><small>Chọn từ 0% đến 100%</small></span></div>
        </div>
      </section>

      <section className="category-tray" aria-label="Danh mục nổi bật">
        {categories.slice(1).map((category) => (
          <button key={category.id} type="button" onClick={() => onOpenMenu(category.id as CategoryId)}>
            <span className="category-emblem" aria-hidden="true"><BrandIcon name={category.id as BrandIconName} /></span>
            <span className="category-label">{category.label}</span><small>{category.description}</small>
          </button>
        ))}
      </section>

      <section className="home-section best-sellers" aria-labelledby="best-heading">
        <div className="section-heading">
          <h2 id="best-heading">Món được yêu thích</h2>
          <p>Những vị dễ bắt đầu, vẫn đủ khoảng trống để bạn chỉnh theo gu riêng.</p>
        </div>
        <div className="featured-product-grid">
          {bestSellers.map((product, index) => <ProductCard key={product.id} product={product} featured={index === 0} onSelect={onSelectProduct} />)}
        </div>
        <button className="button button-secondary section-action" type="button" onClick={() => onOpenMenu()}>Xem toàn bộ thực đơn</button>
      </section>

      <section className="home-section source-section" aria-labelledby="source-heading">
        <div className="source-image"><Image src="/images/about-tea.png" width={1448} height={1086} sizes="(max-width: 767px) 100vw, 52vw" alt="Lá trà, hoa nhài, ấm trà và trân châu trên bàn đá xanh" /></div>
        <div className="source-copy">
          <h2 id="source-heading">Ngon bắt đầu từ điều rõ ràng</h2>
          <p>Mỗi món mẫu đều ghi nền trà và thành phần chính. Khi chọn ly, giá thay đổi ngay theo size và topping.</p>
          <dl className="benefit-list">
            <div><dt>Nguyên liệu rõ</dt><dd>Biết mình đang uống trà gì và kết hợp với gì.</dd></div>
            <div><dt>Tuỳ chỉnh thật</dt><dd>Chọn đường, đá, size và topping trước khi thêm giỏ.</dd></div>
            <div><dt>Đặt món gọn</dt><dd>Giỏ hàng được lưu trên thiết bị để bạn không mất lựa chọn.</dd></div>
          </dl>
        </div>
      </section>

      <section className="home-section story-section" id="story" aria-labelledby="story-heading">
        <div className="story-mark" aria-hidden="true"><span /><span /><span /><span /><span /></div>
        <div>
          <h2 id="story-heading">Một quầy trà nhỏ, một cách chọn thật riêng</h2>
          <p>Trà Sữa Ngon là thương hiệu hư cấu được tạo cho trải nghiệm mua hàng mẫu. Chúng mình giữ mọi thao tác gần gũi như gọi món tại quầy, nhưng rõ ràng hơn trên màn hình.</p>
        </div>
        <button className="button button-primary" type="button" onClick={() => onOpenMenu()}>Chọn ly của bạn</button>
      </section>
    </main>
  );
}

function MenuView({ initialCategory, onSelectProduct }: { initialCategory: "all" | CategoryId; onSelectProduct: (product: Product) => void }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | CategoryId>(initialCategory);
  const [sort, setSort] = useState<SortMode>("popular");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => setLoading(false), 420);
    return () => window.clearTimeout(timeout);
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("vi");
    const matches = products.filter((product) => {
      const categoryMatch = category === "all" || product.category === category;
      const searchMatch = !normalized || `${product.name} ${product.description}`.toLocaleLowerCase("vi").includes(normalized);
      return categoryMatch && searchMatch;
    });
    return matches.sort((a, b) => sort === "price-asc" ? a.price - b.price : sort === "price-desc" ? b.price - a.price : b.popularity - a.popularity);
  }, [category, query, sort]);

  return (
    <main id="main-content" className="page-main">
      <section className="page-intro menu-intro">
        <h1>Thực đơn theo đúng gu</h1>
        <p>Tìm món quen, lọc nhanh theo nhóm và xem giá trước khi tuỳ chỉnh.</p>
      </section>
      <section className="catalogue" aria-labelledby="catalogue-heading">
        <h2 className="sr-only" id="catalogue-heading">Danh sách sản phẩm</h2>
        <div className="catalogue-tools">
          <div className="search-field">
            <label htmlFor="product-search">Tìm theo tên</label>
            <input id="product-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ví dụ: trà đào" />
          </div>
          <div className="sort-field">
            <label htmlFor="product-sort">Sắp xếp</label>
            <select id="product-sort" value={sort} onChange={(event) => setSort(event.target.value as SortMode)}>
              <option value="popular">Phổ biến</option>
              <option value="price-asc">Giá thấp đến cao</option>
              <option value="price-desc">Giá cao đến thấp</option>
            </select>
          </div>
        </div>
        <div className="filter-chips" aria-label="Lọc theo danh mục">
          {categories.map((item) => <button key={item.id} className={category === item.id ? "active" : ""} type="button" aria-pressed={category === item.id} onClick={() => setCategory(item.id)}>{item.label}</button>)}
        </div>
        <p className="result-count" aria-live="polite">{loading ? "Đang chuẩn bị thực đơn" : `${filtered.length} món phù hợp`}</p>
        {loading ? (
          <div className="catalogue-grid" aria-label="Đang tải sản phẩm" aria-busy="true">
            {Array.from({ length: 6 }, (_, index) => <div className="product-skeleton" key={index}><span /><span /><span /></div>)}
          </div>
        ) : filtered.length ? (
          <div className="catalogue-grid">{filtered.map((product) => <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />)}</div>
        ) : (
          <div className="empty-state">
            <div className="empty-pearls" aria-hidden="true"><span /><span /><span /></div>
            <h3>Chưa tìm thấy món phù hợp</h3>
            <p>Thử tên ngắn hơn hoặc xem lại toàn bộ danh mục.</p>
            <button className="button button-primary" type="button" onClick={() => { setQuery(""); setCategory("all"); }}>Xem tất cả món</button>
          </div>
        )}
      </section>
    </main>
  );
}

function ProductView({ product, onBack, onAdd }: { product: Product; onBack: () => void; onAdd: (item: CartItem) => void }) {
  const [size, setSize] = useState<DrinkSize | null>(null);
  const [sugar, setSugar] = useState<SugarLevel | null>(null);
  const [ice, setIce] = useState<IceLevel | null>(null);
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [errors, setErrors] = useState<string[]>([]);
  const errorRef = useRef<HTMLDivElement>(null);
  const isTopping = product.category === "topping";
  const toppingTotal = selectedToppings.reduce((sum, id) => sum + (toppings.find((item) => item.id === id)?.price ?? 0), 0);
  const unitPrice = product.price + (size ? sizeSurcharge[size] : 0) + toppingTotal;

  const toggleTopping = (id: string) => setSelectedToppings((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const submit = () => {
    if (isTopping) {
      onAdd({ key: `${product.id}-single`, productId: product.id, size: "M", sugar: "0%", ice: "Không đá", toppings: [], quantity, unitPrice: product.price });
      return;
    }
    const nextErrors = [!size ? "Vui lòng chọn size." : "", !sugar ? "Vui lòng chọn mức đường." : "", !ice ? "Vui lòng chọn mức đá." : ""].filter(Boolean);
    setErrors(nextErrors);
    if (nextErrors.length || !size || !sugar || !ice) {
      window.setTimeout(() => errorRef.current?.focus(), 0);
      return;
    }
    const sortedToppings = [...selectedToppings].sort();
    const key = [product.id, size, sugar, ice, ...sortedToppings].join("|");
    onAdd({ key, productId: product.id, size, sugar, ice, toppings: sortedToppings, quantity, unitPrice });
  };

  return (
    <main id="main-content" className="page-main product-page">
      <button className="back-button" type="button" onClick={onBack}>Quay lại thực đơn</button>
      <div className="product-detail">
        <div className={`product-detail-image tone-${product.tone}`}><ProductPicture product={product} /></div>
        <div className="product-config">
          <div className="tag-row">{product.tags.map((tag) => <span className="product-tag" key={tag}>{tag}</span>)}</div>
          <h1>{product.name}</h1>
          <p className="product-description">{product.description}</p>
          <p className="ingredient-note"><strong>Thành phần chính:</strong> {product.ingredients}</p>
          <p className="product-price" aria-live="polite">{formatVnd(unitPrice * quantity)}</p>
          {errors.length > 0 && <div className="validation-summary" ref={errorRef} tabIndex={-1} role="alert"><strong>Cần thêm lựa chọn</strong>{errors.map((error) => <p key={error}>{error}</p>)}</div>}
          {!isTopping && (
            <>
              <ChoiceGroup label="Chọn size" required options={["M", "L"]} value={size} onChange={(value) => { setSize(value as DrinkSize); setErrors([]); }} suffix={(value) => value === "L" ? "+7.000đ" : "Giá gốc"} />
              <ChoiceGroup label="Mức đường" required options={sugarLevels} value={sugar} onChange={(value) => { setSugar(value as SugarLevel); setErrors([]); }} />
              <ChoiceGroup label="Mức đá" required options={iceLevels} value={ice} onChange={(value) => { setIce(value as IceLevel); setErrors([]); }} />
              <fieldset className="option-group topping-group"><legend>Thêm topping</legend>{toppings.map((item) => <label key={item.id}><input type="checkbox" checked={selectedToppings.includes(item.id)} onChange={() => toggleTopping(item.id)} /><span>{item.name}</span><small>+{formatVnd(item.price)}</small></label>)}</fieldset>
            </>
          )}
          <div className="quantity-row">
            <span id="quantity-label">Số lượng</span>
            <div className="stepper" role="group" aria-labelledby="quantity-label">
              <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} disabled={quantity === 1} aria-label="Giảm số lượng">−</button>
              <output aria-live="polite">{quantity}</output>
              <button type="button" onClick={() => setQuantity((value) => Math.min(20, value + 1))} aria-label="Tăng số lượng">+</button>
            </div>
          </div>
          <button className="button button-primary add-to-cart" type="button" onClick={submit}>Thêm vào giỏ - {formatVnd(unitPrice * quantity)}</button>
        </div>
      </div>
    </main>
  );
}

function ChoiceGroup({ label, required, options, value, onChange, suffix }: { label: string; required?: boolean; options: string[]; value: string | null; onChange: (value: string) => void; suffix?: (value: string) => string }) {
  return <fieldset className="option-group"><legend>{label}{required ? <span> (bắt buộc)</span> : null}</legend><div className="choice-grid">{options.map((option) => <label className={value === option ? "selected" : ""} key={option}><input type="radio" name={label} value={option} checked={value === option} onChange={() => onChange(option)} /><span>{option}</span>{suffix && <small>{suffix(option)}</small>}</label>)}</div></fieldset>;
}

function CartView({ items, onUpdate, onRemove, onMenu, onCheckout }: { items: CartItem[]; onUpdate: (key: string, quantity: number) => void; onRemove: (key: string) => void; onMenu: () => void; onCheckout: () => void }) {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  if (!items.length) return <main id="main-content" className="page-main"><div className="empty-state cart-empty"><div className="empty-pearls" aria-hidden="true"><span /><span /><span /></div><h1>Giỏ hàng đang trống</h1><p>Chọn một món, chỉnh đúng gu rồi quay lại đây để kiểm tra.</p><button className="button button-primary" type="button" onClick={onMenu}>Xem thực đơn</button></div></main>;
  return (
    <main id="main-content" className="page-main cart-page">
      <div className="page-intro compact"><h1>Giỏ hàng của bạn</h1><p>Kiểm tra món, tuỳ chọn và số lượng trước khi thanh toán mô phỏng.</p></div>
      <div className="cart-layout">
        <section className="cart-list" aria-label="Sản phẩm trong giỏ">{items.map((item) => {
          const product = productById(item.productId); if (!product) return null;
          const toppingNames = item.toppings.map((id) => toppings.find((topping) => topping.id === id)?.name).filter(Boolean).join(", ");
          return <article className="cart-item" key={item.key}><ProductPicture product={product} /><div className="cart-item-copy"><h2>{product.name}</h2><p>{product.category === "topping" ? "Phần topping riêng" : `Size ${item.size}, đường ${item.sugar}, ${item.ice}`}</p>{toppingNames && <p>Thêm: {toppingNames}</p>}<button className="remove-button" type="button" onClick={() => onRemove(item.key)}>Xóa món</button></div><div className="cart-item-price"><strong>{formatVnd(item.unitPrice * item.quantity)}</strong><div className="stepper"><button type="button" aria-label={`Giảm số lượng ${product.name}`} onClick={() => onUpdate(item.key, item.quantity - 1)}>−</button><output aria-label={`Số lượng ${product.name}`}>{item.quantity}</output><button type="button" aria-label={`Tăng số lượng ${product.name}`} onClick={() => onUpdate(item.key, item.quantity + 1)}>+</button></div></div></article>;
        })}</section>
        <aside className="order-summary" aria-label="Tóm tắt giỏ hàng"><h2>Tạm tính</h2><div><span>Tiền món</span><strong>{formatVnd(subtotal)}</strong></div><div><span>Phí giao hàng</span><span>Tính ở bước sau</span></div><div className="summary-total"><span>Tổng tạm tính</span><strong>{formatVnd(subtotal)}</strong></div><button className="button button-primary" type="button" onClick={onCheckout}>Tiếp tục thanh toán</button><button className="button button-secondary" type="button" onClick={onMenu}>Chọn thêm món</button></aside>
      </div>
    </main>
  );
}

function CheckoutView({ items, onBack, onSuccess }: { items: CartItem[]; onBack: () => void; onSuccess: (order: MockOrder) => void }) {
  const [details, setDetails] = useState<CheckoutDetails>({ fullName: "", phone: "", address: "", note: "", payment: "cash" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [addressState, setAddressState] = useState<"idle" | "loading" | "ready" | "empty" | "error">("idle");
  const [addressMessage, setAddressMessage] = useState("Nhập ít nhất 3 ký tự để xem gợi ý tại Việt Nam.");
  const skipNextAddressLookup = useRef(false);
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const total = subtotal + deliveryFee;

  useEffect(() => {
    const query = details.address.trim();
    if (skipNextAddressLookup.current) {
      skipNextAddressLookup.current = false;
      return;
    }
    if (query.length < 3) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setAddressState("loading");
      setAddressMessage("Đang tìm địa chỉ phù hợp...");
      try {
        const nextSuggestions = await getAddressSuggestions(query, controller.signal);
        if (controller.signal.aborted) return;
        setSuggestions(nextSuggestions);
        setAddressState(nextSuggestions.length ? "ready" : "empty");
        setAddressMessage(nextSuggestions.length ? `Có ${nextSuggestions.length} gợi ý địa chỉ.` : "Không tìm thấy gợi ý. Bạn có thể tiếp tục nhập địa chỉ thủ công.");
      } catch (error) {
        if (controller.signal.aborted) return;
        setSuggestions([]);
        setAddressState("error");
        setAddressMessage(error instanceof CheckoutApiError ? error.message : "Không thể tải gợi ý lúc này. Bạn vẫn có thể nhập địa chỉ thủ công.");
      }
    }, 350);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [details.address]);

  const update = (field: keyof CheckoutDetails, value: string) => {
    setDetails((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
    setSubmitError("");
    setPendingOrderId(null);
    if (field === "address") {
      setSuggestions([]);
      setAddressState("idle");
      setAddressMessage(value.trim().length < 3 ? "Nhập ít nhất 3 ký tự để xem gợi ý tại Việt Nam." : "Dừng nhập một chút để tải gợi ý địa chỉ.");
    }
  };
  const selectAddress = (suggestion: AddressSuggestion) => {
    skipNextAddressLookup.current = true;
    setDetails((current) => ({ ...current, address: suggestion.label }));
    setErrors((current) => {
      const next = { ...current };
      delete next.address;
      return next;
    });
    setSubmitError("");
    setPendingOrderId(null);
    setSuggestions([]);
    setAddressState("idle");
    setAddressMessage("Đã chọn gợi ý. Bạn vẫn có thể sửa địa chỉ thủ công.");
  };
  const validate = () => {
    const next: FieldErrors = {};
    if (details.fullName.trim().length < 2) next.fullName = "Nhập họ tên có ít nhất 2 ký tự.";
    if (!/^(0|\+84)(3|5|7|8|9)\d{8}$/.test(details.phone.replace(/\s/g, ""))) next.phone = "Nhập số điện thoại Việt Nam hợp lệ.";
    if (details.address.trim().length < 10) next.address = "Nhập địa chỉ nhận hàng cụ thể hơn.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) {
      window.setTimeout(() => document.getElementById("checkout-errors")?.focus(), 0);
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      let orderId = pendingOrderId;
      if (!orderId) {
        const pendingOrder = await createOrder(details, items);
        orderId = pendingOrder.id;
        setPendingOrderId(orderId);
      }
      const confirmedOrder = await confirmOrder(orderId);
      const order: MockOrder = {
        id: confirmedOrder.id,
        createdAt: confirmedOrder.createdAt,
        customer: confirmedOrder.customer,
        items: confirmedOrder.items,
        subtotal: confirmedOrder.subtotal,
        deliveryFee: confirmedOrder.deliveryFee,
        total: confirmedOrder.total,
      };
      onSuccess(order);
    } catch (error) {
      if (error instanceof CheckoutApiError && Object.keys(error.fields).length) {
        setErrors(error.fields as FieldErrors);
      }
      setSubmitError(error instanceof Error ? error.message : "Không thể tạo đơn mô phỏng. Vui lòng thử lại.");
      window.setTimeout(() => document.getElementById("checkout-submit-error")?.focus(), 0);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main id="main-content" className="page-main checkout-page">
      <button className="back-button" type="button" onClick={onBack}>Quay lại giỏ hàng</button>
      <div className="page-intro compact"><h1>Thông tin nhận hàng</h1><p>Đây là checkout mô phỏng. Website không thu tiền hoặc gửi dữ liệu đến cổng thanh toán.</p></div>
      <form className="checkout-layout" onSubmit={submit} noValidate>
        <section className="checkout-form" aria-label="Thông tin giao hàng">
          {Object.keys(errors).length > 0 && <div className="validation-summary" id="checkout-errors" tabIndex={-1} role="alert"><strong>Kiểm tra lại thông tin</strong><p>Một vài trường cần được bổ sung trước khi đặt đơn.</p></div>}
          {submitError && <div className="validation-summary" id="checkout-submit-error" tabIndex={-1} role="alert"><strong>Chưa thể xác nhận đơn</strong><p>{submitError}</p><p>Thông tin đã nhập vẫn được giữ lại để bạn thử lại.</p></div>}
          <FormField label="Họ và tên" id="full-name" error={errors.fullName}><input id="full-name" autoComplete="name" value={details.fullName} onChange={(event) => update("fullName", event.target.value)} aria-invalid={Boolean(errors.fullName)} aria-describedby={errors.fullName ? "full-name-error" : undefined} /></FormField>
          <FormField label="Số điện thoại" id="phone" error={errors.phone}><input id="phone" inputMode="tel" autoComplete="tel" value={details.phone} onChange={(event) => update("phone", event.target.value)} placeholder="090 123 4567" aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "phone-error" : undefined} /></FormField>
          <FormField label="Địa chỉ nhận hàng" id="address" error={errors.address}>
            <div className="address-lookup">
              <input id="address" autoComplete="off" value={details.address} onChange={(event) => update("address", event.target.value)} aria-invalid={Boolean(errors.address)} aria-describedby={errors.address ? "address-error address-help" : "address-help"} aria-autocomplete="list" aria-controls="address-suggestions" aria-expanded={addressState === "ready"} role="combobox" />
              <p className={`address-help state-${addressState}`} id="address-help" role="status" aria-live="polite">{addressMessage}</p>
              {addressState === "ready" && <ul className="address-suggestions" id="address-suggestions" role="listbox" aria-label="Gợi ý địa chỉ tại Việt Nam">{suggestions.map((suggestion) => <li key={`${suggestion.latitude}-${suggestion.longitude}`}><button type="button" role="option" aria-selected="false" onClick={() => selectAddress(suggestion)}><strong>{suggestion.label}</strong><small>{[suggestion.district, suggestion.province].filter(Boolean).join(", ")}</small></button></li>)}</ul>}
            </div>
          </FormField>
          <FormField label="Ghi chú" id="note"><textarea id="note" rows={3} value={details.note} onChange={(event) => update("note", event.target.value)} placeholder="Ví dụ: gọi trước khi giao" /></FormField>
          <fieldset className="payment-options"><legend>Phương thức thanh toán</legend><label aria-label="Tiền mặt khi nhận hàng" htmlFor="payment-cash" className={details.payment === "cash" ? "selected" : ""}><input id="payment-cash" type="radio" name="payment" value="cash" checked={details.payment === "cash"} onChange={() => update("payment", "cash")} /><span><strong>Tiền mặt khi nhận hàng</strong><small>Thanh toán trực tiếp cho người giao.</small></span></label><label aria-label="Chuyển khoản QR mô phỏng" htmlFor="payment-bank" className={details.payment === "bank" ? "selected" : ""}><input id="payment-bank" type="radio" name="payment" value="bank" checked={details.payment === "bank"} onChange={() => update("payment", "bank")} /><span><strong>Chuyển khoản QR mô phỏng</strong><small>Chỉ hiển thị giao diện minh hoạ, không thực hiện giao dịch.</small></span></label></fieldset>
          {details.payment === "bank" && <div className="mock-qr" role="img" aria-label="Mã QR mô phỏng, không dùng để thanh toán thật"><div>{Array.from({ length: 64 }, (_, index) => <span className={[0,1,2,8,10,16,17,18,45,46,47,53,55,61,62,63,5,12,19,26,28,33,35,42,50,58].includes(index) ? "filled" : ""} key={index} />)}</div><p><strong>QR mô phỏng</strong>Không quét để thanh toán thật.</p></div>}
        </section>
        <aside className="order-summary checkout-summary"><h2>Đơn của bạn</h2>{items.map((item) => <div className="checkout-line" key={item.key}><span>{item.quantity} x {productById(item.productId)?.name}</span><strong>{formatVnd(item.unitPrice * item.quantity)}</strong></div>)}<div><span>Tiền món</span><strong>{formatVnd(subtotal)}</strong></div><div><span>Phí giao hàng mẫu</span><strong>{formatVnd(deliveryFee)}</strong></div><div className="summary-total"><span>Tổng cộng</span><strong>{formatVnd(total)}</strong></div><button className="button button-primary" type="submit" disabled={submitting}>{submitting ? (pendingOrderId ? "Đang xác nhận đơn" : "Đang tạo đơn") : `Xác nhận đơn - ${formatVnd(total)}`}</button><p className="simulation-note">Đơn được tạo ở trạng thái chờ và chỉ xác nhận nội bộ. Không có khoản tiền nào được thu trong bản demo này.</p></aside>
      </form>
    </main>
  );
}

function FormField({ label, id, error, children }: { label: string; id: string; error?: string; children: React.ReactNode }) {
  return <div className="form-field"><label htmlFor={id}>{label}</label>{children}{error && <p className="field-error" id={`${id}-error`}>{error}</p>}</div>;
}

function SuccessView({ order, onHome }: { order: MockOrder; onHome: () => void }) {
  return <main id="main-content" className="page-main success-page"><div className="success-mark" aria-hidden="true"><BrandIcon name="check" /></div><p className="success-label">Đơn mô phỏng đã được tạo</p><h1>Cảm ơn {order.customer.fullName}</h1><p>Mã đơn <strong>{order.id}</strong> đã được lưu trên thiết bị này. Không có giao dịch thanh toán thật.</p><section className="success-details" aria-label="Chi tiết đơn hàng"><div><span>Thời gian</span><strong>{new Date(order.createdAt).toLocaleString("vi-VN")}</strong></div><div><span>Nhận tại</span><strong>{order.customer.address}</strong></div><div><span>Thanh toán</span><strong>{order.customer.payment === "cash" ? "Tiền mặt khi nhận hàng" : "QR mô phỏng"}</strong></div><div><span>Tổng mẫu</span><strong>{formatVnd(order.total)}</strong></div></section><button className="button button-primary" type="button" onClick={onHome}>Về trang chủ</button></main>;
}

function Footer({ onNavigate }: { onNavigate: (view: View) => void }) {
  return <footer className="site-footer"><div><button className="footer-wordmark" type="button" onClick={() => onNavigate("home")}>Trà Sữa Ngon</button><p>Website thương mại điện tử mẫu cho thương hiệu hư cấu.</p></div><div><h2>Khám phá</h2><button type="button" onClick={() => onNavigate("menu")}>Thực đơn</button><button type="button" onClick={() => onNavigate("cart")}>Giỏ hàng</button></div><div><h2>Thông tin</h2><p>Hotline mẫu: 1900 0000</p><p>Mở cửa mẫu: 09:00 - 21:30</p></div><p className="footer-bottom">© 2026 Trà Sữa Ngon. Thanh toán chỉ là mô phỏng.</p></footer>;
}

export function TeaShop() {
  const [view, setView] = useState<View>("home");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [initialCategory, setInitialCategory] = useState<"all" | CategoryId>("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState("");
  const [toast, setToast] = useState("");
  const [order, setOrder] = useState<MockOrder | null>(null);

  useEffect(() => {
    window.queueMicrotask(() => {
      try { setCart(loadCart()); } catch { setStorageError("Không thể đọc giỏ hàng đã lưu trên thiết bị này."); }
      setReady(true);
    });
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { saveCart(cart); } catch { window.queueMicrotask(() => setStorageError("Không thể lưu giỏ hàng. Các lựa chọn vẫn hoạt động trong phiên hiện tại.")); }
  }, [cart, ready]);
  useEffect(() => {
    window.scrollTo({ top: 0 });
    window.setTimeout(() => {
      const main = document.getElementById("main-content");
      main?.setAttribute("tabindex", "-1");
      main?.focus({ preventScroll: true });
    }, 0);
  }, [view]);
  useEffect(() => { if (!toast) return; const timeout = window.setTimeout(() => setToast(""), 2500); return () => window.clearTimeout(timeout); }, [toast]);

  const navigate = (next: View) => { if (next === "checkout" && cart.length === 0) setView("cart"); else setView(next); };
  const openMenu = (category?: CategoryId) => { setInitialCategory(category ?? "all"); setView("menu"); };
  const openProduct = (product: Product) => { setSelectedProduct(product); setView("product"); };
  const addToCart = (item: CartItem) => {
    setCart((current) => {
      const existing = current.find((cartItem) => cartItem.key === item.key);
      return existing ? current.map((cartItem) => cartItem.key === item.key ? { ...cartItem, quantity: cartItem.quantity + item.quantity } : cartItem) : [...current, item];
    });
    setToast(`${productById(item.productId)?.name ?? "Món"} đã vào giỏ hàng.`);
    setView("cart");
  };
  const updateQuantity = (key: string, quantity: number) => setCart((current) => quantity < 1 ? current.filter((item) => item.key !== key) : current.map((item) => item.key === key ? { ...item, quantity: Math.min(20, quantity) } : item));
  const completeOrder = (nextOrder: MockOrder) => {
    try { saveOrder(nextOrder); } catch { setStorageError("Đơn đã tạo nhưng không thể lưu vào lịch sử trên thiết bị."); }
    setOrder(nextOrder); setCart([]); setView("success");
  };
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">Bỏ qua điều hướng</a>
      <Header cartCount={cartCount} onNavigate={navigate} onOpenMenu={openMenu} />
      {storageError && <div className="status-banner" role="status"><span>{storageError}</span><button type="button" onClick={() => setStorageError("")}>Đóng</button></div>}
      {view === "home" && <HomeView onOpenMenu={openMenu} onSelectProduct={openProduct} />}
      {view === "menu" && <MenuView initialCategory={initialCategory} onSelectProduct={openProduct} />}
      {view === "product" && selectedProduct && <ProductView product={selectedProduct} onBack={() => setView("menu")} onAdd={addToCart} />}
      {view === "cart" && <CartView items={cart} onUpdate={updateQuantity} onRemove={(key) => setCart((current) => current.filter((item) => item.key !== key))} onMenu={() => openMenu()} onCheckout={() => navigate("checkout")} />}
      {view === "checkout" && <CheckoutView items={cart} onBack={() => setView("cart")} onSuccess={completeOrder} />}
      {view === "success" && order && <SuccessView order={order} onHome={() => setView("home")} />}
      {view !== "checkout" && view !== "success" && <Footer onNavigate={navigate} />}
      <div className="toast" role="status" aria-live="polite" aria-atomic="true">{toast}</div>
    </div>
  );
}
