# Trà Sữa Ngon

Website thương mại điện tử responsive bằng tiếng Việt cho thương hiệu trà sữa hư cấu `Trà Sữa Ngon`. Dự án dùng React 19, TypeScript, Vinext/Vite và Cloudflare Workers/D1.

## Chạy local

Yêu cầu Node.js `22.13.0` trở lên.

```bash
npm ci
npm run db:migrate:local
npm run dev
```

Mở địa chỉ được in trong terminal, mặc định là [http://localhost:3000](http://localhost:3000).

Development dùng `http://localhost:3000`. Production cần đặt `SITE_URL` thành hostname `workers.dev` thực tế sau khi nhóm chốt Worker name và account subdomain. Project không tự deploy.

### Mở trên điện thoại hoặc tablet cùng Wi-Fi

`npm run dev` bind development server vào các giao diện mạng local. Terminal sẽ in thêm dòng `Network`, ví dụ:

```text
Network: http://192.168.x.x:3000/
```

Mở đúng URL `Network` đó trên điện thoại/tablet đang kết nối cùng Wi-Fi với máy chạy project. Không dùng `localhost` trên điện thoại vì khi đó `localhost` trỏ về chính điện thoại.

Nếu thiết bị vẫn không kết nối được:

- Chọn **Allow access** cho Node.js trên mạng **Private** khi Windows Firewall hỏi.
- Kiểm tra máy tính và điện thoại cùng Wi-Fi, đồng thời tắt guest/client isolation trên router nếu có.
- Không mở cổng router hoặc dùng development server này như production. Truy cập từ Internet cần một deployment được phê duyệt riêng.

Kiểm tra production build:

```bash
npm run build
npm run lint
npm run typecheck
npm test
```

## Khởi tạo admin local

Sau khi áp dụng migration, tạo tài khoản quản trị trong terminal tương tác:

```bash
npm run admin:create
```

Lệnh yêu cầu mật khẩu tối thiểu 12 ký tự, không hiển thị mật khẩu khi nhập và chỉ ghi password hash vào D1 local. Script từ chối `--remote`; tài khoản production cần quy trình phê duyệt riêng.

Mở [http://localhost:3000/admin/login](http://localhost:3000/admin/login) để đăng nhập.

## Cấu hình Geoapify

Sao chép `.env.example` thành `.env.local`, sau đó điền secret do bạn tự tạo trên Geoapify:

```dotenv
GEOAPIFY_API_KEY=
SITE_URL=http://localhost:3000
```

Không đặt key trong code frontend. Route server đọc key ở runtime và chỉ trả về dữ liệu địa chỉ tối giản. `.env*` được ignore, riêng `.env.example` được phép lưu cùng source.

Khi build/deploy production được phê duyệt, đặt `SITE_URL=https://<worker-name>.<account-subdomain>.workers.dev`. Không ghi hostname giả vào source; thay hai phần trong dấu `<...>` bằng giá trị Cloudflare thực tế.

## Luồng chính

- Trang chủ với hero, danh mục, sản phẩm bán chạy, lợi ích và câu chuyện thương hiệu.
- Catalogue có tìm kiếm, lọc danh mục, sắp xếp và empty state.
- Chi tiết món cho phép chọn size, đường, đá, topping và số lượng; giá cập nhật theo lựa chọn.
- Giỏ hàng có tăng, giảm, xoá và tự lưu trên thiết bị.
- Checkout có validation tiếng Việt, autocomplete địa chỉ Việt Nam với debounce, tiền mặt và QR mô phỏng.
- Backend đối chiếu sản phẩm, topping và giá nội bộ, ghi đơn `pending` vào D1, sau đó xác nhận thành `confirmed` mà không đánh dấu QR mô phỏng là `paid`.
- Trang thành công lưu bản sao tối đa 10 đơn gần nhất trên thiết bị để người dùng xem lại trong môi trường local.
- Khu vực `/admin` có đăng nhập server-side, dashboard, danh sách, tìm kiếm/lọc/phân trang, chi tiết, state transition, xác nhận COD và audit log.

## Cấu trúc

```text
app/
  admin/                      Login, dashboard, danh sách và chi tiết đơn
  api/admin/                  Authentication và API vận hành đơn hàng
  api/address-suggestions/  Proxy Geoapify phía server
  api/menu/                 Catalogue và pricing nội bộ dạng JSON
  api/orders/               Tạo và xác nhận đơn mô phỏng
  components/TeaShop.tsx  Toàn bộ các surface và tương tác mua hàng
  data/products.ts        Catalogue, danh mục, topping và định dạng giá nội bộ
  data/pricing.ts         Phụ phí size và phí giao hàng mẫu
  lib/checkout-api.ts     Client adapter cho autocomplete và order API
  lib/storage.ts          Adapter localStorage cho cart và đơn mô phỏng
  server/auth/            Password hash, session, CSRF và rate limit
  server/admin/           Query, state transition, COD và audit
  server/orders/          Order service và D1 repository adapter
  server/payments/        PaymentProvider cho COD và QR mô phỏng
  server/site-config.ts   Nguồn canonical URL dùng chung cho metadata và SEO
  types.ts                Kiểu dữ liệu sản phẩm, cart và checkout
  globals.css             Design tokens, component styles và responsive rules
  layout.tsx              Metadata, social preview và ngôn ngữ tài liệu
db/schema.ts               Schema D1/Drizzle
drizzle/                   Migration D1 đã sinh và kiểm tra
scripts/create-admin.ts    Tạo tài khoản admin local an toàn
scripts/migrate-local.ts   Áp dụng migration và tối ưu D1 local
wrangler.jsonc             Binding D1 local và khung Workers
public/images/            Ảnh sản phẩm, nguyên liệu và social card đã tạo
PRODUCT.md                Bối cảnh sản phẩm lâu dài
DESIGN.md                 Hệ thống nhận diện được ghi lại sau kiểm thử
docs/PAYMENT_PROVIDERS.md Hướng dẫn seam tích hợp cổng thanh toán thật
docs/URL_AUDIT.md         Kiểm kê URL trước khi chuyển canonical production
docs/DOMAIN_SETUP.md      Hướng dẫn domain, biến môi trường và redirect cần xác nhận
docs/PRODUCTION_DOMAIN_MIGRATION.md Audit môi trường, URL, hosting và trạng thái DNS/HTTPS
docs/RESPONSIVE_TEST_REPORT.md Báo cáo viewport và trình duyệt đã kiểm tra
docs/ADMIN_TEST_REPORT.md  Kết quả auth/admin integration và browser QA
```

Catalogue và giá nằm trong `app/data`, không lấy từ FakeStoreAPI hoặc Open Food Facts. Backend luôn tính lại giá từ nguồn nội bộ thay vì tin `unitPrice` do frontend gửi lên.

## API nội bộ

- `GET /api/menu`
- `GET /api/address-suggestions?q=<dia-chi>`
- `POST /api/orders`
- `POST /api/orders/:id/confirm`
- `POST /api/admin/auth/login`
- `POST /api/admin/auth/logout`
- `GET /api/admin/auth/session`
- `GET /api/admin/dashboard`
- `GET /api/admin/orders`
- `GET /api/admin/orders/:id`
- `PATCH /api/admin/orders/:id/status`
- `POST /api/admin/orders/:id/payments/cod-confirmation`

Endpoint địa chỉ gọi Geoapify Address Autocomplete với `filter=countrycode:vn`, `limit=5` và chỉ trả `label`, `province`, `district`, `latitude`, `longitude`. Khi thiếu key, sai key, timeout hoặc không có kết quả, checkout vẫn cho nhập địa chỉ thủ công.

## Dữ liệu cục bộ

- Giỏ hàng: `tra-sua-ngon:cart:v1`
- Đơn mô phỏng: `tra-sua-ngon:orders:v1`

Giỏ hàng là draft theo thiết bị nên tiếp tục dùng localStorage. D1 là nguồn dữ liệu chính cho đơn hàng, payment, history và audit; admin không đọc dữ liệu từ localStorage. `MemoryOrderRepository` chỉ còn là Adapter phục vụ test có chủ đích.

## Giới hạn thanh toán

Checkout chỉ là mô phỏng. Dự án không tích hợp cổng thanh toán, không tạo giao dịch và không thu tiền. Mã QR chỉ là hình minh hoạ trong giao diện và không được dùng để chuyển khoản thật.

`PaymentProvider` có hai Adapter: `cash_on_delivery` khởi tạo `unpaid`, còn `mock_qr` luôn giữ `simulation_only`. Admin chỉ có thể xác nhận COD đã thu khi đơn đang giao hoặc đã hoàn tất; thao tác này được audit. Hướng tích hợp VNPay, MoMo và ZaloPay được mô tả trong `docs/PAYMENT_PROVIDERS.md`.

## Accessibility và responsive

- Nhãn form hiển thị đầy đủ, lỗi liên kết bằng `aria-describedby` và có validation summary.
- Focus keyboard rõ, skip link, touch target tối thiểu khoảng 44px.
- Contrast theo mục tiêu WCAG AA và trạng thái không chỉ dựa vào màu.
- Motion tắt khi người dùng bật `prefers-reduced-motion`.
- Không dùng `h-screen`; layout dùng nội dung tự nhiên và `min-height` ổn định.
- Breakpoint kiểm tra mục tiêu: 360px, 768px, 1024px và 1440px.

## Kiểm thử đã thực hiện

- Production build, 11 integration test, type check và lint chạy thành công trên Windows.
- Test bao phủ Geoapify hợp lệ tại Việt Nam, tối đa 5 kết quả, empty, lỗi mạng, thiếu key, sai key, validation địa chỉ, internal pricing, topping, COD, QR mô phỏng và secret scan trên frontend bundle.
- Luồng từ catalogue, cấu hình món, giỏ hàng, tải lại trang, checkout đến xác nhận đơn đã được kiểm tra trên trình duyệt Chromium tích hợp của Codex.
- Storefront đã được đo trên 16 viewport từ 320×568 đến 1920×1080. Admin login được kiểm tra lại ở 390×844, 768×1024, 1366×900 và 1920×1080; không tràn ngang, CTA mobile nằm trong first viewport và console sạch sau reload cuối.
- Các control dùng HTML native, có thứ tự DOM hợp lý, skip link và focus ring 3px. Lớp điều khiển của trình duyệt tích hợp không ghi nhận ổn định một traversal bàn phím tự động hoàn chỉnh, nên cần chạy thêm regression keyboard thủ công trước khi phát hành thật.
- Firefox, Safari, Edge và bản Chrome độc lập chưa có sẵn để kiểm tra trực tiếp trong môi trường này. Source dùng HTML, CSS và Web API tiêu chuẩn để giữ khả năng tương thích rộng.

## Hình ảnh

Ảnh trong `public/images` được tạo riêng cho thương hiệu hư cấu bằng built-in ImageGen. Prompt nguyên văn được lưu cạnh mỗi ảnh trong file `.json`. Không dùng logo hoặc ảnh của thương hiệu có thật.

Display face được self-host từ font Noto Sans có sẵn trong starter. Icon mũi tên, xác nhận và bốn danh mục dùng cùng component SVG nét mảnh nội bộ, không phát sinh dependency mới.

## Tài liệu quản trị

- [`docs/ADMIN_GUIDE.md`](docs/ADMIN_GUIDE.md): vận hành local, đăng nhập và xử lý đơn.
- [`docs/API_ADMIN.md`](docs/API_ADMIN.md): contract API quản trị.
- [`docs/DATABASE_SCHEMA.md`](docs/DATABASE_SCHEMA.md): schema, tiền, trạng thái và migration.
- [`docs/ADMIN_IMPLEMENTATION_PLAN.md`](docs/ADMIN_IMPLEMENTATION_PLAN.md): audit và quyết định kiến trúc.
- [`docs/ADMIN_TEST_REPORT.md`](docs/ADMIN_TEST_REPORT.md): test integration, responsive, console và phạm vi trình duyệt chưa kiểm tra trực tiếp.

## Triển khai

Dự án chỉ được triển khai local trong lần thay đổi này. Chưa tạo D1 production, tài khoản admin production hoặc deployment công khai. Các bước này cần phê duyệt riêng.
